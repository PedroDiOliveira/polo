import { describe, expect, it } from 'vitest'
import { challengeUrl, dailyUrl } from './challenge'
import { imageQuery, parsePreview, withPreview } from './preview'

const SHELL = [
  '<meta property="og:title" content="Polo · Geography" />',
  '<meta property="og:image" content="https://polo.example/og.png" />',
  '<meta name="twitter:image" content="https://polo.example/og.png" />',
  '<meta name="description" content="Untouched" />',
].join('\n')

describe('parsePreview', () => {
  it('reads what the game puts in a challenge link', () => {
    const url = new URL(
      challengeUrl('https://polo.example', 'pt', {
        clue: 'capital',
        mode: 'africa',
        seed: 'abcd1234',
        correct: 48,
        elapsedMs: 192_000,
      }),
    )
    const preview = parsePreview(url.pathname, url.search)
    expect(preview).toMatchObject({ locale: 'pt', correct: 48, total: 54, time: '03:12' })
    expect(preview?.title).toBe('48/54 · Capitais · África. Consegue bater?')
  })

  it('reads a daily link, with the clue that day asks', () => {
    const url = new URL(dailyUrl('https://polo.example', 'en', 2, 8, 10))
    const preview = parsePreview(url.pathname, url.search)
    expect(preview?.round).toBe('Daily Polo #2 · Countries')
    expect(preview?.time).toBe('')
  })

  it('gives no preview for plain or malformed links', () => {
    expect(parsePreview('/', '')).toBeNull()
    expect(parsePreview('/', '?mode=africa&clue=country')).toBeNull()
    expect(parsePreview('/', '?mode=mars&clue=capital&score=3&total=10&time=40')).toBeNull()
    expect(parsePreview('/', '?mode=africa&clue=capital&score=11&total=10&time=40')).toBeNull()
    expect(parsePreview('/', '?daily=0&score=3&total=10')).toBeNull()
  })
})

describe('withPreview', () => {
  it('replaces the social tags and escapes what it writes', () => {
    const preview = parsePreview('/', '?mode=europe&clue=country&score=5&total=46&time=60')!
    const html = withPreview(SHELL, preview, 'https://polo.example/api/og?a=1&b="2"')
    expect(html).toContain('content="5/46 · Countries · Europe. Can you beat it?"')
    expect(html).toContain('content="https://polo.example/api/og?a=1&amp;b=&quot;2&quot;"')
    expect(html).not.toContain('og.png')
    expect(html).toContain('content="Untouched"')
  })
})

describe('imageQuery', () => {
  it('keeps only what the picture needs, plus the language', () => {
    expect(imageQuery('pt', '?seed=abcd1234&mode=asia&clue=capital&score=3&total=20&time=9')).toBe(
      'lang=pt&clue=capital&mode=asia&score=3&total=20&time=9',
    )
  })
})
