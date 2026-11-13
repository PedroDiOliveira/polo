import styles from './PlanetMedal.module.css'

interface PlanetMedalProps {
  earned: boolean
  size?: number
  label?: string
}

// Shares the 23.5° axial tilt and the pole dot with the logo, so the reward reads as part of the same system.
export function PlanetMedal({ earned, size = 28, label }: PlanetMedalProps) {
  const stroke = size < 28 ? 3.6 : 2.5
  return (
    <svg
      className={earned ? styles.earned : styles.locked}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g transform="rotate(23.5 24 24)" strokeLinecap="round">
        <ellipse className={styles.orbit} cx="24" cy="24" rx="21" ry="6.5" strokeWidth={stroke} />
        <circle className={styles.planet} cx="24" cy="24" r="11" strokeWidth={stroke} />
        <path className={styles.orbit} d="M3 24a21 6.5 0 0 0 42 0" strokeWidth={stroke} />
        <circle className={styles.pole} cx="24" cy="7" r="2.6" />
      </g>
    </svg>
  )
}
