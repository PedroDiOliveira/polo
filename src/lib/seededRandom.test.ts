import { describe, expect, it } from 'vitest'
import { isSeed, newSeed, seededRandom } from './seededRandom'
import { shuffle } from './shuffle'

describe('seededRandom', () => {
  it('draws the same sequence for the same seed', () => {
    const a = seededRandom('abc123')
    const b = seededRandom('abc123')
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b))
  })

  it('draws a different sequence for another seed', () => {
    expect(seededRandom('abc123')()).not.toBe(seededRandom('abc124')())
  })

  it('stays within [0, 1)', () => {
    const random = seededRandom('range')
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('replays the same round order through shuffle', () => {
    const items = Array.from({ length: 50 }, (_, i) => i)
    expect(shuffle(items, seededRandom('round'))).toEqual(shuffle(items, seededRandom('round')))
  })

  it('makes seeds that pass its own validation', () => {
    for (let i = 0; i < 50; i++) expect(isSeed(newSeed())).toBe(true)
    expect(isSeed('NOPE')).toBe(false)
    expect(isSeed('a')).toBe(false)
  })
})
