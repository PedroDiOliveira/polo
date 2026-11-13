const ICONS = {
  play: { d: 'M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z', filled: true },
  plus: { d: 'M12 5v14M5 12h14', filled: false },
  minus: { d: 'M5 12h14', filled: false },
  close: { d: 'M6 6l12 12M18 6 6 18', filled: false },
  check: { d: 'm5 12.5 4.5 4.5L19 7.5', filled: false },
  globe: {
    d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18',
    filled: false,
  },
  flat: { d: 'm4 6.5 5-2 6 2 5-2v13l-5 2-6-2-5 2zM9 4.5v13M15 6.5v13', filled: false },
  back: { d: 'M19 12H5M11 6l-6 6 6 6', filled: false },
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const { d, filled } = ICONS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
