import { describe, expect, it } from 'vitest'
import { INITIAL_SESSION, sessionReducer, type Session } from './session'

const start = (queue: string[]): Session =>
  sessionReducer(INITIAL_SESSION, { type: 'start', clue: 'capital', mode: 'south-america', queue, now: 1_000 })

describe('sessionReducer', () => {
  it('starts a round on the first capital of the queue', () => {
    const session = start(['BRA', 'ARG'])
    expect(session).toMatchObject({ phase: 'playing', index: 0, correct: [], wrong: [], feedback: null })
  })

  it('keeps the clue of the round through to the result', () => {
    let session = sessionReducer(INITIAL_SESSION, { type: 'start', clue: 'country', mode: 'europe', queue: ['FRA'], now: 0 })
    expect(session).toMatchObject({ phase: 'playing', clue: 'country' })
    session = sessionReducer(sessionReducer(session, { type: 'answer', picked: 'FRA' }), { type: 'advance', now: 1 })
    expect(session).toMatchObject({ phase: 'finished', clue: 'country', correct: ['FRA'] })
  })

  it('ignores a start without countries', () => {
    expect(start([])).toBe(INITIAL_SESSION)
  })

  it('records a hit and a miss against the target country, not the picked one', () => {
    const hit = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'BRA' })
    expect(hit).toMatchObject({ correct: ['BRA'], wrong: [], feedback: { kind: 'correct', target: 'BRA', picked: 'BRA' } })

    const miss = sessionReducer(start(['BRA', 'ARG']), { type: 'answer', picked: 'ARG' })
    expect(miss).toMatchObject({ correct: [], wrong: ['BRA'], feedback: { kind: 'wrong', target: 'BRA', picked: 'ARG' } })
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

  describe('review round', () => {
    const review = (queue: string[]): Session =>
      sessionReducer(INITIAL_SESSION, { type: 'start', clue: 'capital', mode: 'south-america', queue, now: 0, review: true })
    const play = (session: Session, picked: string): Session =>
      sessionReducer(sessionReducer(session, { type: 'answer', picked }), { type: 'advance', now: 1 })

    it('brings a missed capital back later instead of marking it wrong', () => {
      const session = play(review(['BRA', 'ARG']), 'ARG')
      expect(session).toMatchObject({ phase: 'playing', queue: ['BRA', 'ARG', 'BRA'], wrong: [], total: 2 })
    })

    it('only finishes once every capital was answered correctly', () => {
      let session = review(['BRA', 'ARG'])
      session = play(session, 'ARG')
      session = play(session, 'ARG')
      expect(session.phase).toBe('playing')
      session = play(session, 'BRA')
      expect(session).toMatchObject({ phase: 'finished', completed: true, review: true, correct: ['ARG', 'BRA'] })
    })
  })
})

describe('extra life', () => {
  const begin = (queue: string[]): Session =>
    sessionReducer(INITIAL_SESSION, { type: 'start', clue: 'capital', mode: 'south-america', queue, now: 1_000 })
  const missWithOffer = (session: Session, picked: string, at: number): Session =>
    sessionReducer(session, { type: 'answer', picked, offerAt: at })

  it('holds a miss as an offer without revealing the answer', () => {
    const session = missWithOffer(begin(['BRA', 'ARG']), 'ARG', 2_000)
    expect(session).toMatchObject({ offer: { picked: 'ARG', at: 2_000 }, feedback: null, wrong: [], index: 0 })
  })

  it('locks input while the offer is open', () => {
    const session = missWithOffer(begin(['BRA', 'ARG']), 'ARG', 2_000)
    expect(sessionReducer(session, { type: 'answer', picked: 'BRA' })).toBe(session)
  })

  it('lets the player retry the same question after reviving, and marks the game as assisted', () => {
    let session = missWithOffer(begin(['BRA', 'ARG']), 'ARG', 2_000)
    session = sessionReducer(session, { type: 'revive', now: 32_000 })
    expect(session).toMatchObject({ offer: null, feedback: null, index: 0, reviveUsed: true, assisted: true, pausedMs: 30_000 })
    session = sessionReducer(session, { type: 'answer', picked: 'BRA' })
    expect(session).toMatchObject({ correct: ['BRA'], wrong: [] })
  })

  it('offers the extra life only once per game', () => {
    let session = sessionReducer(missWithOffer(begin(['BRA', 'ARG']), 'ARG', 2_000), { type: 'revive', now: 3_000 })
    session = missWithOffer(session, 'CHL', 4_000)
    expect(session).toMatchObject({ offer: null, wrong: ['BRA'], feedback: { kind: 'wrong', target: 'BRA', picked: 'CHL' } })
  })

  it('falls back to a regular miss when the offer is declined', () => {
    let session = missWithOffer(begin(['BRA', 'ARG']), 'ARG', 2_000)
    session = sessionReducer(session, { type: 'decline', now: 5_000 })
    expect(session).toMatchObject({
      offer: null,
      reviveUsed: false,
      assisted: false,
      pausedMs: 3_000,
      wrong: ['BRA'],
      feedback: { kind: 'wrong', target: 'BRA', picked: 'ARG' },
    })
  })

  it('does not count the time the offer was open', () => {
    let session = missWithOffer(begin(['BRA']), 'ARG', 2_000)
    session = sessionReducer(session, { type: 'revive', now: 12_000 })
    session = sessionReducer(sessionReducer(session, { type: 'answer', picked: 'BRA' }), { type: 'advance', now: 15_000 })
    expect(session).toMatchObject({ phase: 'finished', elapsedMs: 4_000, assisted: true, correct: ['BRA'] })
  })

  it('never offers an extra life in the review round', () => {
    const review = sessionReducer(INITIAL_SESSION, {
      type: 'start',
      clue: 'capital',
      mode: 'south-america',
      queue: ['BRA', 'ARG'],
      now: 0,
      review: true,
    })
    expect(missWithOffer(review, 'ARG', 1)).toMatchObject({ offer: null, feedback: { kind: 'wrong' } })
  })
})
