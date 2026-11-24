import { MODE_TOTALS } from '../game/modes'
import { useI18n } from '../i18n/I18nContext'
import { roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import type { Challenge } from '../share/challenge'
import ui from '../styles/primitives.module.css'
import styles from './ChallengeCard.module.css'
import { Icon } from './Icon'

interface ChallengeCardProps {
  challenge: Challenge
  onAccept: () => void
  onDismiss: () => void
}

// What someone sees when they open a friend's challenge link: straight into the same round, no lobby to learn first.
export function ChallengeCard({ challenge, onAccept, onDismiss }: ChallengeCardProps) {
  const { t } = useI18n()
  const round = roundName(t, challenge.clue, challenge.mode)
  return (
    <section className={`${ui.panel} ${styles.panel}`} aria-labelledby="challenge-title">
      <div>
        <p className={ui.eyebrow}>{round}</p>
        <h2 id="challenge-title" className={styles.title}>
          {t.challengeTitle}
        </h2>
      </div>
      <p className={styles.body}>
        {t.challengeBody(round, challenge.correct, MODE_TOTALS[challenge.mode], formatDuration(challenge.elapsedMs))}
      </p>
      <div className={styles.actions}>
        <button type="button" className={ui.ghost} onClick={onDismiss}>
          {t.challengeDismiss}
        </button>
        <button type="button" className={ui.primary} onClick={onAccept}>
          <Icon name="play" />
          {t.challengeAccept}
        </button>
      </div>
    </section>
  )
}
