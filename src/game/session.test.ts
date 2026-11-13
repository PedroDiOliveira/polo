import { describe, expect, it } from 'vitest'
import { INITIAL_SESSION, sessionReducer, type Session } from './session'

const start = (queue: string[]): Session =>
  sessionReducer(INITIAL_SESSION, { type: 'start', mode: 'south-america', queue, now: 1_000 })

describe('sessionReducer', () => {
  it('starts a round on the first capital of the queue', () => {
    const session = start(['BRA', 'ARG'])
    expect(session).toMatchObject({ phase: 'playing', index: 0, correct: [], wrong: [], feedback: null })
  })

  it('ignores a start without countries', () => {
    expect(start([])).toBe(INITIAL_SESSION)
  })

  it('records a hit and a miss against the target country, not the picked one', () => {
    const hit = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'BRA' })
    expect(hit).toMatchObject({ correct: ['BRA'], wrong: [], feedback: { kind: 'correct', target: 'BRA' } })

    const miss = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'ARG' })
    expect(miss).toMatchObject({ correct: [], wrong: ['BRA'], feedback: { kind: 'wrong', target: 'BRA' } })
  })

  it('locks input while feedback is on screen', () => {
    const answered = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'BRA' })
    expect(sessionReducer(answered, { type: 'answer', picked: 'ARG' })).toBe(answered)
  })

  it('ignores picks on countries that were already resolved', () => {
    let session = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'BRA' })
    session = sessionReducer(session, { type: 'advance', now: 2_000 })
    expect(sessionReducer(session, { type: 'answer', picked: 'BRA' })).toBe(session)
  })

  it('finishes after the last capital and measures the elapsed time', () => {
    let session = sessionReducer(start(['BRA']), { type: 'answer', picked: 'BRA' })
    session = sessionReducer(session, { type: 'advance', now: 9_000 })
    expect(session).toMatchObject({ phase: 'finished', completed: true, elapsedMs: 8_000, correct: ['BRA'] })
  })

  it('keeps the partial score when the player ends the game early', () => {
    let session = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'BRA' })
    session = sessionReducer(session, { type: 'quit', now: 4_000 })
    expect(session).toMatchObject({ phase: 'finished', completed: false, correct: ['BRA'], elapsedMs: 3_000 })
  })
})
