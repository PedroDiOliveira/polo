import { useEffect, useState } from 'react'
import { dailyClue, dayNumber, msUntilTomorrow, type DailyResult, type DayKey } from '../game/daily'
import { useI18n } from '../i18n/I18nContext'
import { dailyShare, formatCountdown } from '../share/dailyShare'
import { shareResult, type ShareResult } from '../share/share'
import ui from '../styles/primitives.module.css'
import styles from './DailyStrip.module.css'
import { Icon } from './Icon'

interface DailyStripProps {
  day: DayKey
  result: DailyResult | null
  streak: number
  onPlay: () => void
}

// The daily Polo at the top of the lobby: an invitation before it is played, the result and the wait after.
export function DailyStrip({ day, result, streak, onPlay }: DailyStripProps) {
  const { locale, t } = useI18n()
  const [shared, setShared] = useState<ShareResult | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const clue = result?.clue ?? dailyClue(day)

  // The countdown only needs the minute.
  useEffect(() => {
    if (!result) return
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [result])

  const share = async () => {
    if (!result) return
    const { title, text, url } = dailyShare(t, locale, day, result, streak)
    setShared(await shareResult(title, text, url, null))
  }

  return (
    <div className={styles.strip} data-done={Boolean(result)}>
      <div className={styles.text}>
        <p className={ui.eyebrow}>{t.dailyRound(dayNumber(day), t.clues[clue].name)}</p>
        {result ? (
          <p className={styles.line}>
            <span className={ui.mono}>{t.dailyDone(result.correct, result.total)}</span>
            {streak > 0 && <span className={styles.streak}>🔥 {t.dailyStreak(streak)}</span>}
          </p>
        ) : (
          <p className={styles.line}>{t.dailyNote(clue)}</p>
        )}
        {result && (
          <p className={styles.sub} role="status">
            {shared === 'copied'
              ? t.shareCopied
              : shared === 'failed'
                ? t.shareFailed
                : t.dailyNext(formatCountdown(msUntilTomorrow(new Date(now))))}
          </p>
        )}
      </div>
      {result ? (
        <button type="button" className={`${ui.ghost} ${styles.action}`} onClick={() => void share()}>
          <Icon name="share" size={16} />
          {t.dailyShare}
        </button>
      ) : (
        <button type="button" className={`${ui.primary} ${styles.action}`} onClick={onPlay}>
          <Icon name="play" />
          {t.play}
        </button>
      )}
    </div>
  )
}
