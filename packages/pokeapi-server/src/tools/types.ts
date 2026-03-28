import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'
import { TypeChart } from '../utils/type-chart.js'

export const getTypeSchema = z.object({
  type: z.string().describe("Type name (e.g., 'fire', 'water', 'dragon')"),
})

export async function getType(
  client: PokeApiClient,
  input: z.infer<typeof getTypeSchema>,
): Promise<string> {
  const typeData = await client.getType(input.type)
  return PokemonFormatter.formatType(typeData)
}

export const typeMatchupSchema = z.object({
  attackingType: z.string().describe('Attacking move type'),
  defendingTypes: z.array(z.string()).min(1).max(2).describe('Defending Pokémon type(s)'),
})

export async function typeMatchup(
  _client: PokeApiClient,
  input: z.infer<typeof typeMatchupSchema>,
): Promise<string> {
  const { attackingType, defendingTypes } = input
  const atkEmoji = TypeChart.getTypeEmoji(attackingType)
  const defEmojis = defendingTypes
    .map((t) => `${t.charAt(0).toUpperCase() + t.slice(1)} ${TypeChart.getTypeEmoji(t)}`)
    .join(' / ')

  const combined = TypeChart.getEffectiveness(attackingType, defendingTypes)

  const lines: string[] = [
    `Type Matchup: ${attackingType.charAt(0).toUpperCase() + attackingType.slice(1)} ${atkEmoji} → ${defEmojis}`,
    '',
  ]

  let label: string
  if (combined === 0) label = 'No Effect (Immune)'
  else if (combined >= 4) label = `${combined}x (Super Effective!)`
  else if (combined >= 2) label = `${combined}x (Super Effective)`
  else if (combined < 1) label = `${combined}x (Not Very Effective)`
  else label = `${combined}x (Normal)`

  lines.push(`Effectiveness: ${label}`)

  if (defendingTypes.length === 2) {
    const eff1 = TypeChart.getEffectiveness(attackingType, [defendingTypes[0]])
    const eff2 = TypeChart.getEffectiveness(attackingType, [defendingTypes[1]])
    lines.push(
      `  ${attackingType.charAt(0).toUpperCase() + attackingType.slice(1)} → ${defendingTypes[0].charAt(0).toUpperCase() + defendingTypes[0].slice(1)}: ${eff1}x`,
      `  ${attackingType.charAt(0).toUpperCase() + attackingType.slice(1)} → ${defendingTypes[1].charAt(0).toUpperCase() + defendingTypes[1].slice(1)}: ${eff2}x`,
      `  Combined: ${eff1} × ${eff2} = ${combined}x`,
    )
  }

  return lines.join('\n')
}
