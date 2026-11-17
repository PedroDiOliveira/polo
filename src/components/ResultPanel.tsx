import { getCountry } from '../data/world'
import type { Country } from '../data/types'
import type { RecordOutcome } from '../game/records'
import type { FinishedSession } from '../game/session'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  session: FinishedSession
  outcome: RecordOutcome | null
  onPlayAgain: () => void
  onReview: () => void
  onLeave: () => void
  onLocate: (country: Country) => void
}

export function ResultPanel({ session, outcome, onPlayAgain, onReview, onLeave, onLocate }: ResultPanelProps) {
  const { locale, t } = useI18n()
  const { clue, review, total, completed } = session
  const copy = t.clues[clue]
  const correct = session.correct.length
  const perfect = outcome?.isPerfect ?? false
  const missed = session.wrong.flatMap((code) => getCountry(code) ?? [])
  const title = review
    ? completed
      ? t.reviewDone
      : t.reviewEnded
    : perfect
      ? t.resultPerfect
      : completed
        ? t.resultCompleted
        : t.resultEnded

  return (
    <section className={`${ui.panel} ${styles.panel}`} data-perfect={perfect} aria-live="polite">
      <div className={styles.summary}>
        {perfect && (
          <div className={styles.medal}>
            <PlanetMedal earned size={64} />
          </div>
        )}
        <div>
          <p className={ui.eyebrow}>{review ? `${t.reviewTag} · ${copy.name}` : roundName(t, clue, session.mode)}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={`${ui.mono} ${styles.score}`} aria-label={copy.score(correct, total)}>
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
          <span className={ui.eyebrow}>{review ? copy.reviewed : t.statCorrect}</span>
          <span className={ui.mono}>{correct}</span>
        </li>
        {!review && (
          <li className={styles.wrong}>
            <span className={ui.eyebrow}>{t.statWrong}</span>
            <span className={ui.mono}>{missed.length}</span>
          </li>
        )}
      </ul>

      {(outcome?.isNewBest || outcome?.isFastestPerfect) && (
        <p className={styles.badge}>
          <Icon name="check" size={14} />
          {outcome.isFastestPerfect ? t.fastestPerfect : t.newBest}
        </p>
      )}

      {missed.length > 0 && (
        <div className={styles.missed}>
          <p className={ui.eyebrow}>{t.missedTitle}</p>
          <ul className={styles.missedList}>
            {missed.map((country) => (
              <li key={country.code}>
                <button
                  type="button"
                  className={styles.missedItem}
                  onClick={() => onLocate(country)}
                  aria-label={t.showOnMap(country.name[locale])}
                >
                  {clue === 'capital' ? (
                    <>
                      <span className={styles.missedMain}>{country.capital[locale]}</span>
                      <span className={styles.missedSub}>{country.name[locale]}</span>
                    </>
                  ) : (
                    <span className={styles.missedMain}>{country.name[locale]}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.offer}>
            <p>{copy.reviewOffer(missed.length)}</p>
            <button type="button" className={styles.offerButton} onClick={onReview}>
              {t.reviewStart}
            </button>
          </div>
        </div>
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
