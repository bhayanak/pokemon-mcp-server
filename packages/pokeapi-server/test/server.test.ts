import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createServer } from '../src/server.js'
import { loadConfig } from '../src/config.js'
import type { PokeApiConfig } from '../src/api/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import pikachuData from './fixtures/pokemon-pikachu.json'
import speciesData from './fixtures/species-pikachu.json'
import typeData from './fixtures/type-electric.json'
import moveData from './fixtures/move-thunderbolt.json'
import chainData from './fixtures/evolution-chain.json'

const defaultConfig: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('createServer', () => {
  it('creates an MCP server instance', () => {
    const server = createServer(defaultConfig)
    expect(server).toBeDefined()
  })
})

describe('loadConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns defaults when no env vars set', () => {
    delete process.env.POKEAPI_MCP_BASE_URL
    delete process.env.POKEAPI_MCP_CACHE_TTL_MS
    delete process.env.POKEAPI_MCP_CACHE_MAX_SIZE
    delete process.env.POKEAPI_MCP_TIMEOUT_MS
    delete process.env.POKEAPI_MCP_LANGUAGE

    const config = loadConfig()
    expect(config.baseUrl).toBe('https://pokeapi.co/api/v2')
    expect(config.cacheTtlMs).toBe(86400000)
    expect(config.cacheMaxSize).toBe(500)
    expect(config.timeoutMs).toBe(10000)
    expect(config.language).toBe('en')
  })

  it('reads custom env vars', () => {
    process.env.POKEAPI_MCP_BASE_URL = 'https://custom.api.com/v2'
    process.env.POKEAPI_MCP_CACHE_TTL_MS = '3600000'
    process.env.POKEAPI_MCP_CACHE_MAX_SIZE = '100'
    process.env.POKEAPI_MCP_TIMEOUT_MS = '5000'
    process.env.POKEAPI_MCP_LANGUAGE = 'ja'

    const config = loadConfig()
    expect(config.baseUrl).toBe('https://custom.api.com/v2')
    expect(config.cacheTtlMs).toBe(3600000)
    expect(config.cacheMaxSize).toBe(100)
    expect(config.timeoutMs).toBe(5000)
    expect(config.language).toBe('ja')
  })
})

// Integration tests: exercise each tool handler through the MCP server
describe('MCP Server tool integration', () => {
  let client: Client
  let cleanup: () => Promise<void>

  beforeEach(async () => {
    // Mock all fetch calls
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      let data: unknown = {}
      if (urlStr.includes('/pokemon-species/') || urlStr.includes('pokemon-species')) {
        data = speciesData
      } else if (urlStr.includes('/pokemon/')) {
        data = pikachuData
      } else if (urlStr.includes('/type/')) {
        data = typeData
      } else if (urlStr.includes('/move/')) {
        data = moveData
      } else if (urlStr.includes('/ability/')) {
        data = {
          id: 9,
          name: 'static',
          is_main_series: true,
          generation: { name: 'generation-iii', url: '' },
          effect_entries: [
            { effect: 'test', short_effect: 'test', language: { name: 'en', url: '' } },
          ],
          pokemon: [{ is_hidden: false, slot: 1, pokemon: { name: 'pikachu', url: '' } }],
        }
      } else if (urlStr.includes('/evolution-chain/')) {
        data = chainData
      } else if (urlStr.includes('/item/')) {
        data = {
          id: 1,
          name: 'master-ball',
          cost: 0,
          category: { name: 'standard-balls', url: '' },
          effect_entries: [
            { effect: 'Catches', short_effect: 'Catches', language: { name: 'en', url: '' } },
          ],
          sprites: { default: null },
          fling_power: null,
          fling_effect: null,
        }
      } else if (urlStr.includes('?limit=')) {
        data = { count: 1, next: null, previous: null, results: [{ name: 'thunderbolt', url: '' }] }
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)
    })

    const server = createServer(defaultConfig)
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    client = new Client({ name: 'test-client', version: '1.0.0' })

    await server.connect(serverTransport)
    await client.connect(clientTransport)

    cleanup = async () => {
      await client.close()
      await server.close()
    }
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await cleanup()
  })

  it('pokemon_get returns pokemon data', async () => {
    const result = await client.callTool({
      name: 'pokemon_get',
      arguments: { nameOrId: 'pikachu' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Pikachu')
  })

  it('pokemon_search returns list', async () => {
    const result = await client.callTool({ name: 'pokemon_search', arguments: {} })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('thunderbolt')
  })

  it('pokemon_get_type returns type', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_type',
      arguments: { type: 'electric' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Electric')
  })

  it('pokemon_type_matchup returns effectiveness', async () => {
    const result = await client.callTool({
      name: 'pokemon_type_matchup',
      arguments: { attackingType: 'fire', defendingTypes: ['grass'] },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('2x')
  })

  it('pokemon_get_move returns move', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_move',
      arguments: { nameOrId: 'thunderbolt' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Thunderbolt')
  })

  it('pokemon_search_moves returns results', async () => {
    const result = await client.callTool({
      name: 'pokemon_search_moves',
      arguments: { type: 'electric' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('found')
  })

  it('pokemon_get_ability returns ability', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_ability',
      arguments: { nameOrId: 'static' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Static')
  })

  it('pokemon_get_evolution_chain returns chain', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_evolution_chain',
      arguments: { pokemon: 'pikachu' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Evolution Chain')
  })

  it('pokemon_get_species returns species', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_species',
      arguments: { nameOrId: 'pikachu' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Pikachu')
  })

  it('pokemon_get_item returns item', async () => {
    const result = await client.callTool({
      name: 'pokemon_get_item',
      arguments: { nameOrId: 'master-ball' },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Master Ball')
  })

  it('pokemon_compare returns comparison', async () => {
    const result = await client.callTool({
      name: 'pokemon_compare',
      arguments: { pokemon: ['pikachu', 'pikachu'] },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('BST')
  })

  it('pokemon_type_coverage returns coverage', async () => {
    const result = await client.callTool({
      name: 'pokemon_type_coverage',
      arguments: { team: ['pikachu'] },
    })
    const text = (result.content as { type: string; text: string }[])[0].text
    expect(text).toContain('Type Coverage Analysis')
  })
})
