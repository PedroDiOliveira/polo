import { isModeId, MODE_TOTALS, type ModeId } from './modes'

export interface ModeRecord {
  best: number
  perfectMs?: number
}

export type Records = Partial<Record<ModeId, ModeRecord>>

export interface RoundResult {
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
  const previous = records[result.mode]
  const isPerfect = result.correct === MODE_TOTALS[result.mode]
  const isNewBest = result.correct > (previous?.best ?? 0)
  const isFastestPerfect = isPerfect && (previous?.perfectMs === undefined || result.elapsedMs < previous.perfectMs)

  if (!isNewBest && !isFastestPerfect) return { records, isNewBest, isPerfect, isFastestPerfect }

  const next: ModeRecord = { best: Math.max(result.correct, previous?.best ?? 0) }
  const perfectMs = isFastestPerfect ? result.elapsedMs : previous?.perfectMs
  if (perfectMs !== undefined) next.perfectMs = perfectMs

  return { records: { ...records, [result.mode]: next }, isNewBest, isPerfect, isFastestPerfect }
}

export function serializeRecords(records: Records): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(records).map(([mode, record]) => [
        mode,
        record.perfectMs === undefined ? [record.best] : [record.best, record.perfectMs],
      ]),
    ),
  )
}

export function parseRecords(raw: string | null): Records {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const records: Records = {}
    for (const [mode, value] of Object.entries(parsed)) {
      if (!isModeId(mode) || !Array.isArray(value)) continue
      const [best, perfectMs] = value as unknown[]
      if (!isCount(best) || best > MODE_TOTALS[mode]) continue
      const record: ModeRecord = { best }
      if (best === MODE_TOTALS[mode] && isCount(perfectMs)) record.perfectMs = perfectMs
      records[mode] = record
    }
    return records
  } catch {
    return {}
  }
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
