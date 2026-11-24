import { useState } from 'react'
import { getCountry } from '../data/world'
import type { Country } from '../data/types'
import type { RecordOutcome } from '../game/records'
import type { FinishedSession } from '../game/session'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import { challengeUrl, compare, type Challenge } from '../share/challenge'
import { shareLink, type ShareResult } from '../share/share'
import { resultGrid, shareText } from '../share/shareText'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './ResultPanel.module.css'

interface ResultPanelProps {
  session: FinishedSession
  outcome: RecordOutcome | null
  // The seed that drew this round; null for a review round, which cannot be shared as a challenge.
  seed: string | null
  // The friend's result, when this round answered their challenge link.
  challenge: Challenge | null
  onPlayAgain: () => void
  onReview: () => void
  onLeave: () => void
  onLocate: (country: Country) => void
}

export function ResultPanel({
  session,
  outcome,
  seed,
  challenge,
  onPlayAgain,
  onReview,
  onLeave,
  onLocate,
}: ResultPanelProps) {
  const { locale, t } = useI18n()
  const [shared, setShared] = useState<ShareResult | null>(null)
  const { clue, review, total, completed } = session
  const copy = t.clues[clue]
  const correct = session.correct.length
  const perfect = outcome?.isPerfect ?? false
  const assisted = outcome?.isAssisted ?? false
  const missed = session.wrong.flatMap((code) => getCountry(code) ?? [])
  const title = review
    ? completed
      ? t.reviewDone
      : t.reviewEnded
    : perfect
      ? assisted
        ? t.resultPerfectAssisted
        : t.resultPerfect
      : completed
        ? t.resultCompleted
        : t.resultEnded

  const verdict = challenge && !review ? compare({ correct, elapsedMs: session.elapsedMs }, challenge) : null
  const shareable = !review && seed !== null
  // Proud moments get the share button lit up; the rest of the time it stays quiet.
  const proud = Boolean(verdict === 'win' || perfect || outcome?.isNewBest || outcome?.isFastestPerfect)

  const share = async () => {
    if (!seed) return
    const round = roundName(t, clue, session.mode)
    const url = challengeUrl(location.origin, locale, {
      clue,
      mode: session.mode,
      seed,
      correct,
      elapsedMs: session.elapsedMs,
    })
    const text = shareText({
      round,
      correct,
      total,
      time: formatDuration(session.elapsedMs),
      medal: perfect ? (assisted ? 'silver' : 'gold') : null,
      grid: resultGrid(session.queue, session.correct, session.wrong),
      call: verdict ? t.shareVerdict(verdict) : t.shareDare,
    })
    setShared(null)
    setShared(await shareLink(`Polo · ${round}`, text, url))
  }

  return (
    <section className={`${ui.panel} ${styles.panel}`} data-perfect={perfect} aria-live="polite">
      <div className={styles.summary}>
        {perfect && (
          <div className={styles.medal}>
            <PlanetMedal
              tier={assisted ? 'silver' : 'gold'}
              size={64}
              label={assisted ? t.medalSilver : t.medalGold}
            />
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

      {verdict && challenge && (
        <div className={styles.versus} data-verdict={verdict}>
          <p className={styles.versusTitle}>{t.challengeResult(verdict)}</p>
          <dl className={styles.versusScores}>
            <div>
              <dt className={ui.eyebrow}>{t.challengeYou}</dt>
              <dd className={ui.mono}>
                {correct}/{total} · {formatDuration(session.elapsedMs)}
              </dd>
            </div>
            <div>
              <dt className={ui.eyebrow}>{t.challengeFriend}</dt>
              <dd className={ui.mono}>
                {challenge.correct}/{total} · {formatDuration(challenge.elapsedMs)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {(outcome?.isNewBest || outcome?.isFastestPerfect) && (
        <p className={styles.badge}>
          <Icon name="check" size={14} />
          {outcome.isFastestPerfect ? (assisted ? t.fastestAssisted : t.fastestPerfect) : t.newBest}
        </p>
      )}

      {assisted && <p className={styles.invite}>{t.goldInvite}</p>}

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
        {shareable && (
          <button type="button" className={`${ui.ghost} ${styles.share}`} data-proud={proud} onClick={() => void share()}>
            <Icon name="share" size={16} />
            {verdict ? t.challengeAgain : t.share}
          </button>
        )}
        <button type="button" className={ui.primary} onClick={onPlayAgain}>
          <Icon name="play" />
          {t.playAgain}
        </button>
      </div>
      <p className={styles.shareStatus} role="status">
        {shared === 'copied' ? t.shareCopied : shared === 'failed' ? t.shareFailed : ''}
      </p>
    </section>
  )
}
