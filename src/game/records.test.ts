import { describe, expect, it } from 'vitest'
import { MODE_TOTALS } from './modes'
import { applyResult, mergeRecords, parseRecords, serializeRecords, type Records } from './records'

const total = MODE_TOTALS.oceania

describe('applyResult', () => {
  it('stores the first score as the personal best', () => {
    const outcome = applyResult({}, { mode: 'oceania', correct: 5, elapsedMs: 60_000 })
    expect(outcome).toMatchObject({ isNewBest: true, isPerfect: false, records: { oceania: { best: 5 } } })
  })

  it('keeps records untouched when the score does not improve', () => {
    const records: Records = { oceania: { best: 9 } }
    const outcome = applyResult(records, { mode: 'oceania', correct: 7, elapsedMs: 60_000 })
    expect(outcome.isNewBest).toBe(false)
    expect(outcome.records).toBe(records)
  })

  it('tracks each mode independently', () => {
    const outcome = applyResult({ europe: { best: 30 } }, { mode: 'oceania', correct: 3, elapsedMs: 1 })
    expect(outcome.records).toEqual({ europe: { best: 30 }, oceania: { best: 3 } })
  })

  it('registers a perfect run with its time and only replaces it with a faster one', () => {
    const first = applyResult({}, { mode: 'oceania', correct: total, elapsedMs: 90_000 })
    expect(first).toMatchObject({ isPerfect: true, isFastestPerfect: true })
    expect(first.records.oceania).toEqual({ best: total, perfectMs: 90_000 })

    const slower = applyResult(first.records, { mode: 'oceania', correct: total, elapsedMs: 120_000 })
    expect(slower.isFastestPerfect).toBe(false)
    expect(slower.records).toBe(first.records)

    const faster = applyResult(first.records, { mode: 'oceania', correct: total, elapsedMs: 45_000 })
    expect(faster.records.oceania).toEqual({ best: total, perfectMs: 45_000 })
  })
})

describe('records cookie codec', () => {
  it('round-trips records', () => {
    const records: Records = { global: { best: 120 }, oceania: { best: total, perfectMs: 45_000 } }
    expect(parseRecords(serializeRecords(records))).toEqual(records)
  })

  it('discards malformed or tampered values', () => {
    expect(parseRecords(null)).toEqual({})
    expect(parseRecords('not json')).toEqual({})
    expect(parseRecords('{"atlantis":[3],"oceania":[9999],"europe":"x","asia":[-1]}')).toEqual({})
  })

  it('drops a perfect time that does not match a perfect score', () => {
    expect(parseRecords('{"oceania":[3,1000]}')).toEqual({ oceania: { best: 3 } })
  })
})

describe('mergeRecords', () => {
  it('keeps the best score and the fastest perfect time from either store', () => {
    const cookie: Records = { europe: { best: 30 }, oceania: { best: total, perfectMs: 90_000 } }
    const local: Records = { europe: { best: 12 }, oceania: { best: total, perfectMs: 45_000 }, asia: { best: 4 } }
    expect(mergeRecords(cookie, local)).toEqual({
      europe: { best: 30 },
      oceania: { best: total, perfectMs: 45_000 },
      asia: { best: 4 },
    })
  })
})
