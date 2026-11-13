import { getCountry } from '../data/world'

export const MASTERY_LEVELS = 4
const TOP_LEVEL = MASTERY_LEVELS - 1

// Level per country code, present only for countries the player has already been asked about.
export type Mastery = Readonly<Record<string, number>>

export function applyAnswer(mastery: Mastery, code: string, hit: boolean): Mastery {
  const current = mastery[code]
  const next = current === undefined ? (hit ? 1 : 0) : Math.min(TOP_LEVEL, Math.max(0, current + (hit ? 1 : -1)))
  return current === next ? mastery : { ...mastery, [code]: next }
}

export function groupByLevel(mastery: Mastery): string[][] {
  const groups: string[][] = Array.from({ length: MASTERY_LEVELS }, () => [])
  for (const [code, level] of Object.entries(mastery)) groups[level]?.push(code)
  return groups
}

export function masteredCount(mastery: Mastery): number {
  return Object.values(mastery).filter((level) => level === TOP_LEVEL).length
}

export function parseMastery(raw: string | null): Mastery {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const mastery: Record<string, number> = {}
    for (const [code, level] of Object.entries(parsed)) {
      if (getCountry(code) && Number.isInteger(level) && level >= 0 && level <= TOP_LEVEL) mastery[code] = level
    }
    return mastery
  } catch {
    return {}
  }
}
