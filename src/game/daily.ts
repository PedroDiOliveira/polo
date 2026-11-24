import { COUNTRIES } from '../data/world'
import { seededRandom } from '../lib/seededRandom'
import { shuffle } from '../lib/shuffle'
import type { Clue } from './modes'

// The daily Polo: ten questions drawn from the whole world, the same for everyone on the same calendar day.
// Like Wordle it follows the player's own calendar, so it turns over at their midnight, not at UTC's.

export const DAILY_SIZE = 10
// Day #1. Changing it renumbers every daily already shared, so it stays fixed.
const FIRST_DAY = '2026-11-24'
const DAY_MS = 86_400_000

export type DayKey = string

// One letter per question in the order asked: H hit, M miss, U unanswered. Enough to redraw the grid later.
export interface DailyResult {
  clue: Clue
  correct: number
  total: number
  elapsedMs: number
  assisted: boolean
  marks: string
}

export type DailyLog = Readonly<Record<DayKey, DailyResult>>

export function dayKey(date: Date): DayKey {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Calendar days, counted in UTC so daylight-saving changes never make a day 23 or 25 hours long.
function dayIndex(key: DayKey): number {
  const [year, month, day] = key.split('-').map(Number)
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS)
}

export function dayNumber(key: DayKey): number {
  return dayIndex(key) - dayIndex(FIRST_DAY) + 1
}

function shiftDay(key: DayKey, days: number): DayKey {
  const date = new Date((dayIndex(key) + days) * DAY_MS)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

// Odd days ask capitals, even days ask countries: both games get their turn.
export function dailyClue(key: DayKey): Clue {
  return dayNumber(key) % 2 === 0 ? 'country' : 'capital'
}

export function dailyQueue(key: DayKey): string[] {
  return shuffle(COUNTRIES, seededRandom(`daily-${key}`))
    .slice(0, DAILY_SIZE)
    .map((country) => country.code)
}

export function dailyMarks(queue: readonly string[], correct: readonly string[], wrong: readonly string[]): string {
  return queue.map((code) => (correct.includes(code) ? 'H' : wrong.includes(code) ? 'M' : 'U')).join('')
}

// Days in a row with a daily played. A streak survives until the end of the day after its last game,
// so it does not look broken in the morning before today's game.
export function streakOf(log: DailyLog, today: DayKey): number {
  let day = log[today] ? today : shiftDay(today, -1)
  let streak = 0
  while (log[day]) {
    streak++
    day = shiftDay(day, -1)
  }
  return streak
}

export function msUntilTomorrow(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return midnight.getTime() - now.getTime()
}

export function parseDailyLog(raw: string | null): DailyLog {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const log: Record<DayKey, DailyResult> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && isDailyResult(value)) log[key] = value
    }
    return log
  } catch {
    return {}
  }
}

function isDailyResult(value: unknown): value is DailyResult {
  if (!value || typeof value !== 'object') return false
  const result = value as Record<string, unknown>
  return (
    (result.clue === 'capital' || result.clue === 'country') &&
    typeof result.correct === 'number' &&
    typeof result.total === 'number' &&
    typeof result.elapsedMs === 'number' &&
    typeof result.assisted === 'boolean' &&
    typeof result.marks === 'string' &&
    /^[HMU]*$/.test(result.marks)
  )
}
