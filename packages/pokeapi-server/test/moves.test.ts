import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PokeApiClient } from '../src/api/client.js'
import { getMove } from '../src/tools/moves.js'
import type { PokeApiConfig } from '../src/api/types.js'
import moveData from './fixtures/move-thunderbolt.json'

const config: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('getMove tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and formats a move', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(moveData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await getMove(client, { nameOrId: 'thunderbolt' }, 'en')
    expect(result).toContain('Thunderbolt')
    expect(result).toContain('Electric')
    expect(result).toContain('Special')
    expect(result).toContain('90')
  })
})
