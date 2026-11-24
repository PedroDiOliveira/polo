import { describe, expect, it } from 'vitest'
import { MODE_TOTALS } from '../game/modes'
import { MESSAGES } from '../i18n/messages'
import { medalShare } from './medalShare'
import { parsePreview } from './preview'

const total = MODE_TOTALS.oceania
const origin = 'https://polo.example'

describe('medalShare', () => {
  it('shares a gold medal with its meaning and mastery, and a link the preview can read', () => {
    const record = { best: total, perfectMs: 75_000, golds: 3 }
    const share = medalShare(MESSAGES.pt, 'pt', 'capital', 'oceania', record, origin, 'polo.example')!
    expect(share.text.split('\n')).toEqual([
      'Polo 🌍 Medalha de ouro · Capitais · Oceania',
      'Maestria 3 · ⏱ 01:15',
      `Acertou todas as ${total}: nenhum erro e sem usar a vida extra.`,
      'Consegue ganhar a sua?',
    ])
    const url = new URL(share.url)
    expect(url.pathname).toBe('/pt/')
    expect(parsePreview(url.pathname, url.search)).toMatchObject({
      title: 'Medalha de ouro · Capitais · Oceania · Maestria 3',
      medal: { tier: 'gold', mastery: 3 },
    })
  })

  it('shares a silver medal without a mastery', () => {
    const share = medalShare(MESSAGES.en, 'en', 'country', 'oceania', { best: total, assistedMs: 9_000 }, origin, '')!
    expect(share.card).toMatchObject({ tier: 'silver', mastery: 0, time: '00:09' })
    expect(share.text).not.toContain('Mastery')
    const url = new URL(share.url)
    expect(url.searchParams.has('n')).toBe(false)
    expect(parsePreview(url.pathname, url.search)?.medal).toMatchObject({ tier: 'silver', mastery: 0 })
  })

  it('has nothing to share for a mode without a medal', () => {
    expect(medalShare(MESSAGES.en, 'en', 'capital', 'oceania', { best: 3 }, origin, '')).toBeNull()
    expect(medalShare(MESSAGES.en, 'en', 'capital', 'oceania', undefined, origin, '')).toBeNull()
  })
})
