import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { GameHud } from './components/GameHud'
import { Header } from './components/Header'
import { LobbyPanel } from './components/LobbyPanel'
import { RecordsDialog } from './components/RecordsDialog'
import { ResultPanel } from './components/ResultPanel'
import { describePlace, getCountry } from './data/world'
import { CONTINENT_BOUNDS } from './game/camera'
import { GLOBAL_MODE, type ModeId } from './game/modes'
import { FEEDBACK_MS, useGame } from './hooks/useGame'
import { useI18n } from './i18n/I18nContext'
import type { MapFocus, MapSignal } from './map/MapView'

// The map engine is by far the heaviest dependency: load it in its own chunk so the shell paints first.
const MapView = lazy(() => import('./map/MapView').then((module) => ({ default: module.MapView })))

const NONE: readonly string[] = []

export function App() {
  const { locale } = useI18n()
  const { session, outcome, records, start, answer, quit, leave } = useGame()
  const [mode, setMode] = useState<ModeId>(GLOBAL_MODE)
  const [focus, setFocus] = useState<MapFocus>({ id: 0, bounds: null })
  const [recordsOpen, setRecordsOpen] = useState(false)

  const playing = session.phase === 'playing'
  const feedback = playing ? session.feedback : null
  const correct = session.phase === 'lobby' ? NONE : session.correct
  const allWrong = session.phase === 'lobby' ? NONE : session.wrong

  // A missed country only turns red once its reveal animation is over.
  const wrong = useMemo(
    () => (feedback?.kind === 'wrong' ? allWrong.filter((code) => code !== feedback.target) : allWrong),
    [allWrong, feedback],
  )

  const signal = useMemo<MapSignal | null>(() => {
    if (!feedback) return null
    return {
      code: feedback.target,
      kind: feedback.kind,
      label: getCountry(feedback.target)?.name[locale] ?? '',
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

  const play = (selected: ModeId) => {
    start(selected)
    setFocus((current) => ({
      id: current.id + 1,
      bounds: selected === GLOBAL_MODE ? null : CONTINENT_BOUNDS[selected],
    }))
  }

  const perfectCount = Object.values(records).filter((record) => record.perfectMs !== undefined).length

  return (
    <main>
      <Suspense fallback={null}>
        <MapView
          locale={locale}
          showCapitals={!playing}
          correct={correct}
          wrong={wrong}
          signal={signal}
          focus={focus}
          tooltipFor={tooltipFor}
          onPick={handlePick}
        />
      </Suspense>
      <Header perfectCount={perfectCount} onOpenRecords={() => setRecordsOpen(true)} />
      {session.phase === 'lobby' && (
        <LobbyPanel mode={mode} records={records} onModeChange={setMode} onPlay={() => play(mode)} />
      )}
      {session.phase === 'playing' && <GameHud session={session} onQuit={quit} />}
      {session.phase === 'finished' && (
        <ResultPanel session={session} outcome={outcome} onPlayAgain={() => play(session.mode)} onLeave={leave} />
      )}
      <RecordsDialog open={recordsOpen} records={records} onClose={() => setRecordsOpen(false)} />
    </main>
  )
}
