import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PokeApiClient } from '../src/api/client.js'
import { pokemonGet, pokemonSearch } from '../src/tools/pokemon.js'
import { getAbility } from '../src/tools/abilities.js'
import { compare, typeCoverage } from '../src/tools/compare.js'
import { getSpecies } from '../src/tools/species.js'
import { getItem } from '../src/tools/items.js'
import { searchMoves } from '../src/tools/moves.js'
import { getType } from '../src/tools/types.js'
import type { PokeApiConfig } from '../src/api/types.js'
import pikachuData from './fixtures/pokemon-pikachu.json'
import speciesData from './fixtures/species-pikachu.json'
import moveData from './fixtures/move-thunderbolt.json'
import typeData from './fixtures/type-electric.json'

const config: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('pokemonGet tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and formats pokemon', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      const data = callCount === 1 ? pikachuData : speciesData
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await pokemonGet(client, { nameOrId: 'pikachu', includeMoveset: false }, 'en')
    expect(result).toContain('Pikachu')
    expect(result).toContain('#025')
  })

  it('includes moveset when requested', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      const data = callCount === 1 ? pikachuData : speciesData
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await pokemonGet(client, { nameOrId: 'pikachu', includeMoveset: true }, 'en')
    expect(result).toContain('Moves:')
    expect(result).toContain('Machine')
    expect(result).toContain('Thunderbolt')
  })
})

describe('pokemonSearch tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('searches by type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(typeData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await pokemonSearch(client, { type: 'electric', limit: 20, offset: 0 })
    expect(result).toContain('Pokémon with type "electric"')
    expect(result).toContain('pikachu')
  })

  it('searches by generation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          pokemon_species: [
            { name: 'bulbasaur', url: '' },
            { name: 'charmander', url: '' },
            { name: 'squirtle', url: '' },
          ],
        }),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await pokemonSearch(client, { generation: 1, limit: 20, offset: 0 })
    expect(result).toContain('Generation 1')
    expect(result).toContain('bulbasaur')
  })

  it('browses full list without filters', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          count: 1300,
          next: null,
          previous: null,
          results: [
            { name: 'bulbasaur', url: '' },
            { name: 'ivysaur', url: '' },
          ],
        }),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await pokemonSearch(client, { limit: 2, offset: 0 })
    expect(result).toContain('Pokémon (1300 total)')
    expect(result).toContain('bulbasaur')
    expect(result).toContain('... and 1298 more')
  })
})

describe('getAbility tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and formats ability', async () => {
    const abilityData = {
      id: 9,
      name: 'static',
      is_main_series: true,
      generation: { name: 'generation-iii', url: '' },
      effect_entries: [
        {
          effect: 'Has a 30% chance of paralyzing attacking Pokémon on contact.',
          short_effect: '30% chance to paralyze on contact.',
          language: { name: 'en', url: '' },
        },
      ],
      pokemon: [
        { is_hidden: false, slot: 1, pokemon: { name: 'pikachu', url: '' } },
        { is_hidden: true, slot: 3, pokemon: { name: 'emolga', url: '' } },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(abilityData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await getAbility(client, { nameOrId: 'static' }, 'en')
    expect(result).toContain('Static')
    expect(result).toContain('30% chance')
    expect(result).toContain('Pikachu')
    expect(result).toContain('Emolga (hidden)')
  })
})

describe('compare tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('compares multiple pokemon', async () => {
    const charizardData = {
      ...pikachuData,
      id: 6,
      name: 'charizard',
      types: [
        { slot: 1, type: { name: 'fire', url: '' } },
        { slot: 2, type: { name: 'flying', url: '' } },
      ],
      stats: [
        { stat: { name: 'hp', url: '' }, effort: 0, base_stat: 78 },
        { stat: { name: 'attack', url: '' }, effort: 0, base_stat: 84 },
        { stat: { name: 'defense', url: '' }, effort: 0, base_stat: 78 },
        { stat: { name: 'special-attack', url: '' }, effort: 0, base_stat: 109 },
        { stat: { name: 'special-defense', url: '' }, effort: 0, base_stat: 85 },
        { stat: { name: 'speed', url: '' }, effort: 0, base_stat: 100 },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      const data = urlStr.includes('pikachu') ? pikachuData : charizardData
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await compare(client, { pokemon: ['pikachu', 'charizard'] })
    expect(result).toContain('Pikachu')
    expect(result).toContain('Charizard')
    expect(result).toContain('BST')
  })
})

describe('typeCoverage tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('analyzes team type coverage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(pikachuData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await typeCoverage(client, { team: ['pikachu'] })
    expect(result).toContain('Type Coverage Analysis')
    expect(result).toContain('Offensive Coverage')
    expect(result).toContain('Defensive Weaknesses')
  })
})

describe('getSpecies tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches species then pokemon and formats', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(callCount === 1 ? speciesData : pikachuData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await getSpecies(client, { nameOrId: 'pikachu' }, 'en')
    expect(result).toContain('Pikachu')
    expect(result).toContain('Mouse Pokémon')
  })
})

describe('getItem tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and formats item', async () => {
    const itemData = {
      id: 1,
      name: 'master-ball',
      cost: 0,
      category: { name: 'standard-balls', url: '' },
      effect_entries: [
        {
          effect: 'Catches a wild Pokémon every time.',
          short_effect: 'Catches a wild Pokémon without fail.',
          language: { name: 'en', url: '' },
        },
      ],
      sprites: { default: null },
      fling_power: 10,
      fling_effect: null,
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(itemData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await getItem(client, { nameOrId: 'master-ball' }, 'en')
    expect(result).toContain('Master Ball')
    expect(result).toContain('Not purchasable')
  })
})

describe('getType tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and formats type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(typeData),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await getType(client, { type: 'electric' })
    expect(result).toContain('Electric')
    expect(result).toContain('Super effective against')
  })
})

describe('searchMoves tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('searches and filters moves', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              results: [{ name: 'thunderbolt', url: '' }],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(moveData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { type: 'electric', limit: 20 })
    expect(result).toContain('type=electric')
    expect(result).toContain('Thunderbolt')
  })

  it('filters by damage class', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              results: [{ name: 'thunderbolt', url: '' }],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(moveData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { damageClass: 'special', limit: 20 })
    expect(result).toContain('class=special')
    expect(result).toContain('Thunderbolt')
  })

  it('filters by power range', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              results: [{ name: 'thunderbolt', url: '' }],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(moveData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { minPower: 80, maxPower: 100, limit: 20 })
    expect(result).toContain('power≥80')
    expect(result).toContain('power≤100')
    expect(result).toContain('Thunderbolt')
  })

  it('filters by generation (roman numeral)', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              results: [{ name: 'thunderbolt', url: '' }],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(moveData),
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { generation: 1, limit: 20 })
    expect(result).toContain('gen=1')
    expect(result).toContain('Thunderbolt')
  })

  it('handles fetch errors gracefully', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              count: 1,
              results: [{ name: 'bad-move', url: '' }],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
    })

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { limit: 20 })
    expect(result).toContain('0 found')
  })

  it('shows no filter string when no filters applied', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 0, results: [] }),
    } as Response)

    const client = new PokeApiClient(config)
    const result = await searchMoves(client, { limit: 20 })
    expect(result).toContain('Moves: 0 found')
  })
})

describe('PokeApiClient additional methods', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getSpecies calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(speciesData),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getSpecies('pikachu')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/pokemon-species/pikachu'),
      expect.any(Object),
    )
  })

  it('getType calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(typeData),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getType('electric')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/type/electric'),
      expect.any(Object),
    )
  })

  it('getAbility calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getAbility('static')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/ability/static'),
      expect.any(Object),
    )
  })

  it('getEvolutionChain calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getEvolutionChain(10)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/evolution-chain/10'),
      expect.any(Object),
    )
  })

  it('getItem calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getItem('master-ball')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/item/master-ball'),
      expect.any(Object),
    )
  })

  it('getResourceList calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 0, results: [] }),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getResourceList('pokemon', 10, 5)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/pokemon?limit=10&offset=5'),
      expect.any(Object),
    )
  })

  it('getMove calls correct endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(moveData),
    } as Response)

    const client = new PokeApiClient(config)
    await client.getMove('thunderbolt')
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/move/thunderbolt'),
      expect.any(Object),
    )
  })
})
