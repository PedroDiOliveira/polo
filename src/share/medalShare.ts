import type { Locale } from '../data/types'
import { MODE_TOTALS, type Clue, type ModeId } from '../game/modes'
import { masteryOf, medalFor, type MedalTier, type ModeRecord } from '../game/records'
import { roundName, type Messages } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import type { MedalCard } from './medalImage'

export interface MedalShare {
  tier: MedalTier
  round: string
  title: string
  text: string
  url: string
  card: MedalCard
}

// The link opens the game on the same round; the medal fields are only for the link preview.
export function medalUrl(
  origin: string,
  locale: Locale,
  medal: { clue: Clue; mode: ModeId; tier: MedalTier; mastery: number; ms: number },
): string {
  const params = new URLSearchParams({
    mode: medal.mode,
    clue: medal.clue,
    medal: medal.tier,
    total: String(MODE_TOTALS[medal.mode]),
    time: String(Math.round(medal.ms / 1000)),
  })
  if (medal.tier === 'gold') params.set('n', String(medal.mastery))
  return `${origin}${locale === 'pt' ? '/pt/' : '/'}?${params}`
}

// Everything a shared medal says, in text and in picture. Null for a mode without a medal.
export function medalShare(
  t: Messages,
  locale: Locale,
  clue: Clue,
  mode: ModeId,
  record: ModeRecord | undefined,
  origin: string,
  host: string,
): MedalShare | null {
  const tier = medalFor(record)
  const ms = tier === 'gold' ? record?.perfectMs : record?.assistedMs
  if (!tier || ms === undefined) return null
  const mastery = tier === 'gold' ? masteryOf(record) : 0
  const total = MODE_TOTALS[mode]
  const round = roundName(t, clue, mode)
  const tierLabel = tier === 'gold' ? t.medalGoldShort : t.medalSilverShort
  const time = formatDuration(ms)
  const meaning = t.medalMeaning(tier, total)
  const stats = [mastery > 0 ? t.mastery(mastery) : '', `⏱ ${time}`].filter(Boolean).join(' · ')
  return {
    tier,
    round,
    title: `Polo · ${tierLabel}`,
    text: [`Polo 🌍 ${tierLabel} · ${round}`, stats, meaning, t.medalDare].join('\n'),
    url: medalUrl(origin, locale, { clue, mode, tier, mastery, ms }),
    card: {
      tier,
      tierLabel,
      round,
      meaning,
      mastery,
      masteryLabel: t.mastery(mastery),
      time,
      timeLabel: t.bestTime,
      call: t.medalDare,
      host,
    },
  }
}
