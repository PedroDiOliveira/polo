import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { ADS, countFinishedGame, initAds, requestReward, type Reward } from '../ads/adPlacement'
import { dailyClue, dailyMarks, dailyQueue, type DailyLog, type DayKey } from '../game/daily'
import { MODE_TOTALS, poolFor, QUICK_MODE, type Clue, type ModeId } from '../game/modes'
import type { RecordOutcome, Records } from '../game/records'
import {
  canOfferRevive,
  INITIAL_SESSION,
  isResolved,
  sessionReducer,
  type Session,
  type SessionAction,
} from '../game/session'
import { newSeed, seededRandom } from '../lib/seededRandom'
import { shuffle } from '../lib/shuffle'
import { requestPersistence } from '../lib/storage'
import { useDaily } from './useDaily'
import { useMastery, type MasteryByClue } from './useMastery'
import { useRecords } from './useRecords'

export const FEEDBACK_MS = { correct: 1100, wrong: 3200 } as const

export interface Game {
  session: Session
  outcome: RecordOutcome | null
  records: Records
  mastery: MasteryByClue
  // True while the rewarded ad for the extra life is on screen.
  watching: boolean
  // What drew the current regular round's questions: shared in a challenge link so a friend gets the same ones.
  // Null for a review round, which replays the player's own misses.
  seed: string | null
  // The day of the daily Polo being played or just finished; null for every other round.
  dailyDay: DayKey | null
  dailyLog: DailyLog
  start: (clue: Clue, mode: ModeId, seed?: string) => void
  startDaily: (day: DayKey) => void
  review: () => void
  answer: (code: string) => void
  revive: () => void
  decline: () => void
  quit: () => void
  leave: () => void
}

export function useGame(): Game {
  const [session, setSession] = useState<Session>(INITIAL_SESSION)
  const [outcome, setOutcome] = useState<RecordOutcome | null>(null)
  const [watching, setWatching] = useState(false)
  const [seed, setSeed] = useState<string | null>(null)
  const [dailyDay, setDailyDay] = useState<DayKey | null>(null)
  const { records, submit } = useRecords()
  const { mastery, record: recordMastery } = useMastery()
  const { log: dailyLog, record: recordDaily } = useDaily()
  // Read when the round finishes, which may be after midnight: the game counts for the day it started.
  const dailyRound = useRef<DayKey | null>(null)

  // Ad lookups are asynchronous, so the latest session is also kept in a ref for code that resumes after them.
  const current = useRef<Session>(INITIAL_SESSION)
  const reward = useRef<Reward | null>(null)
  const lookingUp = useRef(false)
  // The question the extra life was spent on: its second attempt does not move mastery again.
  const revivedIndex = useRef<number | null>(null)

  useEffect(initAds, [])

  const apply = useCallback(
    (action: SessionAction) => {
      const previous = current.current
      const next = sessionReducer(previous, action)
      if (next === previous) return

      // Mastery only counts first attempts in a regular game, never the review round. A miss that is
      // then revived still counts as a miss: it is an honest measure of what the player knows.
      if (action.type === 'answer' && next.phase === 'playing' && !next.review && next.index !== revivedIndex.current) {
        const target = next.queue[next.index]
        if (next.offer) recordMastery(next.clue, target, false)
        else if (next.feedback) recordMastery(next.clue, next.feedback.target, next.feedback.kind === 'correct')
      }
      if (action.type === 'revive' && next.phase === 'playing') revivedIndex.current = next.index
      if (action.type === 'start') revivedIndex.current = null

      if (next.phase === 'finished' && !next.review && dailyRound.current) {
        // The daily keeps its own log: ten questions must not count as a personal best of a twenty-question mode.
        const correct = next.correct.length
        const isPerfect = correct === next.total
        recordDaily(dailyRound.current, {
          clue: next.clue,
          correct,
          total: next.total,
          elapsedMs: next.elapsedMs,
          assisted: next.assisted,
          marks: dailyMarks(next.queue, next.correct, next.wrong),
        })
        setOutcome({
          records,
          isNewBest: false,
          isPerfect,
          isAssisted: isPerfect && next.assisted,
          isFastestPerfect: false,
        })
        countFinishedGame()
        requestPersistence()
      } else if (next.phase === 'finished' && !next.review) {
        setOutcome(
          submit({
            clue: next.clue,
            mode: next.mode,
            correct: next.correct.length,
            elapsedMs: next.elapsedMs,
            assisted: next.assisted,
          }),
        )
        countFinishedGame()
        requestPersistence()
      } else if (next.phase !== 'playing' || action.type === 'start') {
        setOutcome(null)
      }
      if (next.phase !== 'playing' || !next.offer) reward.current = null
      current.current = next
      setSession(next)
    },
    [submit, recordMastery, recordDaily, records],
  )

  const advance = useEffectEvent(() => apply({ type: 'advance', now: Date.now() }))
  const autoDecline = useEffectEvent(() => apply({ type: 'decline', now: Date.now() }))
  const feedback = session.phase === 'playing' ? session.feedback : null
  const offer = session.phase === 'playing' ? session.offer : null

  useEffect(() => {
    if (!feedback) return
    const id = window.setTimeout(advance, FEEDBACK_MS[feedback.kind])
    return () => window.clearTimeout(id)
  }, [feedback])

  // An unanswered offer declines itself, so the game never waits forever. It stops counting once the ad plays.
  useEffect(() => {
    if (!offer || watching) return
    const id = window.setTimeout(autoDecline, ADS.offerTimeoutMs)
    return () => window.clearTimeout(id)
  }, [offer, watching])

  const answer = async (code: string) => {
    const now = current.current
    if (now.phase !== 'playing' || now.feedback || now.offer || lookingUp.current) return
    const isMiss = code !== now.queue[now.index] && !isResolved(now, code)
    if (!isMiss || !canOfferRevive(now)) {
      apply({ type: 'answer', picked: code })
      return
    }
    // A miss: check whether Google has a rewarded ad ready before deciding to reveal the answer.
    lookingUp.current = true
    const found = await requestReward('second_chance')
    lookingUp.current = false
    if (current.current !== now) return
    reward.current = found
    apply(found ? { type: 'answer', picked: code, offerAt: Date.now() } : { type: 'answer', picked: code })
  }

  const revive = async () => {
    const ad = reward.current
    if (!ad || watching) return
    setWatching(true)
    const watched = await ad.show()
    setWatching(false)
    // Only a fully watched ad earns the extra life.
    apply(watched ? { type: 'revive', now: Date.now() } : { type: 'decline', now: Date.now() })
  }

  return {
    session,
    outcome,
    records,
    mastery,
    watching,
    seed,
    dailyDay,
    dailyLog,
    startDaily: (day) => {
      if (dailyLog[day]) return
      dailyRound.current = day
      setDailyDay(day)
      setSeed(null)
      // The quick mode's framing (the whole world); the daily's own queue replaces its draw.
      apply({ type: 'start', clue: dailyClue(day), mode: QUICK_MODE, queue: dailyQueue(day), now: Date.now() })
    },
    start: (clue, mode, linked) => {
      const drawn = linked ?? newSeed()
      const queue = shuffle(poolFor(mode), seededRandom(drawn))
        .slice(0, MODE_TOTALS[mode])
        .map((country) => country.code)
      dailyRound.current = null
      setDailyDay(null)
      setSeed(drawn)
      apply({ type: 'start', clue, mode, queue, now: Date.now() })
    },
    review: () => {
      const finished = current.current
      if (finished.phase !== 'finished') return
      setSeed(null)
      dailyRound.current = null
      setDailyDay(null)
      apply({
        type: 'start',
        clue: finished.clue,
        mode: finished.mode,
        queue: shuffle(finished.wrong),
        now: Date.now(),
        review: true,
      })
    },
    answer: (code) => void answer(code),
    revive: () => void revive(),
    decline: () => apply({ type: 'decline', now: Date.now() }),
    quit: () => apply({ type: 'quit', now: Date.now() }),
    leave: () => apply({ type: 'leave' }),
  }
}
