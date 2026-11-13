import { CONTINENT_IDS, type ContinentId, type Country } from '../data/types'
import { COUNTRIES } from '../data/world'

export const GLOBAL_MODE = 'global'
export type ModeId = typeof GLOBAL_MODE | ContinentId

export const MODE_IDS: readonly ModeId[] = [GLOBAL_MODE, ...CONTINENT_IDS]

export function isModeId(value: string): value is ModeId {
  return (MODE_IDS as readonly string[]).includes(value)
}

export function poolFor(mode: ModeId): Country[] {
  return mode === GLOBAL_MODE ? [...COUNTRIES] : COUNTRIES.filter((country) => country.continent === mode)
}

export const MODE_TOTALS = Object.fromEntries(MODE_IDS.map((mode) => [mode, poolFor(mode).length])) as Record<
  ModeId,
  number
>
