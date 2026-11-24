import type { Clue, ModeId } from './modes'

export interface Feedback {
  kind: 'correct' | 'wrong'
  target: string
  picked: string
}

// A miss on hold: the answer is not revealed yet, because the player may still spend the round's extra life on it.
export interface Offer {
  picked: string
  at: number
}

export interface Round {
  clue: Clue
  mode: ModeId
  review: boolean
  queue: readonly string[]
  index: number
  total: number
  correct: readonly string[]
  wrong: readonly string[]
  startedAt: number
  // Time spent deciding on (or watching) the extra life does not count against the player.
  pausedMs: number
  reviveUsed: boolean
  // True once the extra life was spent: a perfect run then earns the simpler medal.
  assisted: boolean
}

export type PlayingSession = { phase: 'playing'; feedback: Feedback | null; offer: Offer | null } & Round
export type FinishedSession = { phase: 'finished'; elapsedMs: number; completed: boolean } & Round
export type Session = { phase: 'lobby' } | PlayingSession | FinishedSession

export type SessionAction =
  | { type: 'start'; clue: Clue; mode: ModeId; queue: readonly string[]; now: number; review?: boolean }
  // `offerAt` is set when an extra life can be offered for a miss (an ad is ready); it is the time the offer opens.
  | { type: 'answer'; picked: string; offerAt?: number }
  | { type: 'revive'; now: number }
  | { type: 'decline'; now: number }
  | { type: 'advance'; now: number }
  | { type: 'quit'; now: number }
  | { type: 'leave' }

export const INITIAL_SESSION: Session = { phase: 'lobby' }

// In a review round a missed question comes back after this many other questions.
const REVIEW_GAP = 3

export function isResolved(session: Session, code: string): boolean {
  return session.phase !== 'lobby' && (session.correct.includes(code) || session.wrong.includes(code))
}

// Only a regular game offers the extra life, once per game: the review round never punishes a miss.
export function canOfferRevive(session: Session): boolean {
  return session.phase === 'playing' && !session.review && !session.reviveUsed && !session.feedback && !session.offer
}

export function sessionReducer(session: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'start':
      if (action.queue.length === 0) return session
      return {
        phase: 'playing',
        clue: action.clue,
        mode: action.mode,
        review: action.review ?? false,
        queue: action.queue,
        index: 0,
        total: action.queue.length,
        correct: [],
        wrong: [],
        startedAt: action.now,
        pausedMs: 0,
        reviveUsed: false,
        assisted: false,
        feedback: null,
        offer: null,
      }

    case 'answer': {
      if (session.phase !== 'playing' || session.feedback || session.offer) return session
      if (isResolved(session, action.picked)) return session
      const target = session.queue[session.index]
      if (action.picked === target) {
        return { ...session, correct: [...session.correct, target], feedback: { kind: 'correct', target, picked: target } }
      }
      if (action.offerAt !== undefined && canOfferRevive(session)) {
        return { ...session, offer: { picked: action.picked, at: action.offerAt } }
      }
      return miss(session, action.picked)
    }

    case 'revive': {
      if (session.phase !== 'playing' || !session.offer) return session
      // Same question, same index: the player simply gets to try again.
      return { ...resume(session, action.now), reviveUsed: true, assisted: true }
    }

    case 'decline': {
      if (session.phase !== 'playing' || !session.offer) return session
      return miss(resume(session, action.now), session.offer.picked)
    }

    case 'advance': {
      if (session.phase !== 'playing' || !session.feedback) return session
      const nextIndex = session.index + 1
      if (nextIndex < session.queue.length) return { ...session, index: nextIndex, feedback: null }
      return finish(session, action.now, true)
    }

    case 'quit':
      return session.phase === 'playing' ? finish(session.offer ? resume(session, action.now) : session, action.now, false) : session

    case 'leave':
      return INITIAL_SESSION
  }
}

// Closes a pending offer and gives back the time it was open.
function resume(session: PlayingSession, now: number): PlayingSession {
  if (!session.offer) return session
  return { ...session, offer: null, pausedMs: session.pausedMs + Math.max(0, now - session.offer.at) }
}

function miss(session: PlayingSession, picked: string): PlayingSession {
  const target = session.queue[session.index]
  const feedback: Feedback = { kind: 'wrong', target, picked }
  if (!session.review) return { ...session, wrong: [...session.wrong, target], feedback }
  const at = Math.min(session.index + 1 + REVIEW_GAP, session.queue.length)
  return { ...session, queue: [...session.queue.slice(0, at), target, ...session.queue.slice(at)], feedback }
}

function finish(session: PlayingSession, now: number, completed: boolean): FinishedSession {
  const { clue, mode, review, queue, index, total, correct, wrong, startedAt, pausedMs, reviveUsed, assisted } = session
  return {
    phase: 'finished',
    clue,
    mode,
    review,
    queue,
    index,
    total,
    correct,
    wrong,
    startedAt,
    pausedMs,
    reviveUsed,
    assisted,
    elapsedMs: Math.max(0, now - startedAt - pausedMs),
    completed,
  }
}
