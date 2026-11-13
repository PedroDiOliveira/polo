import type { RecordOutcome } from '../game/records'
import type { Session } from '../game/session'
import { useI18n } from '../i18n/I18nContext'
import { modeName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  session: Extract<Session, { phase: 'finished' }>
  outcome: RecordOutcome | null
  onPlayAgain: () => void
  onLeave: () => void
}

export function ResultPanel({ session, outcome, onPlayAgain, onLeave }: ResultPanelProps) {
  const { t } = useI18n()
  const total = session.queue.length
  const correct = session.correct.length
  const perfect = outcome?.isPerfect ?? false
  const title = perfect ? t.resultPerfect : session.completed ? t.resultCompleted : t.resultEnded

  return (
    <section className={`${ui.panel} ${styles.panel}`} data-perfect={perfect} aria-live="polite">
      <div className={styles.summary}>
        {perfect && (
          <div className={styles.medal}>
            <PlanetMedal earned size={64} />
          </div>
        )}
        <div>
          <p className={ui.eyebrow}>{modeName(t, session.mode)}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={`${ui.mono} ${styles.score}`} aria-label={t.resultScore(correct, total)}>
          {correct}
          <span className={styles.total}>/{total}</span>
        </p>
      </div>

      <ul className={styles.facts}>
        <li>
          <span className={ui.eyebrow}>{t.statTime}</span>
          <span className={ui.mono}>{formatDuration(session.elapsedMs)}</span>
        </li>
        <li className={styles.correct}>
          <span className={ui.eyebrow}>{t.statCorrect}</span>
          <span className={ui.mono}>{correct}</span>
        </li>
        <li className={styles.wrong}>
          <span className={ui.eyebrow}>{t.statWrong}</span>
          <span className={ui.mono}>{session.wrong.length}</span>
        </li>
      </ul>

      {(outcome?.isNewBest || outcome?.isFastestPerfect) && (
        <p className={styles.badge}>
          <Icon name="check" size={14} />
          {outcome.isFastestPerfect ? t.fastestPerfect : t.newBest}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={ui.ghost} onClick={onLeave}>
          <Icon name="back" size={16} />
          {t.backToLobby}
        </button>
        <button type="button" className={ui.primary} onClick={onPlayAgain}>
          <Icon name="play" />
          {t.playAgain}
        </button>
      </div>
    </section>
  )
}
