import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PokeApiClient } from '../src/api/client.js'
import type { PokeApiConfig } from '../src/api/types.js'

const defaultConfig: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('PokeApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches pokemon and caches result', async () => {
    const mockData = { id: 25, name: 'pikachu' }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    const client = new PokeApiClient(defaultConfig)
    const result = await client.getPokemon('pikachu')
    expect(result).toEqual(mockData)
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    // Second call should use cache
    const result2 = await client.getPokemon('pikachu')
    expect(result2).toEqual(mockData)
    expect(fetchSpy).toHaveBeenCalledTimes(1) // not called again
  })

  it('throws on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const client = new PokeApiClient(defaultConfig)
    await expect(client.getPokemon('fakemon')).rejects.toThrow('Not found')
  })

  it('throws on non-404 errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    const client = new PokeApiClient(defaultConfig)
    await expect(client.getPokemon('pikachu')).rejects.toThrow('API error 500')
  })

  it('URL encodes parameters', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const client = new PokeApiClient(defaultConfig)
    await client.getPokemon('mr-mime')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/pokemon/mr-mime'),
      expect.any(Object),
    )
  })
})
