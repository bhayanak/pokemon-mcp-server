import { describe, it, expect } from 'vitest'
import { PokemonFormatter } from '../src/utils/formatter.js'
import type {
  Pokemon,
  PokemonSpecies,
  PokemonType,
  Move,
  EvolutionChain,
  Item,
} from '../src/api/types.js'
import pikachuData from './fixtures/pokemon-pikachu.json'
import speciesData from './fixtures/species-pikachu.json'
import typeData from './fixtures/type-electric.json'
import moveData from './fixtures/move-thunderbolt.json'
import chainData from './fixtures/evolution-chain.json'

describe('PokemonFormatter', () => {
  const pokemon = pikachuData as unknown as Pokemon
  const species = speciesData as unknown as PokemonSpecies

  describe('formatPokemon', () => {
    it('includes dex number and name', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('#025')
      expect(result).toContain('Pikachu')
    })

    it('includes type with emoji', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('Electric')
      expect(result).toContain('⚡')
    })

    it('includes base stats', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('HP')
      expect(result).toContain('35')
      expect(result).toContain('Speed')
      expect(result).toContain('90')
    })

    it('includes abilities', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('Static')
      expect(result).toContain('Lightning Rod (hidden)')
    })

    it('includes genus/category', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('Mouse Pokémon')
    })

    it('includes catch rate', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('Catch Rate: 190')
    })

    it('includes BST', () => {
      const result = PokemonFormatter.formatPokemon(pokemon, species)
      expect(result).toContain('Total: 320')
    })
  })

  describe('formatType', () => {
    it('includes type name and emoji', () => {
      const result = PokemonFormatter.formatType(typeData as unknown as PokemonType)
      expect(result).toContain('Electric')
      expect(result).toContain('⚡')
    })

    it('includes damage relations', () => {
      const result = PokemonFormatter.formatType(typeData as unknown as PokemonType)
      expect(result).toContain('Super effective against')
      expect(result).toContain('Not very effective against')
    })
  })

  describe('formatMove', () => {
    it('includes move name and type', () => {
      const result = PokemonFormatter.formatMove(moveData as unknown as Move)
      expect(result).toContain('Thunderbolt')
      expect(result).toContain('Electric')
      expect(result).toContain('Special')
    })

    it('includes power and accuracy', () => {
      const result = PokemonFormatter.formatMove(moveData as unknown as Move)
      expect(result).toContain('90')
      expect(result).toContain('100%')
    })

    it('replaces effect_chance placeholder', () => {
      const result = PokemonFormatter.formatMove(moveData as unknown as Move)
      expect(result).toContain('10%')
      expect(result).not.toContain('$effect_chance')
    })

    it('includes learned by pokemon', () => {
      const result = PokemonFormatter.formatMove(moveData as unknown as Move)
      expect(result).toContain('Pikachu')
    })
  })

  describe('formatEvolutionChain', () => {
    it('includes all species in chain', () => {
      const result = PokemonFormatter.formatEvolutionChain(chainData as unknown as EvolutionChain)
      expect(result).toContain('Pichu')
      expect(result).toContain('Pikachu')
      expect(result).toContain('Raichu')
    })

    it('includes evolution conditions', () => {
      const result = PokemonFormatter.formatEvolutionChain(chainData as unknown as EvolutionChain)
      expect(result).toContain('Happiness')
      expect(result).toContain('Thunder Stone')
    })
  })

  describe('formatComparison', () => {
    it('creates comparison table', () => {
      const pokemon2 = {
        ...pokemon,
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
      } as unknown as Pokemon

      const result = PokemonFormatter.formatComparison([pokemon, pokemon2])
      expect(result).toContain('Pikachu')
      expect(result).toContain('Charizard')
      expect(result).toContain('BST')
    })
  })

  describe('formatTypeCoverage', () => {
    it('shows offensive coverage', () => {
      const result = PokemonFormatter.formatTypeCoverage([pokemon])
      expect(result).toContain('Offensive Coverage')
      expect(result).toContain('Super effective against')
    })

    it('shows defensive weaknesses', () => {
      const result = PokemonFormatter.formatTypeCoverage([pokemon])
      expect(result).toContain('Defensive Weaknesses')
    })
  })

  describe('formatItem', () => {
    it('formats item correctly', () => {
      const item: Item = {
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
      const result = PokemonFormatter.formatItem(item)
      expect(result).toContain('Master Ball')
      expect(result).toContain('Not purchasable')
      expect(result).toContain('Catches a wild Pokémon without fail.')
    })
  })
})
