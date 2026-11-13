import { useState } from 'react'
import { CONTINENT_IDS, type ContinentId } from '../data/types'
import { GLOBAL_MODE, MODE_TOTALS, type ModeId } from '../game/modes'
import type { Records } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './LobbyPanel.module.css'

interface LobbyPanelProps {
  mode: ModeId
  records: Records
  onModeChange: (mode: ModeId) => void
  onPlay: () => void
}

export function LobbyPanel({ mode, records, onModeChange, onPlay }: LobbyPanelProps) {
  const { t } = useI18n()
  const [lastContinent, setLastContinent] = useState<ContinentId>('south-america')
  const regional = mode !== GLOBAL_MODE
  const total = MODE_TOTALS[mode]
  const record = records[mode]

  const selectContinent = (continent: ContinentId) => {
    setLastContinent(continent)
    onModeChange(continent)
  }

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

      {regional ? (
        <div className={styles.continents} role="radiogroup" aria-label={t.continentLabel}>
          {CONTINENT_IDS.map((continent) => (
            <button
              key={continent}
              type="button"
              role="radio"
              aria-checked={mode === continent}
              className={styles.continent}
              onClick={() => selectContinent(continent)}
            >
              <span>{t.continents[continent]}</span>
              {records[continent]?.perfectMs !== undefined ? (
                <PlanetMedal earned size={18} label={t.perfectBadge} />
              ) : (
                <span className={`${ui.mono} ${styles.continentCount}`}>{MODE_TOTALS[continent]}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.note}>{t.modeGlobalNote}</p>
      )}

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

      <p className={styles.hint}>
        {t.lobbyHint} <span className={styles.credit}>{t.dataCredit}</span>
      </p>
    </section>
  )
}
