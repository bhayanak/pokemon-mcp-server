import { describe, it, expect } from 'vitest'
import { PokemonFormatter } from '../src/utils/formatter.js'
import type { Pokemon, PokemonSpecies, Move, Ability, Item } from '../src/api/types.js'
import pikachuData from './fixtures/pokemon-pikachu.json'
import speciesData from './fixtures/species-pikachu.json'

const pokemon = pikachuData as unknown as Pokemon
const species = speciesData as unknown as PokemonSpecies

describe('PokemonFormatter edge cases', () => {
  it('formats legendary pokemon with tag', () => {
    const legendarySpecies = {
      ...speciesData,
      is_legendary: true,
      is_mythical: false,
      is_baby: false,
    } as unknown as PokemonSpecies

    const result = PokemonFormatter.formatPokemon(pokemon, legendarySpecies)
    expect(result).toContain('[Legendary]')
  })

  it('formats mythical pokemon with tag', () => {
    const mythicalSpecies = {
      ...speciesData,
      is_legendary: false,
      is_mythical: true,
      is_baby: false,
    } as unknown as PokemonSpecies

    const result = PokemonFormatter.formatPokemon(pokemon, mythicalSpecies)
    expect(result).toContain('[Mythical]')
  })

  it('formats baby pokemon with tag', () => {
    const babySpecies = {
      ...speciesData,
      is_legendary: false,
      is_mythical: false,
      is_baby: true,
    } as unknown as PokemonSpecies

    const result = PokemonFormatter.formatPokemon(pokemon, babySpecies)
    expect(result).toContain('[Baby]')
  })

  it('handles missing genus gracefully', () => {
    const noGenusSpecies = {
      ...speciesData,
      genera: [],
    } as unknown as PokemonSpecies

    const result = PokemonFormatter.formatPokemon(pokemon, noGenusSpecies)
    expect(result).toContain('Pikachu')
  })

  it('handles missing flavor text', () => {
    const noFlavorSpecies = {
      ...speciesData,
      flavor_text_entries: [],
    } as unknown as PokemonSpecies

    const result = PokemonFormatter.formatPokemon(pokemon, noFlavorSpecies)
    expect(result).toContain('Pikachu')
    expect(result).not.toContain('Flavor Text')
  })

  it('formatStats returns stats string', () => {
    const result = PokemonFormatter.formatStats(pokemon.stats)
    expect(result).toContain('HP')
    expect(result).toContain('Speed')
  })

  it('formats move without effect chance', () => {
    const move: Move = {
      id: 1,
      name: 'tackle',
      accuracy: 100,
      power: 40,
      pp: 35,
      priority: 0,
      type: { name: 'normal', url: '' },
      damage_class: { name: 'physical', url: '' },
      effect_entries: [
        {
          effect: 'A basic attack.',
          short_effect: 'A basic attack.',
          language: { name: 'en', url: '' },
        },
      ],
      effect_chance: null,
      generation: { name: 'generation-i', url: '' },
      learned_by_pokemon: [{ name: 'bulbasaur', url: '' }],
    }
    const result = PokemonFormatter.formatMove(move)
    expect(result).toContain('Tackle')
    expect(result).toContain('40')
    expect(result).toContain('Physical')
  })

  it('formats move with no power/accuracy (status move)', () => {
    const move: Move = {
      id: 100,
      name: 'growl',
      accuracy: null,
      power: null,
      pp: 40,
      priority: 0,
      type: { name: 'normal', url: '' },
      damage_class: { name: 'status', url: '' },
      effect_entries: [],
      effect_chance: null,
      generation: { name: 'generation-i', url: '' },
      learned_by_pokemon: [],
    }
    const result = PokemonFormatter.formatMove(move)
    expect(result).toContain('—')
    expect(result).toContain('No description available.')
  })

  it('formats ability with no effect entries', () => {
    const ability: Ability = {
      id: 1,
      name: 'some-ability',
      is_main_series: true,
      generation: { name: 'generation-i', url: '' },
      effect_entries: [],
      pokemon: [],
    }
    const result = PokemonFormatter.formatAbility(ability)
    expect(result).toContain('Some Ability')
    expect(result).toContain('No description available.')
  })

  it('formats ability with many pokemon (truncation)', () => {
    const pokemon = Array.from({ length: 15 }, (_, i) => ({
      is_hidden: false,
      slot: 1,
      pokemon: { name: `pokemon-${i}`, url: '' },
    }))
    const ability: Ability = {
      id: 1,
      name: 'test-ability',
      is_main_series: true,
      generation: { name: 'generation-i', url: '' },
      effect_entries: [{ effect: 'test', short_effect: 'test', language: { name: 'en', url: '' } }],
      pokemon,
    }
    const result = PokemonFormatter.formatAbility(ability)
    expect(result).toContain('... and 5 more')
  })

  it('formats item with cost', () => {
    const item: Item = {
      id: 4,
      name: 'poke-ball',
      cost: 200,
      category: { name: 'standard-balls', url: '' },
      effect_entries: [
        {
          effect: 'Catches pokemon.',
          short_effect: 'Catches pokemon.',
          language: { name: 'en', url: '' },
        },
      ],
      sprites: { default: null },
      fling_power: null,
      fling_effect: null,
    }
    const result = PokemonFormatter.formatItem(item)
    expect(result).toContain('₽200')
    expect(result).not.toContain('Not purchasable')
    expect(result).not.toContain('Fling Power')
  })

  it('formats dual-type pokemon', () => {
    const dualTypePokemon = {
      ...pikachuData,
      types: [
        { slot: 1, type: { name: 'fire', url: '' } },
        { slot: 2, type: { name: 'flying', url: '' } },
      ],
    } as unknown as Pokemon

    const result = PokemonFormatter.formatPokemon(dualTypePokemon, species)
    expect(result).toContain('Fire')
    expect(result).toContain('Flying')
  })

  it('formatTypeCoverage shows good coverage message', () => {
    // Create a team that covers many types
    const fireWaterGrass = [
      {
        ...pikachuData,
        name: 'fire-mon',
        types: [{ slot: 1, type: { name: 'fire', url: '' } }],
      },
      {
        ...pikachuData,
        name: 'water-mon',
        types: [{ slot: 1, type: { name: 'water', url: '' } }],
      },
      {
        ...pikachuData,
        name: 'fighting-mon',
        types: [{ slot: 1, type: { name: 'fighting', url: '' } }],
      },
      {
        ...pikachuData,
        name: 'ground-mon',
        types: [{ slot: 1, type: { name: 'ground', url: '' } }],
      },
      {
        ...pikachuData,
        name: 'flying-mon',
        types: [{ slot: 1, type: { name: 'flying', url: '' } }],
      },
      {
        ...pikachuData,
        name: 'ice-mon',
        types: [{ slot: 1, type: { name: 'ice', url: '' } }],
      },
    ] as unknown as Pokemon[]

    const result = PokemonFormatter.formatTypeCoverage(fireWaterGrass)
    expect(result).toContain('Team of 6')
    expect(result).toContain('Offensive Coverage')
  })

  it('formatMove truncates learned_by with more indicator', () => {
    const move: Move = {
      id: 85,
      name: 'thunderbolt',
      accuracy: 100,
      power: 90,
      pp: 15,
      priority: 0,
      type: { name: 'electric', url: '' },
      damage_class: { name: 'special', url: '' },
      effect_entries: [{ effect: 'zaps', short_effect: 'zaps', language: { name: 'en', url: '' } }],
      effect_chance: null,
      generation: { name: 'generation-i', url: '' },
      learned_by_pokemon: Array.from({ length: 10 }, (_, i) => ({ name: `mon-${i}`, url: '' })),
    }
    const result = PokemonFormatter.formatMove(move)
    expect(result).toContain('... and 5 more')
  })
})
