import type { Locale } from '../data/types'
import { dayNumber, type DailyResult, type DayKey } from '../game/daily'
import type { Messages } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import { dailyUrl } from './challenge'
import { marksGrid, shareText } from './shareText'

// The daily's share, the same from the result screen and from the lobby later in the day.
// The grid always goes in: ten squares are the daily's signature, picture or not.
export function dailyShare(t: Messages, locale: Locale, day: DayKey, result: DailyResult, streak: number) {
  const round = t.dailyRound(dayNumber(day), t.clues[result.clue].name)
  const perfect = result.correct === result.total
  const text = shareText({
    round,
    correct: result.correct,
    total: result.total,
    time: formatDuration(result.elapsedMs),
    medal: perfect ? (result.assisted ? 'silver' : 'gold') : null,
    grid: marksGrid(result.marks),
    streak,
    call: t.dailyDare,
  })
  return {
    title: `Polo · ${round}`,
    round,
    text,
    url: dailyUrl(location.origin, locale, dayNumber(day), result.correct, result.total),
  }
}

export function formatCountdown(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000))
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}h ${String(minutes % 60).padStart(2, '0')}min` : `${minutes}min`
}
