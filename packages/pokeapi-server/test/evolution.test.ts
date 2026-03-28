import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PokeApiClient } from '../src/api/client.js'
import { getEvolutionChain } from '../src/tools/evolution.js'
import type { PokeApiConfig } from '../src/api/types.js'
import speciesData from './fixtures/species-pikachu.json'
import chainData from './fixtures/evolution-chain.json'

const config: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('getEvolutionChain tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches species, then evolution chain', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(speciesData),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(chainData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await getEvolutionChain(client, { pokemon: 'pikachu' })
    expect(result).toContain('Pichu')
    expect(result).toContain('Pikachu')
    expect(result).toContain('Raichu')
    expect(result).toContain('Thunder Stone')
  })
})
