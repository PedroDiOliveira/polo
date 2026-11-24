import { CLUES, isClue, isModeId, MODE_IDS, MODE_TOTALS, type Clue, type ModeId } from './modes'

export interface ModeRecord {
  best: number
  // Fastest perfect run without the extra life: the gold medal.
  perfectMs?: number
  // Fastest perfect run that used the extra life: the silver medal.
  assistedMs?: number
}

export type ModeRecords = Partial<Record<ModeId, ModeRecord>>
export type Records = Partial<Record<Clue, ModeRecords>>

export type MedalTier = 'gold' | 'silver'

export interface RoundResult {
  clue: Clue
  mode: ModeId
  correct: number
  elapsedMs: number
  assisted?: boolean
}

export interface RecordOutcome {
  records: Records
  isNewBest: boolean
  isPerfect: boolean
  // A perfect run that needed the extra life.
  isAssisted: boolean
  // The fastest perfect run of its tier.
  isFastestPerfect: boolean
}

export function medalFor(record: ModeRecord | undefined): MedalTier | null {
  if (record?.perfectMs !== undefined) return 'gold'
  if (record?.assistedMs !== undefined) return 'silver'
  return null
}

export function applyResult(records: Records, result: RoundResult): RecordOutcome {
  const deck = records[result.clue] ?? {}
  const previous = deck[result.mode]
  const isPerfect = result.correct === MODE_TOTALS[result.mode]
  const isAssisted = isPerfect && (result.assisted ?? false)
  const isNewBest = result.correct > (previous?.best ?? 0)
  const tierTime = isAssisted ? previous?.assistedMs : previous?.perfectMs
  const isFastestPerfect = isPerfect && (tierTime === undefined || result.elapsedMs < tierTime)

  if (!isNewBest && !isFastestPerfect) return { records, isNewBest, isPerfect, isAssisted, isFastestPerfect }

  const next: ModeRecord = { best: Math.max(result.correct, previous?.best ?? 0) }
  const perfectMs = isFastestPerfect && !isAssisted ? result.elapsedMs : previous?.perfectMs
  const assistedMs = isFastestPerfect && isAssisted ? result.elapsedMs : previous?.assistedMs
  if (perfectMs !== undefined) next.perfectMs = perfectMs
  if (assistedMs !== undefined) next.assistedMs = assistedMs

  return {
    records: { ...records, [result.clue]: { ...deck, [result.mode]: next } },
    isNewBest,
    isPerfect,
    isAssisted,
    isFastestPerfect,
  }
}

// Each mode counts once, at its best medal: a gold one replaces a silver one.
export function countMedals(records: Records): Record<MedalTier, number> {
  const counts = { gold: 0, silver: 0 }
  for (const clue of CLUES) {
    for (const record of Object.values(records[clue] ?? {})) {
      const tier = medalFor(record)
      if (tier) counts[tier] += 1
    }
  }
  return counts
}

export function mergeRecords(a: Records, b: Records): Records {
  const merged: Records = {}
  for (const clue of CLUES) {
    const deck: ModeRecords = {}
    for (const mode of MODE_IDS) {
      const records = [a[clue]?.[mode], b[clue]?.[mode]].filter((record) => record !== undefined)
      if (records.length === 0) continue
      const record: ModeRecord = { best: Math.max(...records.map((r) => r.best)) }
      const perfectMs = fastest(records.map((r) => r.perfectMs))
      const assistedMs = fastest(records.map((r) => r.assistedMs))
      if (perfectMs !== undefined) record.perfectMs = perfectMs
      if (assistedMs !== undefined) record.assistedMs = assistedMs
      deck[mode] = record
    }
    if (Object.keys(deck).length > 0) merged[clue] = deck
  }
  return merged
}

function fastest(times: (number | undefined)[]): number | undefined {
  const known = times.filter((time) => time !== undefined)
  return known.length > 0 ? Math.min(...known) : undefined
}

// Stored as { clue: { mode: [best, perfectMs?, assistedMs?] } } to keep the cookie small.
// A silver medal without a gold one is stored as [best, null, assistedMs].
export function serializeRecords(records: Records): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(records).map(([clue, deck]) => [
        clue,
        Object.fromEntries(Object.entries(deck).map(([mode, record]) => [mode, encode(record)])),
      ]),
    ),
  )
}

function encode(record: ModeRecord): (number | null)[] {
  if (record.assistedMs !== undefined) return [record.best, record.perfectMs ?? null, record.assistedMs]
  if (record.perfectMs !== undefined) return [record.best, record.perfectMs]
  return [record.best]
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
    const [best, perfectMs, assistedMs] = entry as unknown[]
    if (!isCount(best) || best > MODE_TOTALS[mode]) continue
    const record: ModeRecord = { best }
    // A medal time without a perfect score is impossible, so it is discarded.
    if (best === MODE_TOTALS[mode]) {
      if (isCount(perfectMs)) record.perfectMs = perfectMs
      if (isCount(assistedMs)) record.assistedMs = assistedMs
    }
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
