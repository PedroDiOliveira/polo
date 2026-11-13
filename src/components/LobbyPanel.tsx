import { useState } from 'react'
import { CONTINENT_IDS, type ContinentId } from '../data/types'
import { masteredCount, type Mastery } from '../game/mastery'
import { GLOBAL_MODE, isWorldwide, MODE_TOTALS, QUICK_MODE, type ModeId } from '../game/modes'
import type { Records } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { formatDuration } from '../lib/time'
import { MAP_COLORS } from '../map/theme'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './LobbyPanel.module.css'

interface LobbyPanelProps {
  mode: ModeId
  records: Records
  mastery: Mastery
  showMastery: boolean
  onModeChange: (mode: ModeId) => void
  onToggleMastery: () => void
  onPlay: () => void
}

const WORLDWIDE_MODES = [GLOBAL_MODE, QUICK_MODE] as const

export function LobbyPanel({
  mode,
  records,
  mastery,
  showMastery,
  onModeChange,
  onToggleMastery,
  onPlay,
}: LobbyPanelProps) {
  const { t } = useI18n()
  const [lastContinent, setLastContinent] = useState<ContinentId>('south-america')
  const regional = !isWorldwide(mode)
  const total = MODE_TOTALS[mode]
  const record = records[mode]

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
    <section className={`${ui.panel} ${styles.panel}`} aria-label={t.modeLabel}>
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
            {records[id]?.perfectMs !== undefined ? (
              <PlanetMedal earned size={18} label={t.perfectBadge} />
            ) : (
              <span className={`${ui.mono} ${styles.optionCount}`}>{MODE_TOTALS[id]}</span>
            )}
          </button>
        ))}
      </div>

      {!regional && <p className={styles.note}>{mode === QUICK_MODE ? t.modeQuickNote : t.modeGlobalNote}</p>}

      <div className={styles.summary}>
        <div>
          <p className={ui.eyebrow}>{t.personalBest}</p>
          {record ? (
            <p className={styles.best}>
              <span className={ui.mono}>
                {record.best}
                <span className={styles.total}>/{total}</span>
              </span>
              {record.perfectMs !== undefined && (
                <span className={styles.perfect}>
                  <PlanetMedal earned size={20} />
                  {t.perfectIn(formatDuration(record.perfectMs))}
                </span>
              )}
            </p>
          ) : (
            <p className={styles.empty}>{t.noRecord}</p>
          )}
        </div>
        <button type="button" className={`${ui.primary} ${styles.play}`} onClick={onPlay}>
          <Icon name="play" />
          {t.play}
          <span className={`${ui.mono} ${styles.playCount}`}>{total}</span>
        </button>
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
    </section>
  )
}
