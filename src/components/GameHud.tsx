import { getCountry } from '../data/world'
import type { Session } from '../game/session'
import { useElapsed } from '../hooks/useElapsed'
import { useI18n } from '../i18n/I18nContext'
import { modeName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import styles from './GameHud.module.css'

interface GameHudProps {
  session: Extract<Session, { phase: 'playing' }>
  onQuit: () => void
}

export function GameHud({ session, onQuit }: GameHudProps) {
  const { locale, t } = useI18n()
  const elapsed = useElapsed(session.startedAt)
  const { queue, index, correct, wrong, feedback, mode } = session
  const target = getCountry(queue[index])
  if (!target) return null

  const answered = correct.length + wrong.length
  const status = feedback
    ? feedback.kind === 'correct'
      ? t.correctAnswer(target.name[locale])
      : t.wrongAnswer(target.name[locale])
    : t.prompt

  return (
    <section className={`${ui.panel} ${styles.hud}`} data-feedback={feedback?.kind} aria-label={modeName(t, mode)}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t.progress(answered, queue.length)}
        aria-valuemin={0}
        aria-valuemax={queue.length}
        aria-valuenow={answered}
      >
        <span style={{ scale: `${answered / queue.length} 1` }} />
      </div>

      <div className={styles.prompt} aria-live="assertive" aria-atomic="true">
        <p className={styles.status}>
          {feedback && <Icon name={feedback.kind === 'correct' ? 'check' : 'close'} size={16} />}
          {status}
        </p>
        <h2 className={styles.capital}>{target.capital[locale]}</h2>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt className="visually-hidden">{modeName(t, mode)}</dt>
          <dd className={ui.mono}>
            {Math.min(index + 1, queue.length)}
            <span className={styles.dim}>/{queue.length}</span>
          </dd>
        </div>
        <div className={styles.correct}>
          <dt>
            <Icon name="check" size={14} />
            <span className="visually-hidden">{t.statCorrect}</span>
          </dt>
          <dd className={ui.mono}>{correct.length}</dd>
        </div>
        <div className={styles.wrong}>
          <dt>
            <Icon name="close" size={14} />
            <span className="visually-hidden">{t.statWrong}</span>
          </dt>
          <dd className={ui.mono}>{wrong.length}</dd>
        </div>
        <div>
          <dt className="visually-hidden">{t.statTime}</dt>
          <dd className={ui.mono}>{formatDuration(elapsed)}</dd>
        </div>
        <button type="button" className={styles.quit} onClick={onQuit}>
          {t.endGame}
        </button>
      </dl>
    </section>
  )
}
