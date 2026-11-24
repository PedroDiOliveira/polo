import { useEffect, useState } from 'react'
import { getCountry, regionFeatures } from '../data/world'
import type { Country } from '../data/types'
import { CONTINENT_BOUNDS } from '../game/camera'
import { dayNumber, type DailyResult, type DayKey } from '../game/daily'
import { isWorldwide } from '../game/modes'
import { masteryOf, type RecordOutcome } from '../game/records'
import type { FinishedSession } from '../game/session'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import { challengeUrl, compare, type Challenge } from '../share/challenge'
import { dailyShare } from '../share/dailyShare'
import { saveImage, shareResult, type ShareResult } from '../share/share'
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
  // Set when this round was the daily Polo: it shares the day's link and cannot be played again.
  daily: { day: DayKey; result: DailyResult; streak: number } | null
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
  daily,
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
  const shareable = !review && (seed !== null || daily !== null)
  // Proud moments get the share button lit up; the rest of the time it stays quiet. The daily is always
  // worth posting: comparing the same ten questions is the whole point of it.
  const proud = Boolean(daily || verdict === 'win' || perfect || outcome?.isNewBest || outcome?.isFastestPerfect)

  const medal = perfect ? (assisted ? 'silver' : 'gold') : null
  // The gold medal's mastery after this run. The daily keeps no records, so it has none.
  const mastery = medal === 'gold' && !daily && !review ? masteryOf(outcome?.records[clue]?.[session.mode]) : 0
  const round = daily ? t.dailyRound(dayNumber(daily.day), copy.name) : roundName(t, clue, session.mode)
  const time = formatDuration(session.elapsedMs)
  const call = daily ? t.dailyDare : verdict ? t.shareVerdict(verdict) : t.shareDare

  // The card is drawn as soon as the result shows, so a tap on share can open the sheet straight away:
  // browsers only allow the sheet right after the tap, not after a long wait on the drawing.
  const [image, setImage] = useState<File | null>(null)
  useEffect(() => {
    if (!shareable) return
    let cancelled = false
    const versus =
      verdict && challenge
        ? {
            label: t.challengeResult(verdict),
            you: `${t.challengeYou} ${correct}/${total} · ${time}`,
            friend: `${t.challengeFriend} ${challenge.correct}/${total} · ${formatDuration(challenge.elapsedMs)}`,
            won: verdict === 'win',
          }
        : null
    const draw = async () => {
      const { drawResultCard } = await import('../share/resultImage')
      const blob = await drawResultCard({
        round,
        headline: title,
        correct,
        total,
        time,
        medal,
        medalLabel:
          medal === 'gold'
            ? mastery > 0
              ? `${t.medalGoldShort} · ${t.mastery(mastery)}`
              : t.medalGoldShort
            : t.medalSilverShort,
        hits: session.correct,
        misses: session.wrong,
        bounds: isWorldwide(session.mode) ? null : CONTINENT_BOUNDS[session.mode],
        region: isWorldwide(session.mode) ? null : regionFeatures(session.mode),
        versus,
        call,
        host: location.host,
      })
      const name = daily ? `polo-daily-${dayNumber(daily.day)}` : `polo-${session.mode}-${correct}-${total}`
      if (!cancelled) setImage(new File([blob], `${name}.png`, { type: 'image/png' }))
    }
    draw().catch((error: unknown) => console.error(error))
    return () => {
      cancelled = true
    }
  }, [shareable, session, verdict, challenge, daily, t, round, title, correct, total, time, medal, mastery, call])

  const share = async () => {
    if (daily) {
      const content = dailyShare(t, locale, daily.day, daily.result, daily.streak)
      setShared(null)
      setShared(await shareResult(content.title, content.text, content.url, image))
      return
    }
    if (!seed) return
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
      time,
      medal,
      // The picture already shows the map; the squares are for text-only shares.
      grid: image ? '' : resultGrid(session.queue, session.correct, session.wrong),
      call,
    })
    setShared(null)
    setShared(await shareResult(`Polo · ${round}`, text, url, image))
  }

  return (
    <section className={`${ui.panel} ${styles.panel}`} data-perfect={perfect} aria-live="polite">
      <div className={styles.summary}>
        {perfect && (
          <div className={styles.medal}>
            <PlanetMedal
              tier={assisted ? 'silver' : 'gold'}
              size={64}
              count={mastery}
              label={assisted ? t.medalSilver : t.medalGold}
            />
          </div>
        )}
        <div>
          <p className={ui.eyebrow}>{review ? `${t.reviewTag} · ${copy.name}` : round}</p>
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

      {daily && daily.streak > 0 && (
        <p className={styles.badge}>
          <span aria-hidden="true">🔥</span>
          {t.dailyStreak(daily.streak)}
        </p>
      )}

      {(outcome?.isNewBest || outcome?.isFastestPerfect) && (
        <p className={styles.badge}>
          <Icon name="check" size={14} />
          {outcome.isFastestPerfect ? (assisted ? t.fastestAssisted : t.fastestPerfect) : t.newBest}
        </p>
      )}

      {mastery > 0 && (
        <p className={styles.badge}>
          <span className={styles.masteryLevel}>{t.mastery(mastery)}</span>
          {t.masteryRuns(mastery)}
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
          <button
            type="button"
            className={`${ui.ghost} ${styles.share}`}
            data-proud={proud}
            onClick={() => void share()}
          >
            <Icon name="share" size={16} />
            {daily ? t.dailyShare : verdict ? t.challengeAgain : t.share}
          </button>
        )}
        {!daily && (
          <button type="button" className={ui.primary} onClick={onPlayAgain}>
            <Icon name="play" />
            {t.playAgain}
          </button>
        )}
      </div>
      {shareable && (
        <div className={styles.shareRow}>
          <p className={styles.shareStatus} role="status">
            {shared === 'copied'
              ? t.shareCopied
              : shared === 'saved'
                ? t.shareSaved
                : shared === 'failed'
                  ? t.shareFailed
                  : ''}
          </p>
          {image && (
            <button type="button" className={styles.saveButton} onClick={() => setShared(saveImage(image))}>
              {t.shareSave}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
