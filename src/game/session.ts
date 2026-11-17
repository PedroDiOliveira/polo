import type { Clue, ModeId } from './modes'

export interface Feedback {
  kind: 'correct' | 'wrong'
  target: string
  picked: string
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
}

export type PlayingSession = { phase: 'playing'; feedback: Feedback | null } & Round
export type FinishedSession = { phase: 'finished'; elapsedMs: number; completed: boolean } & Round
export type Session = { phase: 'lobby' } | PlayingSession | FinishedSession

export type SessionAction =
  | { type: 'start'; clue: Clue; mode: ModeId; queue: readonly string[]; now: number; review?: boolean }
  | { type: 'answer'; picked: string }
  | { type: 'advance'; now: number }
  | { type: 'quit'; now: number }
  | { type: 'leave' }

export const INITIAL_SESSION: Session = { phase: 'lobby' }

// In a review round a missed question comes back after this many other questions.
const REVIEW_GAP = 3

export function isResolved(session: Session, code: string): boolean {
  return session.phase !== 'lobby' && (session.correct.includes(code) || session.wrong.includes(code))
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
        feedback: null,
      }

    case 'answer': {
      if (session.phase !== 'playing' || session.feedback) return session
      if (isResolved(session, action.picked)) return session
      const target = session.queue[session.index]
      const feedback: Feedback = {
        kind: action.picked === target ? 'correct' : 'wrong',
        target,
        picked: action.picked,
      }
      if (feedback.kind === 'correct') return { ...session, correct: [...session.correct, target], feedback }
      if (!session.review) return { ...session, wrong: [...session.wrong, target], feedback }
      const at = Math.min(session.index + 1 + REVIEW_GAP, session.queue.length)
      return { ...session, queue: [...session.queue.slice(0, at), target, ...session.queue.slice(at)], feedback }
    }

    case 'advance': {
      if (session.phase !== 'playing' || !session.feedback) return session
      const nextIndex = session.index + 1
      if (nextIndex < session.queue.length) return { ...session, index: nextIndex, feedback: null }
      return finish(session, action.now, true)
    }

    case 'quit':
      return session.phase === 'playing' ? finish(session, action.now, false) : session

    case 'leave':
      return INITIAL_SESSION
  }
}

function finish(session: PlayingSession, now: number, completed: boolean): FinishedSession {
  const { clue, mode, review, queue, index, total, correct, wrong, startedAt } = session
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
    elapsedMs: now - startedAt,
    completed,
  }
}
