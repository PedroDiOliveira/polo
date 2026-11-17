import { CLUES, isClue, isModeId, MODE_IDS, MODE_TOTALS, type Clue, type ModeId } from './modes'

export interface ModeRecord {
  best: number
  perfectMs?: number
}

export type ModeRecords = Partial<Record<ModeId, ModeRecord>>
export type Records = Partial<Record<Clue, ModeRecords>>

export interface RoundResult {
  clue: Clue
  mode: ModeId
  correct: number
  elapsedMs: number
}

export interface RecordOutcome {
  records: Records
  isNewBest: boolean
  isPerfect: boolean
  isFastestPerfect: boolean
}

export function applyResult(records: Records, result: RoundResult): RecordOutcome {
  const deck = records[result.clue] ?? {}
  const previous = deck[result.mode]
  const isPerfect = result.correct === MODE_TOTALS[result.mode]
  const isNewBest = result.correct > (previous?.best ?? 0)
  const isFastestPerfect = isPerfect && (previous?.perfectMs === undefined || result.elapsedMs < previous.perfectMs)

  if (!isNewBest && !isFastestPerfect) return { records, isNewBest, isPerfect, isFastestPerfect }

  const next: ModeRecord = { best: Math.max(result.correct, previous?.best ?? 0) }
  const perfectMs = isFastestPerfect ? result.elapsedMs : previous?.perfectMs
  if (perfectMs !== undefined) next.perfectMs = perfectMs

  return {
    records: { ...records, [result.clue]: { ...deck, [result.mode]: next } },
    isNewBest,
    isPerfect,
    isFastestPerfect,
  }
}

export function countPerfects(records: Records): number {
  return CLUES.reduce(
    (sum, clue) => sum + Object.values(records[clue] ?? {}).filter((record) => record.perfectMs !== undefined).length,
    0,
  )
}

export function mergeRecords(a: Records, b: Records): Records {
  const merged: Records = {}
  for (const clue of CLUES) {
    const deck: ModeRecords = {}
    for (const mode of MODE_IDS) {
      const records = [a[clue]?.[mode], b[clue]?.[mode]].filter((record) => record !== undefined)
      if (records.length === 0) continue
      const record: ModeRecord = { best: Math.max(...records.map((r) => r.best)) }
      const times = records.flatMap((r) => (r.perfectMs === undefined ? [] : [r.perfectMs]))
      if (times.length > 0) record.perfectMs = Math.min(...times)
      deck[mode] = record
    }
    if (Object.keys(deck).length > 0) merged[clue] = deck
  }
  return merged
}

// Stored as { clue: { mode: [best, perfectMs?] } } to keep the cookie small.
export function serializeRecords(records: Records): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(records).map(([clue, deck]) => [
        clue,
        Object.fromEntries(
          Object.entries(deck).map(([mode, record]) => [
            mode,
            record.perfectMs === undefined ? [record.best] : [record.best, record.perfectMs],
          ]),
        ),
      ]),
    ),
  )
}

export function parseRecords(raw: string | null): Records {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isObject(parsed)) return {}
    const records: Records = {}
    for (const [clue, value] of Object.entries(parsed)) {
      if (!isClue(clue) || !isObject(value)) continue
      const deck = parseDeck(value)
      if (deck) records[clue] = deck
    }
    // Before the country game existed, records were stored flat by mode: those are capital records.
    const legacy = parseDeck(parsed)
    return legacy ? mergeRecords({ capital: legacy }, records) : records
  } catch {
    return {}
  }
}

function parseDeck(value: Record<string, unknown>): ModeRecords | null {
  const deck: ModeRecords = {}
  for (const [mode, entry] of Object.entries(value)) {
    if (!isModeId(mode) || !Array.isArray(entry)) continue
    const [best, perfectMs] = entry as unknown[]
    if (!isCount(best) || best > MODE_TOTALS[mode]) continue
    const record: ModeRecord = { best }
    if (best === MODE_TOTALS[mode] && isCount(perfectMs)) record.perfectMs = perfectMs
    deck[mode] = record
  }
  return Object.keys(deck).length > 0 ? deck : null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
