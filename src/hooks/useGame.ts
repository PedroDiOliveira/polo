import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { poolFor, type ModeId } from '../game/modes'
import type { RecordOutcome, Records } from '../game/records'
import { INITIAL_SESSION, sessionReducer, type Session, type SessionAction } from '../game/session'
import { shuffle } from '../lib/shuffle'
import { useRecords } from './useRecords'

export const FEEDBACK_MS = { correct: 750, wrong: 2400 } as const

export interface Game {
  session: Session
  outcome: RecordOutcome | null
  records: Records
  start: (mode: ModeId) => void
  answer: (code: string) => void
  quit: () => void
  leave: () => void
}

export function useGame(): Game {
  const [session, setSession] = useState<Session>(INITIAL_SESSION)
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null)
  const { records, submit } = useRecords()

  const apply = useCallback(
    (action: SessionAction) => {
      const next = sessionReducer(session, action)
      if (next === session) return
      if (next.phase === 'finished') {
        setOutcome(submit({ mode: next.mode, correct: next.correct.length, elapsedMs: next.elapsedMs }))
      } else if (next.phase === 'lobby' || action.type === 'start') {
        setOutcome(null)
      }
      setSession(next)
    },
    [session, submit],
  )

  const advance = useEffectEvent(() => apply({ type: 'advance', now: Date.now() }))
  const feedback = session.phase === 'playing' ? session.feedback : null

  useEffect(() => {
    if (!feedback) return
    const id = window.setTimeout(advance, FEEDBACK_MS[feedback.kind])
    return () => window.clearTimeout(id)
  }, [feedback])

  return {
    session,
    outcome,
    records,
    start: (mode) =>
      apply({ type: 'start', mode, queue: shuffle(poolFor(mode)).map((country) => country.code), now: Date.now() }),
    answer: (code) => apply({ type: 'answer', picked: code }),
    quit: () => apply({ type: 'quit', now: Date.now() }),
    leave: () => apply({ type: 'leave' }),
  }
}
