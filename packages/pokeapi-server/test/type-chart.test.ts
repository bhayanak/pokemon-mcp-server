import { describe, it, expect } from 'vitest'
import { TypeChart } from '../src/utils/type-chart.js'

describe('TypeChart', () => {
  describe('getEffectiveness', () => {
    it('returns 2x for super effective single type', () => {
      expect(TypeChart.getEffectiveness('fire', ['grass'])).toBe(2)
    })

    it('returns 0.5x for not very effective', () => {
      expect(TypeChart.getEffectiveness('fire', ['water'])).toBe(0.5)
    })

    it('returns 0 for immune', () => {
      expect(TypeChart.getEffectiveness('electric', ['ground'])).toBe(0)
    })

    it('returns 1x for neutral', () => {
      expect(TypeChart.getEffectiveness('fire', ['normal'])).toBe(1)
    })

    it('calculates dual type 4x', () => {
      expect(TypeChart.getEffectiveness('electric', ['water', 'flying'])).toBe(4)
    })

    it('calculates dual type 0.25x', () => {
      expect(TypeChart.getEffectiveness('fire', ['fire', 'water'])).toBe(0.25)
    })

    it('immunity overrides in dual type', () => {
      expect(TypeChart.getEffectiveness('ground', ['flying', 'normal'])).toBe(0)
    })
  })

  describe('getSuperEffective', () => {
    it('returns correct types for fire', () => {
      const result = TypeChart.getSuperEffective('fire')
      expect(result).toContain('grass')
      expect(result).toContain('ice')
      expect(result).toContain('bug')
      expect(result).toContain('steel')
    })
  })

  describe('getWeaknesses', () => {
    it('returns weaknesses for electric type', () => {
      const result = TypeChart.getWeaknesses(['electric'])
      expect(result).toContain('ground')
    })

    it('returns weaknesses for dual type', () => {
      const result = TypeChart.getWeaknesses(['fire', 'flying'])
      expect(result).toContain('water')
      expect(result).toContain('rock')
      expect(result).toContain('electric')
    })
  })

  describe('getResistances', () => {
    it('returns resistances for steel type', () => {
      const result = TypeChart.getResistances(['steel'])
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getNotVeryEffective', () => {
    it('returns not very effective types for fire', () => {
      const result = TypeChart.getNotVeryEffective('fire')
      expect(result).toContain('fire')
      expect(result).toContain('water')
      expect(result).toContain('rock')
      expect(result).toContain('dragon')
    })

    it('returns empty for unknown type', () => {
      const result = TypeChart.getNotVeryEffective('faketype')
      expect(result).toHaveLength(0)
    })
  })

  describe('getNoEffect', () => {
    it('returns no effect types for normal', () => {
      const result = TypeChart.getNoEffect('normal')
      expect(result).toContain('ghost')
    })

    it('returns no effect types for electric', () => {
      const result = TypeChart.getNoEffect('electric')
      expect(result).toContain('ground')
    })

    it('returns empty for type with no immunities', () => {
      const result = TypeChart.getNoEffect('water')
      expect(result).toHaveLength(0)
    })
  })

  describe('getImmunities', () => {
    it('returns immunities for ghost type', () => {
      const result = TypeChart.getImmunities(['ghost'])
      expect(result).toContain('normal')
      expect(result).toContain('fighting')
    })
  })

  describe('getTypeEmoji', () => {
    it('returns fire emoji', () => {
      expect(TypeChart.getTypeEmoji('fire')).toBe('🔥')
    })

    it('returns empty string for unknown type', () => {
      expect(TypeChart.getTypeEmoji('unknown')).toBe('')
    })
  })

  describe('getAllTypes', () => {
    it('returns 18 types', () => {
      expect(TypeChart.getAllTypes()).toHaveLength(18)
    })
  })
})
