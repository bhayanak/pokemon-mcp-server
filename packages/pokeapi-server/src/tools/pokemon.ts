import { z } from 'zod'
import type { PokeApiClient } from '../api/client.js'
import { PokemonFormatter } from '../utils/formatter.js'

export const pokemonGetSchema = z.object({
  nameOrId: z
    .union([z.string(), z.number()])
    .describe('Pokémon name (lowercase) or National Dex ID'),
  includeMoveset: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include full moveset (can be large)'),
})

export async function pokemonGet(
  client: PokeApiClient,
  input: z.infer<typeof pokemonGetSchema>,
  lang: string,
): Promise<string> {
  const pokemon = await client.getPokemon(input.nameOrId)
  const species = await client.getSpecies(pokemon.species.name)

  let output = PokemonFormatter.formatPokemon(pokemon, species, lang)

  if (input.includeMoveset) {
    const movesByMethod: Record<string, string[]> = {}
    for (const m of pokemon.moves) {
      for (const vgd of m.version_group_details) {
        const method = vgd.move_learn_method.name
        if (!movesByMethod[method]) movesByMethod[method] = []
        const name = m.move.name
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
        const levelStr = vgd.level_learned_at > 0 ? ` (Lv. ${vgd.level_learned_at})` : ''
        const entry = `${name}${levelStr}`
        if (!movesByMethod[method].includes(entry)) {
          movesByMethod[method].push(entry)
        }
      }
    }

    output += '\n\nMoves:'
    for (const [method, moves] of Object.entries(movesByMethod)) {
      const methodName = method
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      output += `\n  ${methodName}: ${moves.join(', ')}`
    }
  }

  return output
}

export const pokemonSearchSchema = z.object({
  type: z.string().optional().describe("Filter by type (e.g., 'fire', 'water')"),
  generation: z.number().min(1).max(9).optional().describe('Filter by generation (1-9)'),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().optional().default(0),
})

export async function pokemonSearch(
  client: PokeApiClient,
  input: z.infer<typeof pokemonSearchSchema>,
): Promise<string> {
  if (input.type) {
    const typeData = await client.getType(input.type)
    const filtered = typeData.pokemon.slice(input.offset, input.offset + input.limit)
    const total = typeData.pokemon.length
    const lines = filtered.map((p) => `  ${p.pokemon.name}`)
    const remaining = total - input.offset - filtered.length
    return [
      `Pokémon with type "${input.type}" (${total} total):`,
      ...lines,
      remaining > 0 ? `  ... and ${remaining} more` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (input.generation) {
    // The generation endpoint returns species directly
    const response = await fetch(`https://pokeapi.co/api/v2/generation/${input.generation}`)
    const gen = (await response.json()) as { pokemon_species: { name: string; url: string }[] }
    const species = gen.pokemon_species.slice(input.offset, input.offset + input.limit)
    const total = gen.pokemon_species.length
    const remaining = total - input.offset - species.length

    return [
      `Generation ${input.generation} Pokémon (${total} total):`,
      ...species.map((s) => `  ${s.name}`),
      remaining > 0 ? `  ... and ${remaining} more` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  const list = await client.getResourceList('pokemon', input.limit, input.offset)
  const remaining = list.count - input.offset - list.results.length
  return [
    `Pokémon (${list.count} total):`,
    ...list.results.map((p) => `  ${p.name}`),
    remaining > 0 ? `  ... and ${remaining} more` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
