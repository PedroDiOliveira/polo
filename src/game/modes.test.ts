import { describe, expect, it } from 'vitest'
import { CONTINENT_IDS } from '../data/types'
import { COUNTRIES } from '../data/world'
import { MODE_TOTALS, poolFor } from './modes'

describe('game pools', () => {
  it('splits every country into exactly one continent', () => {
    const regional = CONTINENT_IDS.reduce((sum, continent) => sum + MODE_TOTALS[continent], 0)
    expect(regional).toBe(MODE_TOTALS.global)
    expect(MODE_TOTALS.global).toBe(COUNTRIES.length)
  })

  it('gives every country a unique code and a capital location', () => {
    expect(new Set(COUNTRIES.map((country) => country.code)).size).toBe(COUNTRIES.length)
    for (const country of COUNTRIES) {
      expect(country.capital.en.length).toBeGreaterThan(0)
      expect(Math.abs(country.capitalAt[0])).toBeLessThanOrEqual(180)
      expect(Math.abs(country.capitalAt[1])).toBeLessThanOrEqual(90)
    }
  })

  it('filters the regional pool by continent', () => {
    expect(poolFor('south-america').every((country) => country.continent === 'south-america')).toBe(true)
  })
})
