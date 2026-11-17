import { CONTINENT_IDS, type ContinentId, type Country } from '../data/types'
import { COUNTRIES } from '../data/world'

// What the prompt shows: a capital to place, or a country to find. Both are answered by clicking a country.
export const CLUES = ['capital', 'country'] as const
export type Clue = (typeof CLUES)[number]
export const DEFAULT_CLUE: Clue = 'capital'

export function isClue(value: string): value is Clue {
  return (CLUES as readonly string[]).includes(value)
}

export const GLOBAL_MODE = 'global'
export const QUICK_MODE = 'quick'
export const QUICK_SIZE = 20

export type ModeId = typeof GLOBAL_MODE | typeof QUICK_MODE | ContinentId

export const MODE_IDS: readonly ModeId[] = [GLOBAL_MODE, QUICK_MODE, ...CONTINENT_IDS]

export function isModeId(value: string): value is ModeId {
  return (MODE_IDS as readonly string[]).includes(value)
}

export function isWorldwide(mode: ModeId): mode is typeof GLOBAL_MODE | typeof QUICK_MODE {
  return mode === GLOBAL_MODE || mode === QUICK_MODE
}

export function poolFor(mode: ModeId): Country[] {
  return isWorldwide(mode) ? [...COUNTRIES] : COUNTRIES.filter((country) => country.continent === mode)
}

export const MODE_TOTALS = Object.fromEntries(
  MODE_IDS.map((mode) => [mode, mode === QUICK_MODE ? QUICK_SIZE : poolFor(mode).length]),
) as Record<ModeId, number>
