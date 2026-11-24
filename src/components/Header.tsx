import { APP } from '../config/app'
import type { MedalTier } from '../game/records'
import { useI18n } from '../i18n/I18nContext'
import ui from '../styles/primitives.module.css'
import { PlanetMedal } from './PlanetMedal'
import styles from './Header.module.css'

interface HeaderProps {
  medals: Record<MedalTier, number>
  onOpenRecords: () => void
}

export function Header({ medals, onOpenRecords }: HeaderProps) {
  const { locale, t, toggleLocale } = useI18n()
  const perfectCount = medals.gold + medals.silver
  const tier: MedalTier | null = medals.gold > 0 ? 'gold' : medals.silver > 0 ? 'silver' : null

  return (
    <header className={styles.header}>
      <h1 className={styles.brand}>
        <img src="/brand/polo-wordmark.svg" alt={APP.name} width={76} height={38} />
      </h1>
      <nav className={`${ui.panel} ${styles.actions}`} aria-label={APP.name}>
        <button type="button" className={styles.action} onClick={onOpenRecords}>
          <PlanetMedal tier={tier} size={22} />
          <span>{t.records}</span>
          {perfectCount > 0 && <span className={`${ui.mono} ${styles.count}`}>{perfectCount}</span>}
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <button type="button" className={styles.action} onClick={toggleLocale} aria-label={t.switchLanguage}>
          <span className={ui.mono}>{locale === 'pt' ? 'PT' : 'EN'}</span>
        </button>
      </nav>
    </header>
  )
}
