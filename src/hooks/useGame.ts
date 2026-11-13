import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import type { Mastery } from '../game/mastery'
import { MODE_TOTALS, poolFor, type ModeId } from '../game/modes'
import type { RecordOutcome, Records } from '../game/records'
import { INITIAL_SESSION, sessionReducer, type Session, type SessionAction } from '../game/session'
import { shuffle } from '../lib/shuffle'
import { requestPersistence } from '../lib/storage'
import { useMastery } from './useMastery'
import { useRecords } from './useRecords'

export const FEEDBACK_MS = { correct: 1100, wrong: 3200 } as const

export interface Game {
  session: Session
  outcome: RecordOutcome | null
  records: Records
  mastery: Mastery
  start: (mode: ModeId) => void
  review: () => void
  answer: (code: string) => void
  quit: () => void
  leave: () => void
}

export function useGame(): Game {
  const [session, setSession] = useState<Session>(INITIAL_SESSION)
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null)
  const { records, submit } = useRecords()
  const { mastery, record: recordMastery } = useMastery()

  const apply = useCallback(
    (action: SessionAction) => {
      const next = sessionReducer(session, action)
      if (next === session) return

      // Records and mastery only count first attempts in a regular game, never the review round.
      if (action.type === 'answer' && next.phase === 'playing' && next.feedback && !next.review) {
        recordMastery(next.feedback.target, next.feedback.kind === 'correct')
      }
      if (next.phase === 'finished' && !next.review) {
        setOutcome(submit({ mode: next.mode, correct: next.correct.length, elapsedMs: next.elapsedMs }))
        requestPersistence()
      } else if (next.phase !== 'playing' || action.type === 'start') {
        setOutcome(null)
      }
      setSession(next)
    },
    [session, submit, recordMastery],
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
    mastery,
    start: (mode) => {
      const queue = shuffle(poolFor(mode))
        .slice(0, MODE_TOTALS[mode])
        .map((country) => country.code)
      apply({ type: 'start', mode, queue, now: Date.now() })
    },
    review: () => {
      if (session.phase !== 'finished') return
      apply({ type: 'start', mode: session.mode, queue: shuffle(session.wrong), now: Date.now(), review: true })
    },
    answer: (code) => apply({ type: 'answer', picked: code }),
    quit: () => apply({ type: 'quit', now: Date.now() }),
    leave: () => apply({ type: 'leave' }),
  }
}
