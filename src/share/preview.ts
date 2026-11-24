import { CONTINENT_IDS, type Locale } from '../data/types.js'
import type { Clue, ModeId } from '../game/modes'
import type { MedalTier } from '../game/records'
import { MESSAGES, roundName } from '../i18n/messages.js'
import { formatDuration } from '../lib/time.js'

// What a chat app shows for a shared link, worked out from the link alone.
// This module runs on the edge too (middleware.ts, api/og.ts), so it must not pull in the map data:
// it only imports types, the messages and small helpers.

export interface Preview {
  locale: Locale
  // The round's name as the game writes it: "Capitals · Africa" or "Daily Polo #12 · Countries".
  round: string
  correct: number
  total: number
  // Empty for the daily, whose link carries no time.
  time: string
  title: string
  description: string
  // A shared medal rather than a round: the picture shows the medal, its meaning and its mastery.
  medal: { tier: MedalTier; label: string; mastery: number; meaning: string } | null
}

const MODES: readonly string[] = ['global', 'quick', ...CONTINENT_IDS]
const CLUES: readonly string[] = ['capital', 'country']

export function localeOf(pathname: string): Locale {
  return pathname === '/pt' || pathname.startsWith('/pt/') ? 'pt' : 'en'
}

function count(value: string | null, max: number): number | null {
  const n = Number(value)
  return value !== null && value !== '' && Number.isInteger(n) && n >= 0 && n <= max ? n : null
}

// Null means "no preview": the link still opens the game, with the site's own image.
export function parsePreview(pathname: string, search: string): Preview | null {
  const params = new URLSearchParams(search)
  const locale = localeOf(pathname)
  const t = MESSAGES[locale]
  const total = count(params.get('total'), 300)
  if (!total) return null

  if (params.has('daily')) {
    const day = count(params.get('daily'), 100_000)
    const correct = count(params.get('score'), total)
    if (!day || correct === null) return null
    // Odd days ask capitals, even days countries: the same rule as game/daily.ts.
    const round = t.dailyRound(day, t.clues[day % 2 === 1 ? 'capital' : 'country'].name)
    const title = t.previewTitle(correct, total, round)
    return { locale, round, correct, total, time: '', title, description: t.dailyDare, medal: null }
  }

  const clue = params.get('clue') ?? ''
  const mode = params.get('mode') ?? ''
  const seconds = count(params.get('time'), 24 * 3600)
  if (!CLUES.includes(clue) || !MODES.includes(mode) || !seconds) return null
  const round = roundName(t, clue as Clue, mode as ModeId)
  const time = formatDuration(seconds * 1000)

  const tier = params.get('medal')
  if (tier === 'gold' || tier === 'silver') {
    // Gold carries its mastery; a link without one still stands for a single perfect run.
    const mastery = tier === 'gold' ? count(params.get('n'), 100_000) || 1 : 0
    const label = tier === 'gold' ? t.medalGoldShort : t.medalSilverShort
    const meaning = t.medalMeaning(tier, total)
    return {
      locale,
      round,
      correct: total,
      total,
      time,
      title: [label, round, mastery ? t.mastery(mastery) : ''].filter(Boolean).join(' · '),
      description: `${meaning} ${t.medalDare}`,
      medal: { tier, label, mastery, meaning },
    }
  }

  const correct = count(params.get('score'), total)
  if (correct === null) return null
  return {
    locale,
    round,
    correct,
    total,
    time,
    title: t.previewTitle(correct, total, round),
    description: `⏱ ${time} · ${t.shareDare}`,
    medal: null,
  }
}

// Only the fields the picture needs, in a stable order so equal results share one cached image.
export function imageQuery(locale: Locale, search: string): string {
  const params = new URLSearchParams(search)
  const kept = new URLSearchParams(locale === 'pt' ? { lang: 'pt' } : {})
  for (const key of ['daily', 'clue', 'mode', 'medal', 'n', 'score', 'total', 'time']) {
    const value = params.get(key)
    if (value !== null) kept.set(key, value)
  }
  return kept.toString()
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Swap the shell's generic social tags for the result's own. Tags the page does not have are left alone.
export function withPreview(html: string, preview: Preview, image: string): string {
  const tags: Record<string, string> = {
    'og:title': preview.title,
    'og:description': preview.description,
    'og:image': image,
    'og:image:alt': preview.title,
    'twitter:title': preview.title,
    'twitter:description': preview.description,
    'twitter:image': image,
  }
  let out = html
  for (const [name, value] of Object.entries(tags)) {
    const attribute = name.startsWith('og:') ? 'property' : 'name'
    const pattern = new RegExp(`(<meta ${attribute}="${name.replace(/[.:]/g, '\\$&')}" content=")[^"]*(")`)
    out = out.replace(pattern, (_, start: string, end: string) => `${start}${escapeAttribute(value)}${end}`)
  }
  return out
}
