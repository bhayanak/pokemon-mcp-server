import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const getItemSchema = z.object({
  nameOrId: z.union([z.string(), z.number()]).describe('Item name (lowercase, hyphenated) or ID'),
})

export async function getItem(
  client: PokeApiClient,
  input: z.infer<typeof getItemSchema>,
  lang: string,
): Promise<string> {
  const item = await client.getItem(input.nameOrId)
  return PokemonFormatter.formatItem(item, lang)
}
