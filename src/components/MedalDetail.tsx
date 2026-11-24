import { useEffect, useMemo, useState } from 'react'
import type { Clue, ModeId } from '../game/modes'
import type { ModeRecord } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import { saveImage, shareResult, type ShareResult } from '../share/share'
import { medalShare } from '../share/medalShare'
import ui from '../styles/primitives.module.css'
import { Icon } from './Icon'
import { PlanetMedal } from './PlanetMedal'
import styles from './MedalDetail.module.css'

interface MedalDetailProps {
  clue: Clue
  mode: ModeId
  record: ModeRecord | undefined
  onBack: () => void
}

// One medal, up close: what it means, its mastery, and a picture of it to post.
export function MedalDetail({ clue, mode, record, onBack }: MedalDetailProps) {
  const { locale, t } = useI18n()
  const content = useMemo(
    () => medalShare(t, locale, clue, mode, record, location.origin, location.host),
    [t, locale, clue, mode, record],
  )
  const [image, setImage] = useState<File | null>(null)
  const [shared, setShared] = useState<ShareResult | null>(null)

  // Drawn as soon as the medal opens, so the share sheet gets the picture without waiting on the tap.
  useEffect(() => {
    if (!content) return
    let cancelled = false
    import('../share/medalImage')
      .then(({ drawMedalCard }) => drawMedalCard(content.card))
      .then((blob) => {
        if (!cancelled) setImage(new File([blob], `polo-medal-${clue}-${mode}.png`, { type: 'image/png' }))
      })
      .catch((error: unknown) => console.error(error))
    return () => {
      cancelled = true
    }
  }, [content, clue, mode])

  if (!content) return null
  const { card } = content
  const gold = card.tier === 'gold'

  const share = async () => {
    setShared(null)
    setShared(await shareResult(content.title, content.text, content.url, image))
  }

  return (
    <div className={styles.detail}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="back" size={16} />
        {t.back}
      </button>

      <div className={styles.hero} data-tier={card.tier}>
        <PlanetMedal tier={card.tier} size={104} count={card.mastery} label={gold ? t.medalGold : t.medalSilver} />
      </div>

      <div className={styles.text}>
        <p className={ui.eyebrow} data-tier={card.tier}>
          {card.tierLabel}
        </p>
        <h3 className={styles.round}>{card.round}</h3>
        <p className={styles.meaning}>{card.meaning}</p>
      </div>

      <dl className={styles.facts}>
        {gold && (
          <div>
            <dt className={ui.eyebrow}>{t.mastery(card.mastery)}</dt>
            <dd>{t.masteryRuns(card.mastery)}</dd>
          </div>
        )}
        <div>
          <dt className={ui.eyebrow}>{t.bestTime}</dt>
          <dd className={ui.mono}>{card.time}</dd>
        </div>
      </dl>

      <button type="button" className={ui.primary} onClick={() => void share()}>
        <Icon name="share" />
        {t.medalShare}
      </button>
      <div className={styles.shareRow}>
        <p className={styles.status} role="status">
          {shared === 'copied'
            ? t.shareCopied
            : shared === 'saved'
              ? t.shareSaved
              : shared === 'failed'
                ? t.shareFailed
                : ''}
        </p>
        {image && (
          <button type="button" className={styles.save} onClick={() => setShared(saveImage(image))}>
            {t.shareSave}
          </button>
        )}
      </div>
    </div>
  )
}
