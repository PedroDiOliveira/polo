import { describe, expect, it } from 'vitest'
import { applyAnswer, groupByLevel, masteredCount, parseMastery, type Mastery } from './mastery'

describe('mastery', () => {
  it('starts a country at level 1 on a first hit and at level 0 on a first miss', () => {
    expect(applyAnswer({}, 'BRA', true)).toEqual({ BRA: 1 })
    expect(applyAnswer({}, 'BRA', false)).toEqual({ BRA: 0 })
  })

  it('moves one level per answer and stays within bounds', () => {
    let mastery: Mastery = {}
    for (let i = 0; i < 5; i++) mastery = applyAnswer(mastery, 'BRA', true)
    expect(mastery).toEqual({ BRA: 3 })
    expect(masteredCount(mastery)).toBe(1)

    mastery = applyAnswer(mastery, 'BRA', false)
    expect(mastery).toEqual({ BRA: 2 })

    for (let i = 0; i < 5; i++) mastery = applyAnswer(mastery, 'BRA', false)
    expect(mastery).toEqual({ BRA: 0 })
  })

  it('groups countries by level for the map', () => {
    expect(groupByLevel({ BRA: 3, ARG: 0, PER: 3 })).toEqual([['ARG'], [], [], ['BRA', 'PER']])
  })

  it('round-trips through storage and discards invalid entries', () => {
    const mastery = { BRA: 2, ARG: 0 }
    expect(parseMastery(JSON.stringify(mastery))).toEqual(mastery)
    expect(parseMastery('{"BRA":9,"XXX":1,"ARG":"2","PER":1.5,"CHL":1}')).toEqual({ CHL: 1 })
    expect(parseMastery('nope')).toEqual({})
    expect(parseMastery(null)).toEqual({})
  })
})
