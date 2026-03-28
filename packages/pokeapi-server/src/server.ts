import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { PokeApiClient } from './api/client.js'
import type { PokeApiConfig } from './api/types.js'
import {
  pokemonGetSchema,
  pokemonGet,
  pokemonSearchSchema,
  pokemonSearch,
} from './tools/pokemon.js'
import { getTypeSchema, getType, typeMatchupSchema, typeMatchup } from './tools/types.js'
import { getMoveSchema, getMove, searchMovesSchema, searchMoves } from './tools/moves.js'
import { getAbilitySchema, getAbility } from './tools/abilities.js'
import { getEvolutionChainSchema, getEvolutionChain } from './tools/evolution.js'
import { getSpeciesSchema, getSpecies } from './tools/species.js'
import { getItemSchema, getItem } from './tools/items.js'
import { compareSchema, compare, typeCoverageSchema, typeCoverage } from './tools/compare.js'

export function createServer(config: PokeApiConfig): McpServer {
  const client = new PokeApiClient(config)
  const lang = config.language

  const server = new McpServer({
    name: 'pokeapi-mcp-server',
    version: '0.1.0',
  })

  // Tool 1: pokemon_get
  server.tool(
    'pokemon_get',
    'Retrieve detailed information about a Pokémon including stats, types, abilities, and moves.',
    pokemonGetSchema.shape,
    async (input) => {
      const text = await pokemonGet(client, input, lang)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 2: pokemon_search
  server.tool(
    'pokemon_search',
    'Search Pokémon by type, generation, or browse the full list.',
    pokemonSearchSchema.shape,
    async (input) => {
      const text = await pokemonSearch(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 3: pokemon_get_type
  server.tool(
    'pokemon_get_type',
    'Get type details including damage relations, resistances, and weaknesses.',
    getTypeSchema.shape,
    async (input) => {
      const text = await getType(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 4: pokemon_type_matchup
  server.tool(
    'pokemon_type_matchup',
    'Check type effectiveness of an attacking type against defending type(s).',
    typeMatchupSchema.shape,
    async (input) => {
      const text = await typeMatchup(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 5: pokemon_get_move
  server.tool(
    'pokemon_get_move',
    'Get detailed information about a move including power, accuracy, effect, and which Pokémon learn it.',
    getMoveSchema.shape,
    async (input) => {
      const text = await getMove(client, input, lang)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 6: pokemon_search_moves
  server.tool(
    'pokemon_search_moves',
    'Search moves by type, damage class, power range, or generation.',
    searchMovesSchema.shape,
    async (input) => {
      const text = await searchMoves(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 7: pokemon_get_ability
  server.tool(
    'pokemon_get_ability',
    'Get ability details including effect description and which Pokémon have it.',
    getAbilitySchema.shape,
    async (input) => {
      const text = await getAbility(client, input, lang)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 8: pokemon_get_evolution_chain
  server.tool(
    'pokemon_get_evolution_chain',
    'Get the full evolution chain for a Pokémon with evolution conditions and triggers.',
    getEvolutionChainSchema.shape,
    async (input) => {
      const text = await getEvolutionChain(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 9: pokemon_get_species
  server.tool(
    'pokemon_get_species',
    'Get species information including flavor text, habitat, egg groups, catch rate, and legendary/mythical status.',
    getSpeciesSchema.shape,
    async (input) => {
      const text = await getSpecies(client, input, lang)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 10: pokemon_get_item
  server.tool(
    'pokemon_get_item',
    'Get item details including category, cost, and effect.',
    getItemSchema.shape,
    async (input) => {
      const text = await getItem(client, input, lang)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 11: pokemon_compare
  server.tool(
    'pokemon_compare',
    'Compare 2-4 Pokémon side-by-side showing stats, types, and base stat totals.',
    compareSchema.shape,
    async (input) => {
      const text = await compare(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  // Tool 12: pokemon_type_coverage
  server.tool(
    'pokemon_type_coverage',
    'Analyze type coverage for a team of 1-6 Pokémon with offensive and defensive analysis.',
    typeCoverageSchema.shape,
    async (input) => {
      const text = await typeCoverage(client, input)
      return { content: [{ type: 'text', text }] }
    },
  )

  return server
}
