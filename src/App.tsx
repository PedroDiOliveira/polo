import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { GameHud } from './components/GameHud'
import { Header } from './components/Header'
import { LobbyPanel } from './components/LobbyPanel'
import { RecordsDialog } from './components/RecordsDialog'
import { ResultPanel } from './components/ResultPanel'
import { describePlace, getCountry } from './data/world'
import { CONTINENT_BOUNDS } from './game/camera'
import type { Country } from './data/types'
import { groupByLevel } from './game/mastery'
import { GLOBAL_MODE, isWorldwide, type ModeId } from './game/modes'
import { FEEDBACK_MS, useGame } from './hooks/useGame'
import { useI18n } from './i18n/I18nContext'
import type { MapFill } from './map/layers'
import type { MapFocus, MapSignal } from './map/MapView'
import { MAP_COLORS } from './map/theme'

// The map engine is by far the heaviest dependency: load it in its own chunk so the shell paints first.
const MapView = lazy(() => import('./map/MapView').then((module) => ({ default: module.MapView })))

const NONE: readonly string[] = []

export function App() {
  const { locale } = useI18n()
  const { session, outcome, records, mastery, start, review, answer, quit, leave } = useGame()
  const [mode, setMode] = useState<ModeId>(GLOBAL_MODE)
  const [focus, setFocus] = useState<MapFocus>({ id: 0, bounds: null })
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [showMastery, setShowMastery] = useState(false)

  const playing = session.phase === 'playing'
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
      return groupByLevel(mastery).map((codes, level) => ({ color: MAP_COLORS.mastery[level], codes }))
    }
    return [
      { color: MAP_COLORS.correct, codes: correct },
      { color: MAP_COLORS.wrong, codes: wrong },
    ]
  }, [session.phase, showMastery, mastery, correct, wrong])

  const signal = useMemo<MapSignal | null>(() => {
    const target = feedback && getCountry(feedback.target)
    if (!feedback || !target) return null
    return {
      code: target.code,
      kind: feedback.kind,
      label: `${target.capital[locale]} · ${target.name[locale]}`,
      durationMs: FEEDBACK_MS[feedback.kind],
    }
  }, [feedback, locale])

  const tooltipFor = useCallback(
    (code: string) => {
      const place = describePlace(code)
      if (!place) return null
      if (playing) return (place.owner ?? place).name[locale]
      return place.owner && !place.isCountry
        ? `${place.name[locale]} · ${place.owner.name[locale]}`
        : place.name[locale]
    },
    [locale, playing],
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

  const play = (selected: ModeId) => {
    start(selected)
    frame(selected)
  }

  const startReview = () => {
    if (session.phase !== 'finished') return
    review()
    frame(session.mode)
  }

  const locate = (country: Country) => setFocus((current) => ({ id: current.id + 1, bounds: country.bounds }))

  const perfectCount = Object.values(records).filter((record) => record.perfectMs !== undefined).length

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
          tooltipFor={tooltipFor}
          onPick={handlePick}
        />
      </Suspense>
      <Header perfectCount={perfectCount} onOpenRecords={() => setRecordsOpen(true)} />
      {session.phase === 'lobby' && (
        <LobbyPanel
          mode={mode}
          records={records}
          mastery={mastery}
          showMastery={showMastery}
          onModeChange={setMode}
          onToggleMastery={() => setShowMastery((current) => !current)}
          onPlay={() => play(mode)}
        />
      )}
      {session.phase === 'playing' && <GameHud session={session} onQuit={quit} />}
      {session.phase === 'finished' && (
        <ResultPanel
          session={session}
          outcome={outcome}
          onPlayAgain={() => play(session.mode)}
          onReview={startReview}
          onLeave={leave}
          onLocate={locate}
        />
      )}
      <RecordsDialog open={recordsOpen} records={records} onClose={() => setRecordsOpen(false)} />
    </main>
  )
}
