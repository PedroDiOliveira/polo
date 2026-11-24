import { describe, expect, it } from 'vitest'
import { ALL_FEATURES, COUNTRIES, regionFeatures } from './world'

describe('regionFeatures', () => {
  it('holds every country of the continent', () => {
    const africa = regionFeatures('africa')
    for (const country of COUNTRIES.filter((c) => c.continent === 'africa')) expect(africa).toContain(country.code)
    expect(africa).not.toContain('FRA')
  })

  it('keeps the territories that lie on the same continent as their owner', () => {
    expect(regionFeatures('africa')).toContain('SOL') // Somaliland, Somalia
    expect(regionFeatures('europe')).toContain('FRO') // Faroe Islands, Denmark
  })

  it('leaves out territories far from their owner', () => {
    expect(regionFeatures('europe')).not.toContain('GRL') // Greenland lies in North America
    expect(regionFeatures('north-america')).not.toContain('GRL') // and Denmark is not in that round
    expect(regionFeatures('north-america')).not.toContain('GUM') // Guam, in Oceania
    expect(regionFeatures('north-america')).toContain('PRI') // Puerto Rico
  })

  it('only names features that exist on the map', () => {
    const all = new Set(ALL_FEATURES)
    for (const code of regionFeatures('asia')) expect(all.has(code)).toBe(true)
  })
})
