import { describe, expect, it } from 'vitest'
import { MODE_TOTALS } from './modes'
import { applyResult, countMedals, mergeRecords, parseRecords, serializeRecords, type Records } from './records'

const total = MODE_TOTALS.oceania
const capital = { clue: 'capital', mode: 'oceania' } as const

describe('applyResult', () => {
  it('stores the first score as the personal best', () => {
    const outcome = applyResult({}, { ...capital, correct: 5, elapsedMs: 60_000 })
    expect(outcome).toMatchObject({ isNewBest: true, isPerfect: false, records: { capital: { oceania: { best: 5 } } } })
  })

  it('keeps records untouched when the score does not improve', () => {
    const records: Records = { capital: { oceania: { best: 9 } } }
    const outcome = applyResult(records, { ...capital, correct: 7, elapsedMs: 60_000 })
    expect(outcome.isNewBest).toBe(false)
    expect(outcome.records).toBe(records)
  })

  it('tracks each mode independently', () => {
    const outcome = applyResult({ capital: { europe: { best: 30 } } }, { ...capital, correct: 3, elapsedMs: 1 })
    expect(outcome.records).toEqual({ capital: { europe: { best: 30 }, oceania: { best: 3 } } })
  })

  it('tracks the capital and the country game independently', () => {
    const records: Records = { capital: { oceania: { best: 9 } } }
    const outcome = applyResult(records, { clue: 'country', mode: 'oceania', correct: 2, elapsedMs: 1 })
    expect(outcome.isNewBest).toBe(true)
    expect(outcome.records).toEqual({ capital: { oceania: { best: 9 } }, country: { oceania: { best: 2 } } })
  })

  it('registers a perfect run with its time and only replaces it with a faster one', () => {
    const first = applyResult({}, { ...capital, correct: total, elapsedMs: 90_000 })
    expect(first).toMatchObject({ isPerfect: true, isFastestPerfect: true })
    expect(first.records.capital?.oceania).toEqual({ best: total, perfectMs: 90_000 })

    const slower = applyResult(first.records, { ...capital, correct: total, elapsedMs: 120_000 })
    expect(slower.isFastestPerfect).toBe(false)
    expect(slower.records).toBe(first.records)

    const faster = applyResult(first.records, { ...capital, correct: total, elapsedMs: 45_000 })
    expect(faster.records.capital?.oceania).toEqual({ best: total, perfectMs: 45_000 })
  })
})

describe('medals', () => {
  it('gives a silver medal to a perfect run that used the extra life', () => {
    const outcome = applyResult({}, { ...capital, correct: total, elapsedMs: 50_000, assisted: true })
    expect(outcome).toMatchObject({ isPerfect: true, isAssisted: true, isFastestPerfect: true })
    expect(outcome.records.capital?.oceania).toEqual({ best: total, assistedMs: 50_000 })
  })

  it('keeps the gold and the silver times apart', () => {
    const silver = applyResult({}, { ...capital, correct: total, elapsedMs: 50_000, assisted: true })
    const gold = applyResult(silver.records, { ...capital, correct: total, elapsedMs: 80_000 })
    expect(gold).toMatchObject({ isAssisted: false, isFastestPerfect: true })
    expect(gold.records.capital?.oceania).toEqual({ best: total, perfectMs: 80_000, assistedMs: 50_000 })

    const slowerSilver = applyResult(gold.records, { ...capital, correct: total, elapsedMs: 60_000, assisted: true })
    expect(slowerSilver.records).toBe(gold.records)
  })

  it('does not treat an assisted run that is not perfect as a medal', () => {
    const outcome = applyResult({}, { ...capital, correct: 3, elapsedMs: 1, assisted: true })
    expect(outcome).toMatchObject({ isPerfect: false, isAssisted: false })
    expect(outcome.records.capital?.oceania).toEqual({ best: 3 })
  })

  it('counts each mode once, at its best medal, across both games', () => {
    const records: Records = {
      capital: { oceania: { best: total, perfectMs: 1, assistedMs: 1 }, europe: { best: 3 } },
      country: { oceania: { best: total, perfectMs: 2 }, asia: { best: MODE_TOTALS.asia, assistedMs: 5 } },
    }
    expect(countMedals(records)).toEqual({ gold: 2, silver: 1 })
  })
})

describe('records cookie codec', () => {
  it('round-trips records', () => {
    const records: Records = {
      capital: { global: { best: 120 }, oceania: { best: total, perfectMs: 45_000 } },
      country: {
        europe: { best: 12 },
        asia: { best: MODE_TOTALS.asia, assistedMs: 9_000 },
        oceania: { best: total, perfectMs: 1_000, assistedMs: 900 },
      },
    }
    expect(parseRecords(serializeRecords(records))).toEqual(records)
  })

  it('reads the older two-field format', () => {
    expect(parseRecords(`{"capital":{"oceania":[${total},45000]}}`)).toEqual({
      capital: { oceania: { best: total, perfectMs: 45_000 } },
    })
  })

  it('reads records saved before the country game as capital records', () => {
    expect(parseRecords('{"global":[120],"oceania":[3]}')).toEqual({ capital: { global: { best: 120 }, oceania: { best: 3 } } })
  })

  it('discards malformed or tampered values', () => {
    expect(parseRecords(null)).toEqual({})
    expect(parseRecords('not json')).toEqual({})
    expect(parseRecords('[1,2]')).toEqual({})
    expect(parseRecords('{"atlantis":[3],"oceania":[9999],"europe":"x","asia":[-1]}')).toEqual({})
    expect(parseRecords('{"flags":{"oceania":[3]},"country":{"oceania":[9999]}}')).toEqual({})
  })

  it('drops a perfect time that does not match a perfect score', () => {
    expect(parseRecords('{"country":{"oceania":[3,1000]}}')).toEqual({ country: { oceania: { best: 3 } } })
    expect(parseRecords('{"country":{"oceania":[3,null,1000]}}')).toEqual({ country: { oceania: { best: 3 } } })
  })
})

describe('mergeRecords', () => {
  it('keeps the best score and the fastest perfect time from either store', () => {
    const cookie: Records = { capital: { europe: { best: 30 }, oceania: { best: total, perfectMs: 90_000 } } }
    const local: Records = {
      capital: { europe: { best: 12 }, oceania: { best: total, perfectMs: 45_000 }, asia: { best: 4 } },
      country: { asia: { best: 7 } },
    }
    expect(mergeRecords(cookie, local)).toEqual({
      capital: { europe: { best: 30 }, oceania: { best: total, perfectMs: 45_000 }, asia: { best: 4 } },
      country: { asia: { best: 7 } },
    })
  })
})
