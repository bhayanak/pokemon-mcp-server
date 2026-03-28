import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const getSpeciesSchema = z.object({
  nameOrId: z.union([z.string(), z.number()]).describe('Species name or National Dex ID'),
})

export async function getSpecies(
  client: PokeApiClient,
  input: z.infer<typeof getSpeciesSchema>,
  lang: string,
): Promise<string> {
  const species = await client.getSpecies(input.nameOrId)
  const pokemon = await client.getPokemon(species.name)
  return PokemonFormatter.formatPokemon(pokemon, species, lang)
}
