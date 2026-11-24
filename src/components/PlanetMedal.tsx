import type { MedalTier } from '../game/records'
import styles from './PlanetMedal.module.css'

interface PlanetMedalProps {
  // null draws the locked outline.
  tier: MedalTier | null
  size?: number
  label?: string
  // The mastery level, shown as an amber pill on a gold medal. Left out where the medal is too small to carry it.
  count?: number
}

// Shares the 23.5° axial tilt and the pole dot with the logo, so the reward reads as part of the same system.
// Gold (perfect without help) is the full medal: a filled planet with a halo. Silver (perfect with the extra
// life) keeps the same drawing in outline only, so both read as one family and gold is clearly the prize.
export function PlanetMedal({ tier, size = 28, label, count }: PlanetMedalProps) {
  const stroke = size < 28 ? 3.6 : 2.5
  const className = tier === 'gold' ? styles.gold : tier === 'silver' ? styles.silver : styles.locked
  const planet = (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g transform="rotate(23.5 24 24)" strokeLinecap="round">
        {tier === 'gold' && <circle className={styles.halo} cx="24" cy="24" r="16" strokeWidth={stroke * 0.6} />}
        <ellipse className={styles.orbit} cx="24" cy="24" rx="21" ry="6.5" strokeWidth={stroke} />
        <circle className={styles.planet} cx="24" cy="24" r="11" strokeWidth={stroke} />
        <path className={styles.orbit} d="M3 24a21 6.5 0 0 0 42 0" strokeWidth={stroke} />
        <circle className={styles.pole} cx="24" cy="7" r="2.6" />
      </g>
    </svg>
  )
  if (tier !== 'gold' || !count) return planet
  return (
    <span className={styles.wrap}>
      {planet}
      <span className={styles.count} style={{ fontSize: Math.max(10, Math.round(size * 0.26)) }} aria-hidden="true">
        {count}
      </span>
    </span>
  )
}
