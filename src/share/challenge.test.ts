import { describe, expect, it } from 'vitest'
import { challengeUrl, compare, parseChallenge, type Challenge } from './challenge'

const challenge: Challenge = { clue: 'capital', mode: 'africa', seed: 'k3x9p2qa', correct: 40, elapsedMs: 192_000 }

describe('challenge links', () => {
  it('round-trips through the URL', () => {
    const url = new URL(challengeUrl('https://polo.example', 'en', challenge))
    expect(url.pathname).toBe('/')
    expect(parseChallenge(url.search)).toEqual(challenge)
  })

  it('keeps the Portuguese edition', () => {
    expect(new URL(challengeUrl('https://polo.example', 'pt', challenge)).pathname).toBe('/pt/')
  })

  it('ignores malformed or impossible links', () => {
    expect(parseChallenge('')).toBeNull()
    expect(parseChallenge('?mode=africa&clue=capital')).toBeNull()
    expect(parseChallenge('?mode=mars&clue=capital&seed=k3x9p2qa&score=1&time=10')).toBeNull()
    expect(parseChallenge('?mode=quick&clue=capital&seed=k3x9p2qa&score=21&time=10')).toBeNull()
    expect(parseChallenge('?mode=quick&clue=capital&seed=k3x9p2qa&score=-1&time=10')).toBeNull()
    expect(parseChallenge('?mode=quick&clue=capital&seed=k3x9p2qa&score=5&time=0')).toBeNull()
    expect(parseChallenge('?mode=quick&clue=capital&seed=<b>&score=5&time=10')).toBeNull()
  })

  it('ranks by score, then by time to the second', () => {
    expect(compare({ correct: 41, elapsedMs: 999_000 }, challenge)).toBe('win')
    expect(compare({ correct: 39, elapsedMs: 1_000 }, challenge)).toBe('lose')
    expect(compare({ correct: 40, elapsedMs: 150_000 }, challenge)).toBe('win')
    expect(compare({ correct: 40, elapsedMs: 200_000 }, challenge)).toBe('lose')
    expect(compare({ correct: 40, elapsedMs: 192_400 }, challenge)).toBe('tie')
  })
})
