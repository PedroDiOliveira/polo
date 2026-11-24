import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { interstitialBreak } from './ads/adPlacement'
import { DailyStrip } from './components/DailyStrip'
import { GameHud } from './components/GameHud'
import { InviteCard } from './components/InviteCard'
import { Header } from './components/Header'
import { LobbyPanel } from './components/LobbyPanel'
import { RecordsDialog } from './components/RecordsDialog'
import { ResultPanel } from './components/ResultPanel'
import { describePlace, getCountry } from './data/world'
import { CONTINENT_BOUNDS } from './game/camera'
import type { Country } from './data/types'
import { dailyClue, dayNumber, streakOf } from './game/daily'
import { groupByLevel } from './game/mastery'
import {
  DEFAULT_CLUE,
  GLOBAL_MODE,
  isClue,
  isModeId,
  isWorldwide,
  MODE_TOTALS,
  QUICK_MODE,
  type Clue,
  type ModeId,
} from './game/modes'
import { countMedals } from './game/records'
import { useToday } from './hooks/useDaily'
import { FEEDBACK_MS, useGame } from './hooks/useGame'
import { useI18n } from './i18n/I18nContext'
import { roundName } from './i18n/messages'
import { formatDuration } from './lib/time'
import type { MapFill } from './map/layers'
import type { MapFocus, MapInset, MapSignal } from './map/MapView'
import { MAP_COLORS } from './map/theme'
import { isDailyLink, parseChallenge, type Challenge } from './share/challenge'

// The map engine is by far the heaviest dependency: load it in its own chunk so the shell paints first.
const MapView = lazy(() => import('./map/MapView').then((module) => ({ default: module.MapView })))

const NONE: readonly string[] = []
const NO_INSET: MapInset = { left: 0, bottom: 0 }

// The content pages link straight to a game, such as /?mode=africa&clue=country.
function linkedChoice(): { clue: Clue; mode: ModeId } {
  const params = new URLSearchParams(location.search)
  const clue = params.get('clue') ?? ''
  const mode = params.get('mode') ?? ''
  return { clue: isClue(clue) ? clue : DEFAULT_CLUE, mode: isModeId(mode) ? mode : GLOBAL_MODE }
}

export function App() {
  const { locale, t } = useI18n()
  const game = useGame()
  const { session, outcome, records, mastery, watching, seed, start, review, answer, revive, decline, quit, leave } =
    game
  const { dailyDay, dailyLog, startDaily } = game
  const today = useToday()
  // A friend's challenge link: offered once on arrival, then remembered while its round is played.
  const [invite, setInvite] = useState<Challenge | null>(() => parseChallenge(location.search))
  const [accepted, setAccepted] = useState<Challenge | null>(null)
  // A shared daily link: offered on arrival, unless today's daily is already played.
  const [dailyInvite, setDailyInvite] = useState(() => isDailyLink(location.search) && !dailyLog[today])
  const [clue, setClue] = useState<Clue>(() => linkedChoice().clue)
  const [mode, setMode] = useState<ModeId>(() => linkedChoice().mode)
  const [focus, setFocus] = useState<MapFocus>({ id: 0, bounds: null })
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [showMastery, setShowMastery] = useState(false)
  const [lobbyInset, setLobbyInset] = useState<MapInset>(NO_INSET)

  // Drop the friend's score from the address bar, so a reload or a bookmark does not offer the challenge again.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!['seed', 'daily', 'medal'].some((key) => params.has(key))) return
    for (const key of ['seed', 'score', 'time', 'total', 'daily', 'medal', 'n']) params.delete(key)
    const query = params.toString()
    history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`)
  }, [])

  const playing = session.phase === 'playing'
  // Outside the lobby the round's own clue wins, even if the records dialog switched the lobby's choice meanwhile.
  const activeClue = session.phase === 'lobby' ? clue : session.clue
  const feedback = playing ? session.feedback : null
  const correct = session.phase === 'lobby' ? NONE : session.correct
  const allWrong = session.phase === 'lobby' ? NONE : session.wrong

  // A missed country only turns red once its reveal animation is over.
  const wrong = useMemo(
    () => (feedback?.kind === 'wrong' ? allWrong.filter((code) => code !== feedback.target) : allWrong),
    [allWrong, feedback],
  )

  const fills = useMemo<MapFill[]>(() => {
    if (session.phase === 'lobby' && showMastery) {
      return groupByLevel(mastery[clue]).map((codes, level) => ({ color: MAP_COLORS.mastery[level], codes }))
    }
    return [
      { color: MAP_COLORS.correct, codes: correct },
      { color: MAP_COLORS.wrong, codes: wrong },
    ]
  }, [session.phase, showMastery, mastery, clue, correct, wrong])

  const signal = useMemo<MapSignal | null>(() => {
    const target = feedback && getCountry(feedback.target)
    if (!feedback || !target) return null
    const [capital, name] = [target.capital[locale], target.name[locale]]
    return {
      code: target.code,
      kind: feedback.kind,
      // The clue comes first, the answer second: "Paris · France" or "France · Paris".
      label: activeClue === 'capital' ? `${capital} · ${name}` : `${name} · ${capital}`,
      durationMs: FEEDBACK_MS[feedback.kind],
    }
  }, [feedback, locale, activeClue])

  const tooltipFor = useCallback(
    (code: string) => {
      const place = describePlace(code)
      if (!place) return null
      // In the country game the name is the question itself, so hovering must not reveal it.
      if (playing && activeClue === 'country') return null
      if (playing) return (place.owner ?? place).name[locale]
      return place.owner && !place.isCountry
        ? `${place.name[locale]} · ${place.owner.name[locale]}`
        : place.name[locale]
    },
    [locale, playing, activeClue],
  )

  const handlePick = (code: string) => {
    const owner = describePlace(code)?.owner
    if (playing && owner) answer(owner.code)
  }

  const frame = (selected: ModeId) =>
    setFocus((current) => ({
      id: current.id + 1,
      bounds: isWorldwide(selected) ? null : CONTINENT_BOUNDS[selected],
    }))

  const play = (selectedClue: Clue, selected: ModeId, linkedSeed?: string) => {
    start(selectedClue, selected, linkedSeed)
    frame(selected)
  }

  const acceptChallenge = (challenge: Challenge) => {
    setInvite(null)
    setAccepted(challenge)
    play(challenge.clue, challenge.mode, challenge.seed)
  }

  // The comparison only holds for the exact round the friend played; "play again" draws a new one.
  const answered =
    accepted && session.phase === 'finished' && !session.review && seed === accepted.seed ? accepted : null

  const playDaily = () => {
    setDailyInvite(false)
    startDaily(today)
    frame(QUICK_MODE)
  }

  const todaysResult = dailyLog[today] ?? null
  const finishedDaily = session.phase === 'finished' && !session.review && dailyDay ? dailyLog[dailyDay] : undefined
  const dailyOutcome =
    finishedDaily && dailyDay ? { day: dailyDay, result: finishedDaily, streak: streakOf(dailyLog, dailyDay) } : null

  const startReview = () => {
    if (session.phase !== 'finished') return
    review()
    frame(session.mode)
  }

  const locate = (country: Country) => setFocus((current) => ({ id: current.id + 1, bounds: country.bounds }))

  const medals = countMedals(records)

  // Every way out of the result screen is a natural break: that is where the interstitial may play,
  // after the player has seen their score. Google decides whether one actually shows.
  const breaking = useRef(false)
  const afterBreak = (action: () => void) => {
    if (breaking.current) return
    breaking.current = true
    void interstitialBreak('game_end').then(() => {
      breaking.current = false
      action()
    })
  }

  return (
    <main>
      <Suspense fallback={null}>
        <MapView
          locale={locale}
          showCapitals={!playing}
          fills={fills}
          hatched={wrong}
          signal={signal}
          focus={focus}
          // Only the lobby panel keeps the globe off-centre; rounds use the whole screen as before.
          inset={session.phase === 'lobby' ? lobbyInset : NO_INSET}
          tooltipFor={tooltipFor}
          onPick={handlePick}
        />
      </Suspense>
      <Header medals={medals} onOpenRecords={() => setRecordsOpen(true)} />
      {session.phase === 'lobby' && invite && (
        <InviteCard
          eyebrow={roundName(t, invite.clue, invite.mode)}
          title={t.challengeTitle}
          body={t.challengeBody(
            roundName(t, invite.clue, invite.mode),
            invite.correct,
            MODE_TOTALS[invite.mode],
            formatDuration(invite.elapsedMs),
          )}
          accept={t.challengeAccept}
          dismiss={t.challengeDismiss}
          onAccept={() => acceptChallenge(invite)}
          onDismiss={() => setInvite(null)}
        />
      )}
      {session.phase === 'lobby' && !invite && dailyInvite && (
        <InviteCard
          eyebrow={t.dailyRound(dayNumber(today), t.clues[dailyClue(today)].name)}
          title={t.dailyInviteTitle}
          body={t.dailyInviteBody(dailyClue(today))}
          accept={t.dailyAccept}
          dismiss={t.challengeDismiss}
          onAccept={playDaily}
          onDismiss={() => setDailyInvite(false)}
        />
      )}
      {session.phase === 'lobby' && !invite && !dailyInvite && (
        <LobbyPanel
          daily={<DailyStrip day={today} result={todaysResult} streak={streakOf(dailyLog, today)} onPlay={playDaily} />}
          clue={clue}
          mode={mode}
          records={records}
          mastery={mastery[clue]}
          showMastery={showMastery}
          onClueChange={setClue}
          onModeChange={setMode}
          onToggleMastery={() => setShowMastery((current) => !current)}
          onPlay={() => play(clue, mode)}
          onInsetChange={setLobbyInset}
        />
      )}
      {session.phase === 'playing' && (
        <GameHud session={session} watching={watching} onWatch={revive} onDecline={decline} onQuit={quit} />
      )}
      {session.phase === 'finished' && (
        <ResultPanel
          session={session}
          outcome={outcome}
          seed={seed}
          challenge={answered}
          daily={dailyOutcome}
          onPlayAgain={() => afterBreak(() => play(session.clue, session.mode))}
          onReview={() => afterBreak(startReview)}
          onLeave={() => afterBreak(leave)}
          onLocate={locate}
        />
      )}
      <RecordsDialog
        open={recordsOpen}
        records={records}
        clue={clue}
        onClueChange={setClue}
        onClose={() => setRecordsOpen(false)}
      />
    </main>
  )
}
