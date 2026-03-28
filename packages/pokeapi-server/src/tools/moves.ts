import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const getMoveSchema = z.object({
  nameOrId: z.union([z.string(), z.number()]).describe('Move name (lowercase, hyphenated) or ID'),
})

export async function getMove(
  client: PokeApiClient,
  input: z.infer<typeof getMoveSchema>,
  lang: string,
): Promise<string> {
  const move = await client.getMove(input.nameOrId)
  return PokemonFormatter.formatMove(move, lang)
}

export const searchMovesSchema = z.object({
  type: z.string().optional().describe('Filter by move type'),
  damageClass: z
    .enum(['physical', 'special', 'status'])
    .optional()
    .describe('Filter by damage class'),
  minPower: z.number().optional().describe('Minimum power'),
  maxPower: z.number().optional().describe('Maximum power'),
  generation: z.number().optional().describe('Filter by generation'),
  limit: z.number().optional().default(20).describe('Max results'),
})

export async function searchMoves(
  client: PokeApiClient,
  input: z.infer<typeof searchMovesSchema>,
): Promise<string> {
  // Fetch a batch of moves and filter
  const list = await client.getResourceList('move', 200, 0)
  const results: string[] = []

  // We need to fetch each move to filter — but limit to avoid excessive API calls
  const candidates = list.results.slice(0, 100)

  for (const entry of candidates) {
    if (results.length >= input.limit) break

    try {
      const move = await client.getMove(entry.name)

      if (input.type && move.type.name !== input.type.toLowerCase()) continue
      if (input.damageClass && move.damage_class.name !== input.damageClass) continue
      if (input.minPower !== undefined && (move.power === null || move.power < input.minPower))
        continue
      if (input.maxPower !== undefined && (move.power === null || move.power > input.maxPower))
        continue
      if (input.generation) {
        const gen = parseInt(move.generation.name.replace('generation-', ''), 10)
        if (isNaN(gen)) {
          // roman numeral extraction
          const romanMap: Record<string, number> = {
            i: 1,
            ii: 2,
            iii: 3,
            iv: 4,
            v: 5,
            vi: 6,
            vii: 7,
            viii: 8,
            ix: 9,
          }
          const roman = move.generation.name.replace('generation-', '')
          if (romanMap[roman] !== input.generation) continue
        } else if (gen !== input.generation) {
          continue
        }
      }

      const power = move.power ?? '—'
      const acc = move.accuracy ? `${move.accuracy}%` : '—'
      const name = entry.name
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      results.push(
        `  ${name} | ${move.type.name} | ${move.damage_class.name} | Power: ${power} | Acc: ${acc}`,
      )
    } catch {
      // Skip moves that fail to fetch
    }
  }

  const filters: string[] = []
  if (input.type) filters.push(`type=${input.type}`)
  if (input.damageClass) filters.push(`class=${input.damageClass}`)
  if (input.minPower !== undefined) filters.push(`power≥${input.minPower}`)
  if (input.maxPower !== undefined) filters.push(`power≤${input.maxPower}`)
  if (input.generation) filters.push(`gen=${input.generation}`)
  const filterStr = filters.length > 0 ? ` (${filters.join(', ')})` : ''

  return [`Moves${filterStr}: ${results.length} found`, '', ...results].join('\n')
}
