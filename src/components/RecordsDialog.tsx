import { useEffect, useRef } from 'react'
import { MODE_IDS, MODE_TOTALS } from '../game/modes'
import type { Records } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { modeName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './RecordsDialog.module.css'

interface RecordsDialogProps {
  open: boolean
  records: Records
  onClose: () => void
}

export function RecordsDialog({ open, records, onClose }: RecordsDialogProps) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`${ui.panel} ${styles.dialog}`}
      aria-labelledby="records-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="records-title" className={styles.title}>
            {t.records}
          </h2>
          <button type="button" className={ui.iconButton} onClick={onClose} aria-label={t.close}>
            <Icon name="close" />
          </button>
        </header>

        <ul className={styles.list}>
          {MODE_IDS.map((mode) => {
            const record = records[mode]
            const total = MODE_TOTALS[mode]
            const perfect = record?.perfectMs !== undefined
            return (
              <li key={mode} className={styles.row}>
                <PlanetMedal earned={perfect} size={34} label={perfect ? t.perfectBadge : undefined} />
                <div className={styles.info}>
                  <p className={styles.mode}>{modeName(t, mode)}</p>
                  <p className={styles.detail}>
                    {record?.perfectMs !== undefined
                      ? t.perfectIn(formatDuration(record.perfectMs))
                      : record
                        ? t.capitals(total)
                        : t.noRecord}
                  </p>
                  <div className={styles.bar} aria-hidden="true">
                    <span style={{ scale: `${(record?.best ?? 0) / total} 1` }} />
                  </div>
                </div>
                <p className={`${ui.mono} ${styles.score}`}>
                  {record?.best ?? 0}
                  <span className={styles.total}>/{total}</span>
                </p>
              </li>
            )
          })}
        </ul>

        <p className={styles.note}>{t.recordsNote}</p>
      </div>
    </dialog>
  )
}
