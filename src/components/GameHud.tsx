import { ADS } from '../ads/adPlacement'
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
  watching: boolean
  onWatch: () => void
  onDecline: () => void
  onQuit: () => void
}

const unique = (code: string, at: number, codes: readonly string[]) => codes.indexOf(code) === at

export function GameHud({ session, watching, onWatch, onDecline, onQuit }: GameHudProps) {
  const { locale, t } = useI18n()
  const { clue, queue, index, total, correct, wrong, feedback, offer, mode, review, reviveUsed } = session
  // The clock stops while the extra life is on offer: deciding (or watching the ad) is not playing time.
  const running = useElapsed(session.startedAt + session.pausedMs)
  const sinceOffer = useElapsed(offer ? offer.at : null)
  const elapsed = offer ? Math.max(0, offer.at - session.startedAt - session.pausedMs) : running
  const target = getCountry(queue[index])
  if (!target) return null
  const copy = t.clues[clue]

  const answered = correct.length + wrong.length
  const picked = feedback?.kind === 'wrong' ? getCountry(feedback.picked) : undefined
  const offered = offer ? getCountry(offer.picked) : undefined
  const position = Math.min(session.queue.slice(0, index + 1).filter(unique).length, total)
  const secondsLeft = Math.max(0, Math.ceil((ADS.offerTimeoutMs - sinceOffer) / 1000))
  const status = offer
    ? t.offerTitle
    : feedback
      ? feedback.kind === 'correct'
        ? copy.correctAnswer(target.name[locale])
        : copy.wrongAnswer(target.name[locale])
      : copy.prompt

  return (
    <section
      className={`${ui.panel} ${styles.hud}`}
      data-feedback={offer ? 'offer' : feedback?.kind}
      aria-label={roundName(t, clue, mode)}
    >
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
          {offer ? <Icon name="heart" size={16} /> : feedback && <Icon name={feedback.kind === 'correct' ? 'check' : 'close'} size={16} />}
          {status}
        </p>
        <h2 className={styles.target}>{clue === 'capital' ? target.capital[locale] : target.name[locale]}</h2>
        {picked && <p className={styles.detail}>{copy.wrongDetail(picked.name[locale], picked.capital[locale])}</p>}
        {offer && <p className={styles.detail}>{t.offerBody(offered?.name[locale] ?? offer.picked)}</p>}
      </div>

      {offer && (
        <div className={styles.offer}>
          <button type="button" className={ui.ghost} onClick={onDecline} disabled={watching}>
            {t.offerDecline}
            {!watching && <span className={`${ui.mono} ${styles.dim}`}>{secondsLeft}s</span>}
          </button>
          <button type="button" className={ui.primary} onClick={onWatch} disabled={watching} autoFocus>
            <Icon name="play" />
            {watching ? t.adPlaying : t.offerWatch}
          </button>
        </div>
      )}

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
          <>
            <div className={styles.wrong}>
              <dt>
                <Icon name="close" size={14} />
                <span className="visually-hidden">{t.statWrong}</span>
              </dt>
              <dd className={ui.mono}>{wrong.length}</dd>
            </div>
            <div className={styles.life} data-used={reviveUsed} title={reviveUsed ? t.extraLifeUsed : t.extraLife}>
              <dt>
                <Icon name="heart" size={14} />
              </dt>
              <dd className="visually-hidden">{reviveUsed ? t.extraLifeUsed : t.extraLife}</dd>
            </div>
          </>
        )}
        <div>
          <dt className="visually-hidden">{t.statTime}</dt>
          <dd className={ui.mono}>{formatDuration(elapsed)}</dd>
        </div>
        <button type="button" className={styles.quit} onClick={onQuit} disabled={watching}>
          {t.endGame}
        </button>
      </dl>
    </section>
  )
}
