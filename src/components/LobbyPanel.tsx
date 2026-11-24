import { useLayoutEffect, useRef, useState } from 'react'
import { CONTINENT_IDS, type ContinentId } from '../data/types'
import { masteredCount, type Mastery } from '../game/mastery'
import { GLOBAL_MODE, isWorldwide, MODE_TOTALS, QUICK_MODE, type Clue, type ModeId } from '../game/modes'
import PAGES from '../config/pages.json'
import { medalFor, type Records } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { readLocal, writeLocal } from '../lib/storage'
import { formatDuration } from '../lib/time'
import type { MapInset } from '../map/MapView'
import { MAP_COLORS } from '../map/theme'
import ui from '../styles/primitives.module.css'
import { CluePicker } from './CluePicker'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './LobbyPanel.module.css'

interface LobbyPanelProps {
  clue: Clue
  mode: ModeId
  records: Records
  mastery: Mastery
  showMastery: boolean
  onClueChange: (clue: Clue) => void
  onModeChange: (mode: ModeId) => void
  onToggleMastery: () => void
  onPlay: () => void
  onInsetChange: (inset: MapInset) => void
}

const WORLDWIDE_MODES = [GLOBAL_MODE, QUICK_MODE] as const
// The static content pages, reachable from the game itself so readers and crawlers can find them.
const PAGE_LINKS = ['howTo', 'about', 'privacy', 'terms', 'contact'] as const
const COLLAPSED_KEY = 'polo.lobby.collapsed'
// Keep in sync with the media query in LobbyPanel.module.css: from here on the panel docks to the left.
const DOCKED_QUERY = '(min-width: 960px)'

export function LobbyPanel({
  clue,
  mode,
  records,
  mastery,
  showMastery,
  onClueChange,
  onModeChange,
  onToggleMastery,
  onPlay,
  onInsetChange,
}: LobbyPanelProps) {
  const { locale, t } = useI18n()
  const panelRef = useRef<HTMLElement>(null)
  const [collapsed, setCollapsed] = useState(() => readLocal(COLLAPSED_KEY) === '1')
  const [lastContinent, setLastContinent] = useState<ContinentId>('south-america')
  const regional = !isWorldwide(mode)
  const total = MODE_TOTALS[mode]
  const deck = records[clue] ?? {}
  const record = deck[mode]

  // Tell the map how much of the screen the panel covers, so the globe centres in the free space.
  // Measured on fold and on resize only: re-centring on every option change would make the globe twitch.
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const docked = window.matchMedia(DOCKED_QUERY)
    const measure = () => {
      // Offsets, not the bounding box: the entry animation's translate must not leak into the inset.
      // Only the full panel docks as a column; the folded bar always sits along the bottom edge.
      onInsetChange(
        docked.matches && !collapsed
          ? { left: panel.offsetLeft + panel.offsetWidth, bottom: 0 }
          : { left: 0, bottom: Math.max(0, window.innerHeight - panel.offsetTop) },
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [collapsed, onInsetChange])

  const fold = (next: boolean) => {
    setCollapsed(next)
    writeLocal(COLLAPSED_KEY, next ? '1' : '0')
  }

  const playButton = (
    <button type="button" className={`${ui.primary} ${styles.play}`} onClick={onPlay}>
      <Icon name="play" />
      {t.play}
      <span className={`${ui.mono} ${styles.playCount}`}>{total}</span>
    </button>
  )

  if (collapsed) {
    return (
      <section
        key="compact"
        ref={panelRef}
        className={`${ui.panel} ${styles.panel} ${styles.compact}`}
        aria-label={t.modeLabel}
      >
        <button
          type="button"
          className={styles.expand}
          onClick={() => fold(false)}
          aria-expanded={false}
          aria-label={t.lobbyExpand}
          title={t.lobbyExpand}
        >
          <span className={styles.foldIcon}>
            <Icon name="chevronUp" />
          </span>
          <span className={styles.compactText}>
            <span className={styles.compactRound}>{roundName(t, clue, mode)}</span>
            {record && (
              <span className={`${ui.mono} ${styles.compactBest}`}>
                {record.best}/{total}
              </span>
            )}
          </span>
        </button>
        {playButton}
      </section>
    )
  }

  const selectContinent = (continent: ContinentId) => {
    setLastContinent(continent)
    onModeChange(continent)
  }

  const options = regional
    ? CONTINENT_IDS.map((id) => ({ id, label: t.continents[id], select: () => selectContinent(id) }))
    : WORLDWIDE_MODES.map((id) => ({
        id,
        label: id === GLOBAL_MODE ? t.modeFull : t.modeQuick,
        select: () => onModeChange(id),
      }))

  return (
    <section key="full" ref={panelRef} className={`${ui.panel} ${styles.panel}`} aria-label={t.modeLabel}>
      <div className={styles.game}>
        <div className={styles.top}>
          <CluePicker value={clue} onChange={onClueChange} className={styles.clues} />
          <button
            type="button"
            className={styles.collapse}
            onClick={() => fold(true)}
            aria-expanded
            aria-label={t.lobbyCollapse}
            title={t.lobbyCollapse}
          >
            <Icon name="chevronDown" />
          </button>
        </div>
        {/* Re-keyed so the line fades in again on every switch: the change of game is impossible to miss. */}
        <p key={clue} className={styles.clueNote}>
          {t.clues[clue].note}
        </p>
      </div>

      <div className={styles.segmented} role="radiogroup" aria-label={t.modeLabel}>
        <button
          type="button"
          role="radio"
          aria-checked={!regional}
          className={styles.segment}
          onClick={() => onModeChange(GLOBAL_MODE)}
        >
          {t.modeGlobal}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={regional}
          className={styles.segment}
          onClick={() => onModeChange(lastContinent)}
        >
          {t.modeRegional}
        </button>
      </div>

      <div className={styles.options} role="radiogroup" aria-label={regional ? t.continentLabel : t.lengthLabel}>
        {options.map(({ id, label, select }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            className={styles.option}
            onClick={select}
          >
            <span>{label}</span>
            {medalFor(deck[id]) ? (
              <PlanetMedal
                tier={medalFor(deck[id])}
                size={18}
                label={medalFor(deck[id]) === 'gold' ? t.medalGold : t.medalSilver}
              />
            ) : (
              <span className={`${ui.mono} ${styles.optionCount}`}>{MODE_TOTALS[id]}</span>
            )}
          </button>
        ))}
      </div>

      {!regional && <p className={styles.note}>{mode === QUICK_MODE ? t.clues[clue].quickNote : t.modeGlobalNote}</p>}

      <div className={styles.summary}>
        <div>
          <p className={ui.eyebrow}>{t.personalBest}</p>
          {record ? (
            <p className={styles.best}>
              <span className={ui.mono}>
                {record.best}
                <span className={styles.total}>/{total}</span>
              </span>
              {record.perfectMs !== undefined ? (
                <span className={styles.perfect}>
                  <PlanetMedal tier="gold" size={20} />
                  {t.perfectIn(formatDuration(record.perfectMs))}
                </span>
              ) : (
                record.assistedMs !== undefined && (
                  <span className={styles.perfect}>
                    <PlanetMedal tier="silver" size={20} />
                    {t.assistedIn(formatDuration(record.assistedMs))}
                  </span>
                )
              )}
            </p>
          ) : (
            <p className={styles.empty}>{t.noRecord}</p>
          )}
        </div>
        {playButton}
      </div>

      <div className={styles.mastery}>
        <button
          type="button"
          role="switch"
          aria-checked={showMastery}
          className={styles.masteryToggle}
          onClick={onToggleMastery}
        >
          <span className={styles.switch} aria-hidden="true" />
          <span>{t.masteryToggle}</span>
          <span className={`${ui.mono} ${styles.masteryCount}`}>
            {t.masteryCount(masteredCount(mastery), MODE_TOTALS[GLOBAL_MODE])}
          </span>
        </button>
        {showMastery && (
          <ul className={styles.legend}>
            {t.masteryLevels.map((label, level) => (
              <li key={label}>
                <span className={styles.swatch} style={{ background: MAP_COLORS.mastery[level] }} />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={styles.hint}>
        {t.lobbyHint} <span className={styles.credit}>{t.dataCredit}</span>
      </p>

      <nav className={styles.pages} aria-label={t.pages.label}>
        {PAGE_LINKS.map((key) => (
          <a key={key} href={PAGES[key][locale]}>
            {t.pages[key]}
          </a>
        ))}
      </nav>
    </section>
  )
}
