import type {
  Pokemon,
  PokemonSpecies,
  PokemonType,
  Move,
  Ability,
  EvolutionChain,
  ChainLink,
  EvolutionDetail,
  Item,
  PokemonStat,
} from '../api/types.js'
import { TypeChart } from './type-chart.js'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatName(name: string): string {
  return name.split('-').map(capitalize).join(' ')
}

function statBar(value: number, max = 255, barLen = 15): string {
  const filled = Math.round((value / max) * barLen)
  return '█'.repeat(filled) + '░'.repeat(barLen - filled)
}

function padRight(s: string, len: number): string {
  return s + ' '.repeat(Math.max(0, len - s.length))
}

export class PokemonFormatter {
  static formatPokemon(pokemon: Pokemon, species: PokemonSpecies, lang = 'en'): string {
    const types = pokemon.types
      .sort((a, b) => a.slot - b.slot)
      .map((t) => `${capitalize(t.type.name)} ${TypeChart.getTypeEmoji(t.type.name)}`)
      .join(' / ')

    const genus = species.genera.find((g) => g.language.name === lang)?.genus ?? ''

    const flavorEntry = species.flavor_text_entries.find((f) => f.language.name === lang)
    const flavorText = flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, ' ') : ''

    const abilities = pokemon.abilities
      .sort((a, b) => a.slot - b.slot)
      .map((a) => `${formatName(a.ability.name)}${a.is_hidden ? ' (hidden)' : ''}`)
      .join(', ')

    const eggGroups = species.egg_groups.map((e) => capitalize(e.name)).join(', ')

    const bst = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)

    const gen = species.generation.name.replace('generation-', '').toUpperCase()

    const tags: string[] = []
    if (species.is_legendary) tags.push('Legendary')
    if (species.is_mythical) tags.push('Mythical')
    if (species.is_baby) tags.push('Baby')
    const tagStr = tags.length > 0 ? ` [${tags.join(', ')}]` : ''

    const lines: string[] = [
      `#${String(pokemon.id).padStart(3, '0')} ${formatName(pokemon.name)} — ${types}${tagStr}`,
      `"${genus}" | Gen ${gen} | Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg`,
      '',
      `Base Stats (Total: ${bst})`,
      ...this.formatStatsLines(pokemon.stats),
      '',
      `Abilities: ${abilities}`,
      `Egg Groups: ${eggGroups}`,
      `Catch Rate: ${species.capture_rate} | Base Happiness: ${species.base_happiness ?? 'N/A'}`,
    ]

    if (flavorText) {
      lines.push('', `Flavor Text: "${flavorText}"`)
    }

    return lines.join('\n')
  }

  static formatStatsLines(stats: PokemonStat[]): string[] {
    const statNames: Record<string, string> = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    }
    return stats.map((s) => {
      const name = padRight(statNames[s.stat.name] ?? s.stat.name, 10)
      const val = padRight(String(s.base_stat), 4)
      return `  ${name} ${val} ${statBar(s.base_stat)}`
    })
  }

  static formatStats(stats: PokemonStat[]): string {
    return this.formatStatsLines(stats).join('\n')
  }

  static formatType(typeData: PokemonType): string {
    const name = capitalize(typeData.name)
    const emoji = TypeChart.getTypeEmoji(typeData.name)
    const dr = typeData.damage_relations

    const superEff = dr.double_damage_to.map((t) => capitalize(t.name)).join(', ') || '(none)'
    const notVery = dr.half_damage_to.map((t) => capitalize(t.name)).join(', ') || '(none)'
    const noEff = dr.no_damage_to.map((t) => capitalize(t.name)).join(', ') || '(none)'
    const resistTo = dr.half_damage_from.map((t) => capitalize(t.name)).join(', ') || '(none)'
    const weakTo = dr.double_damage_from.map((t) => capitalize(t.name)).join(', ') || '(none)'
    const immuneTo = dr.no_damage_from.map((t) => capitalize(t.name)).join(', ') || '(none)'

    const pokemonCount = typeData.pokemon.length
    const notable = typeData.pokemon
      .slice(0, 5)
      .map((p) => formatName(p.pokemon.name))
      .join(', ')

    return [
      `Type: ${name} ${emoji}`,
      '',
      'Damage Relations:',
      `  ✅ Super effective against: ${superEff}`,
      `  ❌ Not very effective against: ${notVery}`,
      `  🚫 No effect against: ${noEff}`,
      '',
      `  ✅ Resistant to: ${resistTo}`,
      `  ❌ Weak to: ${weakTo}`,
      `  🚫 Immune to: ${immuneTo}`,
      '',
      `Notable Pokémon: ${notable}`,
      `Total Pokémon with this type: ${pokemonCount}`,
    ].join('\n')
  }

  static formatMove(move: Move, lang = 'en'): string {
    const name = formatName(move.name)
    const emoji = TypeChart.getTypeEmoji(move.type.name)
    const type = capitalize(move.type.name)
    const damageClass = capitalize(move.damage_class.name)
    const gen = move.generation.name.replace('generation-', '').toUpperCase()

    const effectEntry = move.effect_entries.find((e) => e.language.name === lang)
    let effect = effectEntry?.short_effect ?? effectEntry?.effect ?? 'No description available.'
    if (move.effect_chance !== null) {
      effect = effect.replace(/\$effect_chance/g, String(move.effect_chance))
    }

    const learnedBy = move.learned_by_pokemon
      .slice(0, 5)
      .map((p) => formatName(p.name))
      .join(', ')
    const moreCount = Math.max(0, move.learned_by_pokemon.length - 5)

    return [
      `Move: ${name} ${emoji}`,
      `  Type: ${type} | Class: ${damageClass} | PP: ${move.pp}`,
      `  Power: ${move.power ?? '—'} | Accuracy: ${move.accuracy ? `${move.accuracy}%` : '—'}`,
      `  Priority: ${move.priority} | Generation: ${gen}`,
      '',
      `  Effect: ${effect}`,
      '',
      `  Learned by: ${learnedBy}${moreCount > 0 ? `, ... and ${moreCount} more` : ''}`,
    ].join('\n')
  }

  static formatAbility(ability: Ability, lang = 'en'): string {
    const name = formatName(ability.name)
    const gen = ability.generation.name.replace('generation-', '').toUpperCase()

    const effectEntry = ability.effect_entries.find((e) => e.language.name === lang)
    const effect = effectEntry?.short_effect ?? effectEntry?.effect ?? 'No description available.'

    const pokemonList = ability.pokemon
      .slice(0, 10)
      .map((p) => `${formatName(p.pokemon.name)}${p.is_hidden ? ' (hidden)' : ''}`)
      .join(', ')
    const moreCount = Math.max(0, ability.pokemon.length - 10)

    return [
      `Ability: ${name}`,
      `  Generation: ${gen}`,
      `  Effect: ${effect}`,
      '',
      `  Pokémon: ${pokemonList}${moreCount > 0 ? `, ... and ${moreCount} more` : ''}`,
    ].join('\n')
  }

  static formatEvolutionChain(chain: EvolutionChain): string {
    const lines: string[] = ['Evolution Chain:', '']
    this.formatChainLink(chain.chain, lines, '', true)
    return lines.join('\n')
  }

  private static formatChainLink(
    link: ChainLink,
    lines: string[],
    prefix: string,
    isLast: boolean,
  ): void {
    const name = formatName(link.species.name)
    const id = link.species.url.match(/\/(\d+)\/?$/)?.[1] ?? '?'
    const conditions = link.evolution_details
      .map((d) => this.formatEvolutionCondition(d))
      .join(' or ')
    const condStr = conditions ? ` — ${conditions}` : ''

    if (prefix === '') {
      lines.push(`${name} (#${id})${condStr}`)
    } else {
      const connector = isLast ? '└─→' : '├─→'
      lines.push(`${prefix}${connector} ${name} (#${id})${condStr}`)
    }

    const childPrefix = prefix === '' ? '' : prefix + (isLast ? '    ' : '│   ')
    link.evolves_to.forEach((child, i) => {
      this.formatChainLink(child, lines, childPrefix, i === link.evolves_to.length - 1)
    })
  }

  private static formatEvolutionCondition(detail: EvolutionDetail): string {
    const parts: string[] = []
    const trigger = detail.trigger.name

    if (trigger === 'level-up') {
      if (detail.min_level) parts.push(`Level ${detail.min_level}`)
      if (detail.min_happiness) parts.push(`Happiness ≥ ${detail.min_happiness}`)
      if (detail.time_of_day) parts.push(capitalize(detail.time_of_day))
      if (detail.known_move) parts.push(`Knows ${formatName(detail.known_move.name)}`)
      if (detail.known_move_type)
        parts.push(`Knows ${capitalize(detail.known_move_type.name)}-type move`)
      if (detail.location) parts.push(`At ${formatName(detail.location.name)}`)
      if (detail.held_item) parts.push(`Holding ${formatName(detail.held_item.name)}`)
      if (parts.length === 0) parts.push('Level up')
    } else if (trigger === 'use-item' && detail.item) {
      parts.push(formatName(detail.item.name))
    } else if (trigger === 'trade') {
      parts.push('Trade')
      if (detail.held_item) parts.push(`holding ${formatName(detail.held_item.name)}`)
    } else {
      parts.push(formatName(trigger))
    }

    return parts.join(' + ')
  }

  static formatItem(item: Item, lang = 'en'): string {
    const name = formatName(item.name)
    const category = formatName(item.category.name)

    const effectEntry = item.effect_entries.find((e) => e.language.name === lang)
    const effect = effectEntry?.short_effect ?? effectEntry?.effect ?? 'No description available.'

    return [
      `Item: ${name}`,
      `  Category: ${category}`,
      `  Cost: ${item.cost > 0 ? `₽${item.cost}` : 'Not purchasable'}`,
      item.fling_power ? `  Fling Power: ${item.fling_power}` : null,
      '',
      `  Effect: ${effect}`,
    ]
      .filter((l) => l !== null)
      .join('\n')
  }

  static formatComparison(pokemonList: Pokemon[]): string {
    const statNames: Record<string, string> = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    }
    const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']

    // Headers
    const nameWidth = 12
    const headers = pokemonList.map((p) => {
      const types = p.types.map((t) => TypeChart.getTypeEmoji(t.type.name)).join('')
      return padRight(`${formatName(p.name)} ${types}`, nameWidth)
    })
    const headerLine = `${padRight('Stat', nameWidth)} | ${headers.join(' | ')}`
    const sepLine = '-'.repeat(headerLine.length)

    const rows: string[] = ['Pokémon Comparison', '', headerLine, sepLine]

    for (const statKey of statOrder) {
      const label = padRight(statNames[statKey] ?? statKey, nameWidth)
      const values = pokemonList.map((p) => {
        const s = p.stats.find((st) => st.stat.name === statKey)
        return padRight(String(s?.base_stat ?? '—'), nameWidth)
      })
      rows.push(`${label} | ${values.join(' | ')}`)
    }

    const bsts = pokemonList.map((p) => {
      const bst = p.stats.reduce((sum, s) => sum + s.base_stat, 0)
      return padRight(String(bst), nameWidth)
    })
    rows.push(`${padRight('BST', nameWidth)} | ${bsts.join(' | ')}`)

    return rows.join('\n')
  }

  static formatTypeCoverage(team: Pokemon[]): string {
    const allTypes = TypeChart.getAllTypes()
    const teamTypes = team.map((p) => p.types.map((t) => t.type.name))

    // Offensive coverage: what types can this team hit super-effectively?
    const offensiveCoverage = new Set<string>()
    for (const memberTypes of teamTypes) {
      for (const atkType of memberTypes) {
        for (const defType of allTypes) {
          if (TypeChart.getEffectiveness(atkType, [defType]) > 1) {
            offensiveCoverage.add(defType)
          }
        }
      }
    }
    const missingCoverage = allTypes.filter((t) => !offensiveCoverage.has(t))

    // Defensive weaknesses
    const weaknessCount: Record<string, number> = {}
    const resistanceSet = new Set<string>()
    for (const memberTypes of teamTypes) {
      for (const atk of allTypes) {
        const eff = TypeChart.getEffectiveness(atk, memberTypes)
        if (eff > 1) {
          weaknessCount[atk] = (weaknessCount[atk] ?? 0) + 1
        } else if (eff < 1) {
          resistanceSet.add(atk)
        }
      }
    }

    const sharedWeaknesses = Object.entries(weaknessCount)
      .filter(([, count]) => count >= 2)
      .map(([type, count]) => `${capitalize(type)} (${count} members weak)`)

    const noResistance = allTypes.filter((t) => !resistanceSet.has(t))

    const lines: string[] = [
      `Type Coverage Analysis (Team of ${team.length})`,
      '',
      'Offensive Coverage:',
      `  ✅ Super effective against: ${offensiveCoverage.size}/${allTypes.length} types`,
    ]

    if (missingCoverage.length > 0) {
      lines.push(`  ❌ Missing coverage: ${missingCoverage.map(capitalize).join(', ')}`)
    }

    lines.push('', 'Defensive Weaknesses:')
    if (sharedWeaknesses.length > 0) {
      for (const w of sharedWeaknesses) {
        lines.push(`  ⚠️ Shared weakness: ${w}`)
      }
    } else {
      lines.push('  ✅ No shared weaknesses')
    }

    if (noResistance.length > 0) {
      lines.push(`  ⚠️ No resistance to: ${noResistance.map(capitalize).join(', ')}`)
    }

    // Recommendations
    lines.push('', 'Recommendations:')
    if (missingCoverage.length > 0) {
      const suggest = missingCoverage.slice(0, 2).map(capitalize).join(' or ')
      lines.push(`  • Consider adding a ${suggest}-type for better offensive coverage`)
    }
    if (sharedWeaknesses.length > 0) {
      lines.push(`  • Address shared weaknesses with resistances or immunities`)
    }
    if (missingCoverage.length === 0 && sharedWeaknesses.length === 0) {
      lines.push('  • Team has solid coverage! Well balanced.')
    }

    return lines.join('\n')
  }
}
