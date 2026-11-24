import { useEffect, useRef, useState } from 'react'
import { MODE_IDS, MODE_TOTALS, type Clue, type ModeId } from '../game/modes'
import { masteryOf, medalFor, type Records } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { modeName, roundName } from '../i18n/messages'
import { formatDuration } from '../lib/time'
import ui from '../styles/primitives.module.css'
import { CluePicker } from './CluePicker'
import { Icon } from './Icon'
import { MedalDetail } from './MedalDetail'
import { PlanetMedal } from './PlanetMedal'
import styles from './RecordsDialog.module.css'

interface RecordsDialogProps {
  open: boolean
  records: Records
  clue: Clue
  onClueChange: (clue: Clue) => void
  onClose: () => void
}

// Shares the lobby's choice of game, so what the dialog shows always matches the panel behind it.
export function RecordsDialog({ open, records, clue, onClueChange, onClose }: RecordsDialogProps) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // The medal opened up close, if any; the list comes back on close or with the back button.
  const [selected, setSelected] = useState<ModeId | null>(null)

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
      onClose={() => {
        setSelected(null)
        onClose()
      }}
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

        {selected ? (
          <MedalDetail
            clue={clue}
            mode={selected}
            record={records[clue]?.[selected]}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <CluePicker value={clue} onChange={onClueChange} className={styles.picker} />

            <ul className={styles.list}>
              {MODE_IDS.map((mode) => {
                const record = records[clue]?.[mode]
                const total = MODE_TOTALS[mode]
                const tier = medalFor(record)
                return (
                  <li key={mode} className={styles.row}>
                    <PlanetMedal
                      tier={tier}
                      size={34}
                      count={masteryOf(record)}
                      label={tier === 'gold' ? t.medalGold : tier === 'silver' ? t.medalSilver : undefined}
                    />
                    <div className={styles.info}>
                      <p className={styles.mode}>{modeName(t, mode)}</p>
                      <p className={styles.detail}>
                        {record?.perfectMs !== undefined
                          ? t.perfectIn(formatDuration(record.perfectMs))
                          : record?.assistedMs !== undefined
                            ? t.assistedIn(formatDuration(record.assistedMs))
                            : record
                              ? t.clues[clue].count(total)
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
                    {tier ? (
                      <button
                        type="button"
                        className={`${ui.iconButton} ${styles.open}`}
                        onClick={() => setSelected(mode)}
                        aria-label={t.medalOpen(roundName(t, clue, mode))}
                        title={t.medalShare}
                      >
                        <Icon name="share" size={18} />
                      </button>
                    ) : (
                      <span className={styles.openSpacer} aria-hidden="true" />
                    )}
                  </li>
                )
              })}
            </ul>

            <p className={styles.note}>{t.recordsNote}</p>
          </>
        )}
      </div>
    </dialog>
  )
}
