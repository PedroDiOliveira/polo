import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '../data/world'
import {
  dailyClue,
  dailyMarks,
  dailyQueue,
  DAILY_SIZE,
  dayKey,
  dayNumber,
  msUntilTomorrow,
  parseDailyLog,
  streakOf,
  type DailyResult,
} from './daily'

const played: DailyResult = { clue: 'capital', correct: 8, total: 10, elapsedMs: 60_000, assisted: false, marks: 'HHHHMHHHMH' }

describe('daily Polo', () => {
  it('uses the local calendar day', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(dayKey(new Date(2026, 0, 6, 0, 1))).toBe('2026-01-06')
  })

  it('numbers days from the first one, across months and years', () => {
    expect(dayNumber('2026-11-24')).toBe(1)
    expect(dayNumber('2026-11-25')).toBe(2)
    expect(dayNumber('2027-01-01')).toBe(39)
  })

  it('alternates capitals and countries', () => {
    expect(dailyClue('2026-11-24')).toBe('capital')
    expect(dailyClue('2026-11-25')).toBe('country')
  })

  it('draws the same ten distinct countries for everyone on a day, and others the next day', () => {
    const queue = dailyQueue('2026-12-01')
    expect(queue).toHaveLength(DAILY_SIZE)
    expect(new Set(queue).size).toBe(DAILY_SIZE)
    expect(queue.every((code) => COUNTRIES.some((country) => country.code === code))).toBe(true)
    expect(dailyQueue('2026-12-01')).toEqual(queue)
    expect(dailyQueue('2026-12-02')).not.toEqual(queue)
  })

  it('records each question as a hit, a miss or unanswered, in order', () => {
    expect(dailyMarks(['A', 'B', 'C', 'D'], ['A', 'C'], ['B'])).toBe('HMHU')
  })

  it('counts days in a row, kept alive until the end of the next day', () => {
    const log = { '2026-12-01': played, '2026-12-02': played, '2026-12-03': played }
    expect(streakOf(log, '2026-12-03')).toBe(3)
    // Not played yet today: yesterday's streak still stands.
    expect(streakOf(log, '2026-12-04')).toBe(3)
    // A whole day missed: it is over.
    expect(streakOf(log, '2026-12-05')).toBe(0)
    expect(streakOf({ '2026-11-30': played, '2026-12-01': played }, '2026-12-01')).toBe(2)
  })

  it('counts the time left until local midnight', () => {
    expect(msUntilTomorrow(new Date(2026, 11, 1, 23, 0))).toBe(3_600_000)
  })

  it('keeps only well-formed saved results', () => {
    const raw = JSON.stringify({ '2026-12-01': played, nope: played, '2026-12-02': { clue: 'x' } })
    expect(parseDailyLog(raw)).toEqual({ '2026-12-01': played })
    expect(parseDailyLog('not json')).toEqual({})
    expect(parseDailyLog(null)).toEqual({})
  })
})
