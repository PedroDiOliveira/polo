// Mirrors the tokens in src/styles/tokens.css; MapLibre paints on a canvas and cannot read CSS variables.
export const MAP_COLORS = {
  ocean: '#0A2E25',
  graticule: '#F3F7F2',
  land: '#D5E3D6',
  border: '#0A2E25',
  hover: '#06201A',
  correct: '#1FAF6B',
  wrong: '#B8321F',
  wrongHatch: '#FFD9D0',
  signal: '#FFC53D',
  flash: '#FFFFFF',
  mastery: ['#E8C9A0', '#95D6B4', '#58C48F', '#1FAF6B'],
} as const

export const MAP_VIEW = {
  center: [-20, 18] as [number, number],
  zoom: 1.7,
  minZoom: 0.9,
  maxZoom: 8,
} as const
