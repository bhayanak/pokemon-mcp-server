import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const getAbilitySchema = z.object({
  nameOrId: z
    .union([z.string(), z.number()])
    .describe('Ability name (lowercase, hyphenated) or ID'),
})

export async function getAbility(
  client: PokeApiClient,
  input: z.infer<typeof getAbilitySchema>,
  lang: string,
): Promise<string> {
  const ability = await client.getAbility(input.nameOrId)
  return PokemonFormatter.formatAbility(ability, lang)
}
