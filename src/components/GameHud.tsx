import { getCountry } from '../data/world'
import type { PlayingSession } from '../game/session'
import { useElapsed } from '../hooks/useElapsed'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import styles from './GameHud.module.css'

interface GameHudProps {
  session: PlayingSession
  onQuit: () => void
}

const unique = (code: string, at: number, codes: readonly string[]) => codes.indexOf(code) === at

export function GameHud({ session, onQuit }: GameHudProps) {
  const { locale, t } = useI18n()
  const elapsed = useElapsed(session.startedAt)
  const { clue, queue, index, total, correct, wrong, feedback, mode, review } = session
  const target = getCountry(queue[index])
  if (!target) return null
  const copy = t.clues[clue]

  const answered = correct.length + wrong.length
  const picked = feedback?.kind === 'wrong' ? getCountry(feedback.picked) : undefined
  const position = Math.min(session.queue.slice(0, index + 1).filter(unique).length, total)
  const status = feedback
    ? feedback.kind === 'correct'
      ? copy.correctAnswer(target.name[locale])
      : copy.wrongAnswer(target.name[locale])
    : copy.prompt

  return (
    <section className={`${ui.panel} ${styles.hud}`} data-feedback={feedback?.kind} aria-label={roundName(t, clue, mode)}>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t.progress(answered, total)}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
      >
        <span style={{ scale: `${answered / total} 1` }} />
      </div>

      <div className={styles.prompt} aria-live="assertive" aria-atomic="true">
        <p className={styles.status}>
          {feedback && <Icon name={feedback.kind === 'correct' ? 'check' : 'close'} size={16} />}
          {status}
        </p>
        <h2 className={styles.target}>{clue === 'capital' ? target.capital[locale] : target.name[locale]}</h2>
        {picked && <p className={styles.detail}>{copy.wrongDetail(picked.name[locale], picked.capital[locale])}</p>}
      </div>

      <dl className={styles.stats}>
        <div>
          <dt className="visually-hidden">{roundName(t, clue, mode)}</dt>
          <dd className={ui.mono}>
            {position}
            <span className={styles.dim}>/{total}</span>
          </dd>
        </div>
        <div className={styles.correct}>
          <dt>
            <Icon name="check" size={14} />
            <span className="visually-hidden">{t.statCorrect}</span>
          </dt>
          <dd className={ui.mono}>{correct.length}</dd>
        </div>
        {review ? (
          <div className={styles.tag}>
            <dt className="visually-hidden">{t.modeLabel}</dt>
            <dd>{t.reviewTag}</dd>
          </div>
        ) : (
          <div className={styles.wrong}>
            <dt>
              <Icon name="close" size={14} />
              <span className="visually-hidden">{t.statWrong}</span>
            </dt>
            <dd className={ui.mono}>{wrong.length}</dd>
          </div>
        )}
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
