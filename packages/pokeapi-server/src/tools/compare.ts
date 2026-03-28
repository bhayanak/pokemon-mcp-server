import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const compareSchema = z.object({
  pokemon: z.array(z.string()).min(2).max(4).describe('Pokémon names to compare'),
})

export async function compare(
  client: PokeApiClient,
  input: z.infer<typeof compareSchema>,
): Promise<string> {
  const pokemonList = await Promise.all(input.pokemon.map((name) => client.getPokemon(name)))
  return PokemonFormatter.formatComparison(pokemonList)
}

export const typeCoverageSchema = z.object({
  team: z.array(z.string()).min(1).max(6).describe('Pokémon names in the team'),
})

export async function typeCoverage(
  client: PokeApiClient,
  input: z.infer<typeof typeCoverageSchema>,
): Promise<string> {
  const pokemonList = await Promise.all(input.team.map((name) => client.getPokemon(name)))
  return PokemonFormatter.formatTypeCoverage(pokemonList)
}
