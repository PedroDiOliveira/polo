import type { Locale } from '../data/types'
import { isClue, isModeId, MODE_TOTALS, type Clue, type ModeId } from '../game/modes'
import { isSeed } from '../lib/seededRandom'

// A friend's finished round, carried entirely in the link: no server stores it.
export interface Challenge {
  clue: Clue
  mode: ModeId
  seed: string
  correct: number
  elapsedMs: number
}

export type Verdict = 'win' | 'lose' | 'tie'

export function challengeUrl(origin: string, locale: Locale, challenge: Challenge): string {
  const params = new URLSearchParams({
    mode: challenge.mode,
    clue: challenge.clue,
    seed: challenge.seed,
    score: String(challenge.correct),
    time: String(Math.round(challenge.elapsedMs / 1000)),
    // Only for the link preview, which runs without the map data and so cannot look the total up.
    total: String(MODE_TOTALS[challenge.mode]),
  })
  return `${origin}${locale === 'pt' ? '/pt/' : '/'}?${params}`
}

// Anything malformed simply means "no challenge": the link still opens the game.
export function parseChallenge(search: string): Challenge | null {
  const params = new URLSearchParams(search)
  const clue = params.get('clue') ?? ''
  const mode = params.get('mode') ?? ''
  const seed = params.get('seed') ?? ''
  const score = Number(params.get('score'))
  const time = Number(params.get('time'))
  if (!isClue(clue) || !isModeId(mode) || !isSeed(seed)) return null
  if (!Number.isInteger(score) || score < 0 || score > MODE_TOTALS[mode]) return null
  if (!Number.isInteger(time) || time <= 0 || time > 24 * 3600) return null
  return { clue, mode, seed, correct: score, elapsedMs: time * 1000 }
}

// More correct answers win; on a tie the faster run wins (compared to the second, as the link stores it).
export function compare(mine: Pick<Challenge, 'correct' | 'elapsedMs'>, theirs: Challenge): Verdict {
  if (mine.correct !== theirs.correct) return mine.correct > theirs.correct ? 'win' : 'lose'
  const [a, b] = [Math.round(mine.elapsedMs / 1000), Math.round(theirs.elapsedMs / 1000)]
  if (a === b) return 'tie'
  return a < b ? 'win' : 'lose'
}

// Whoever opens a daily link gets that day's questions anyway; the day and score are only for the preview.
export function dailyUrl(origin: string, locale: Locale, day: number, correct: number, total: number): string {
  const params = new URLSearchParams({ daily: String(day), score: String(correct), total: String(total) })
  return `${origin}${locale === 'pt' ? '/pt/' : '/'}?${params}`
}

export function isDailyLink(search: string): boolean {
  return new URLSearchParams(search).has('daily')
}
