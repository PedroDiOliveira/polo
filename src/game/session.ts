import type { ModeId } from './modes'

export interface Feedback {
  kind: 'correct' | 'wrong'
  target: string
}

export interface Round {
  mode: ModeId
  queue: readonly string[]
  index: number
  correct: readonly string[]
  wrong: readonly string[]
  startedAt: number
}

export type Session =
  | { phase: 'lobby' }
  | ({ phase: 'playing'; feedback: Feedback | null } & Round)
  | ({ phase: 'finished'; elapsedMs: number; completed: boolean } & Round)

export type SessionAction =
  | { type: 'start'; mode: ModeId; queue: readonly string[]; now: number }
  | { type: 'answer'; picked: string }
  | { type: 'advance'; now: number }
  | { type: 'quit'; now: number }
  | { type: 'leave' }

export const INITIAL_SESSION: Session = { phase: 'lobby' }

export function currentTarget(session: Session): string | null {
  return session.phase === 'playing' ? (session.queue[session.index] ?? null) : null
}

export function isResolved(session: Session, code: string): boolean {
  return session.phase !== 'lobby' && (session.correct.includes(code) || session.wrong.includes(code))
}

export function sessionReducer(session: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'start':
      if (action.queue.length === 0) return session
      return {
        phase: 'playing',
        mode: action.mode,
        queue: action.queue,
        index: 0,
        correct: [],
        wrong: [],
        startedAt: action.now,
        feedback: null,
      }

    case 'answer': {
      if (session.phase !== 'playing' || session.feedback) return session
      const target = session.queue[session.index]
      if (isResolved(session, action.picked)) return session
      const hit = action.picked === target
      return {
        ...session,
        correct: hit ? [...session.correct, target] : session.correct,
        wrong: hit ? session.wrong : [...session.wrong, target],
        feedback: { kind: hit ? 'correct' : 'wrong', target },
      }
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

function finish(session: Extract<Session, { phase: 'playing' }>, now: number, completed: boolean): Session {
  const { mode, queue, index, correct, wrong, startedAt } = session
  return {
    phase: 'finished',
    mode,
    queue,
    index,
    correct,
    wrong,
    startedAt,
    elapsedMs: now - startedAt,
    completed,
  }
}
