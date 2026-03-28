import { describe, it, expect } from 'vitest'
import { typeMatchup } from '../src/tools/types.js'
import { PokeApiClient } from '../src/api/client.js'
import type { PokeApiConfig } from '../src/api/types.js'

const config: PokeApiConfig = {
  baseUrl: 'https://pokeapi.co/api/v2',
  cacheTtlMs: 86400000,
  cacheMaxSize: 500,
  timeoutMs: 10000,
  language: 'en',
}

describe('typeMatchup tool', () => {
  const client = new PokeApiClient(config)

  it('calculates super effective matchup', async () => {
    const result = await typeMatchup(client, {
      attackingType: 'fire',
      defendingTypes: ['grass'],
    })
    expect(result).toContain('2x')
    expect(result).toContain('Super Effective')
  })

  it('calculates dual type 4x matchup', async () => {
    const result = await typeMatchup(client, {
      attackingType: 'electric',
      defendingTypes: ['water', 'flying'],
    })
    expect(result).toContain('4x')
    expect(result).toContain('Super Effective!')
    expect(result).toContain('Combined')
  })

  it('calculates immune matchup', async () => {
    const result = await typeMatchup(client, {
      attackingType: 'normal',
      defendingTypes: ['ghost'],
    })
    expect(result).toContain('No Effect')
  })

  it('calculates not very effective matchup', async () => {
    const result = await typeMatchup(client, {
      attackingType: 'fire',
      defendingTypes: ['water'],
    })
    expect(result).toContain('Not Very Effective')
  })
})
