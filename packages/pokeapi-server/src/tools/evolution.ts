import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const getEvolutionChainSchema = z.object({
  pokemon: z.string().describe('Pokémon name to find evolution chain for'),
})

export async function getEvolutionChain(
  client: PokeApiClient,
  input: z.infer<typeof getEvolutionChainSchema>,
): Promise<string> {
  const species = await client.getSpecies(input.pokemon)
  const chainUrl = species.evolution_chain.url
  const chainId = parseInt(chainUrl.match(/\/(\d+)\/?$/)?.[1] ?? '0', 10)

  if (!chainId) {
    throw new Error(`Could not extract evolution chain ID for ${input.pokemon}`)
  }

  const chain = await client.getEvolutionChain(chainId)
  return PokemonFormatter.formatEvolutionChain(chain)
}
