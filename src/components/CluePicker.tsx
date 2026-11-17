import { CLUES, type Clue } from '../game/modes'
import { useI18n } from '../i18n/I18nContext'
import { Icon, type IconName } from './Icon'
import styles from './CluePicker.module.css'

interface CluePickerProps {
  value: Clue
  onChange: (clue: Clue) => void
  className?: string
}

const ICONS: Record<Clue, IconName> = { capital: 'capital', country: 'pin' }

// The top-level choice of game. It is drawn as tabs, unlike the pill below it, so the two levels never read as one.
export function CluePicker({ value, onChange, className }: CluePickerProps) {
  const { t } = useI18n()

  return (
    <div className={className ? `${styles.picker} ${className}` : styles.picker} role="radiogroup" aria-label={t.clueLabel}>
      {CLUES.map((clue) => (
        <button
          key={clue}
          type="button"
          role="radio"
          aria-checked={value === clue}
          className={styles.tab}
          onClick={() => onChange(clue)}
        >
          <Icon name={ICONS[clue]} size={18} />
          {t.clues[clue].name}
        </button>
      ))}
    </div>
  )
}
