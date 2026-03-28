const TYPE_EMOJIS: Record<string, string> = {
  normal: '⬜',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🌍',
  flying: '🕊️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '🧚',
}

// Type effectiveness matrix: EFFECTIVENESS[attacking][defending] = multiplier
// 0 = immune, 0.5 = not very effective, 1 = normal, 2 = super effective
const EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const ALL_TYPES = Object.keys(TYPE_EMOJIS)

export class TypeChart {
  static getEffectiveness(attackType: string, defendTypes: string[]): number {
    const atk = attackType.toLowerCase()
    let multiplier = 1
    for (const def of defendTypes) {
      const d = def.toLowerCase()
      const eff = EFFECTIVENESS[atk]?.[d]
      multiplier *= eff ?? 1
    }
    return multiplier
  }

  static getSuperEffective(type: string): string[] {
    const t = type.toLowerCase()
    const eff = EFFECTIVENESS[t] ?? {}
    return Object.entries(eff)
      .filter(([, v]) => v >= 2)
      .map(([k]) => k)
  }

  static getNotVeryEffective(type: string): string[] {
    const t = type.toLowerCase()
    const eff = EFFECTIVENESS[t] ?? {}
    return Object.entries(eff)
      .filter(([, v]) => v === 0.5)
      .map(([k]) => k)
  }

  static getNoEffect(type: string): string[] {
    const t = type.toLowerCase()
    const eff = EFFECTIVENESS[t] ?? {}
    return Object.entries(eff)
      .filter(([, v]) => v === 0)
      .map(([k]) => k)
  }

  static getWeaknesses(types: string[]): string[] {
    const weaknesses: string[] = []
    for (const atk of ALL_TYPES) {
      const eff = this.getEffectiveness(atk, types)
      if (eff > 1) weaknesses.push(atk)
    }
    return weaknesses
  }

  static getResistances(types: string[]): string[] {
    const resistances: string[] = []
    for (const atk of ALL_TYPES) {
      const eff = this.getEffectiveness(atk, types)
      if (eff > 0 && eff < 1) resistances.push(atk)
    }
    return resistances
  }

  static getImmunities(types: string[]): string[] {
    const immunities: string[] = []
    for (const atk of ALL_TYPES) {
      const eff = this.getEffectiveness(atk, types)
      if (eff === 0) immunities.push(atk)
    }
    return immunities
  }

  static getTypeEmoji(type: string): string {
    return TYPE_EMOJIS[type.toLowerCase()] ?? ''
  }

  static getAllTypes(): string[] {
    return [...ALL_TYPES]
  }
}
