import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import styles from './InviteCard.module.css'

interface InviteCardProps {
  eyebrow: string
  title: string
  body: string
  accept: string
  dismiss: string
  onAccept: () => void
  onDismiss: () => void
}

// What someone sees when they open a shared link (a friend's challenge, or the daily Polo):
// straight into the same round, with no lobby to learn first.
export function InviteCard({ eyebrow, title, body, accept, dismiss, onAccept, onDismiss }: InviteCardProps) {
  return (
    <section className={`${ui.panel} ${styles.panel}`} aria-labelledby="invite-title">
      <div>
        <p className={ui.eyebrow}>{eyebrow}</p>
        <h2 id="invite-title" className={styles.title}>
          {title}
        </h2>
      </div>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <button type="button" className={ui.ghost} onClick={onDismiss}>
          {dismiss}
        </button>
        <button type="button" className={ui.primary} onClick={onAccept}>
          <Icon name="play" />
          {accept}
        </button>
      </div>
    </section>
  )
}
