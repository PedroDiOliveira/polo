// The grid is the part people recognise at a glance in a chat; past this size it stops being readable.
const GRID_LIMIT = 60
const GRID_ROW = 10

// One square per question in the order it was asked: hit, miss, or not reached before the game ended.
export function resultGrid(queue: readonly string[], correct: readonly string[], wrong: readonly string[]): string {
  if (queue.length > GRID_LIMIT) return ''
  const hits = new Set(correct)
  const misses = new Set(wrong)
  const squares = queue.map((code) => (hits.has(code) ? '🟩' : misses.has(code) ? '🟥' : '⬜'))
  const rows: string[] = []
  for (let i = 0; i < squares.length; i += GRID_ROW) rows.push(squares.slice(i, i + GRID_ROW).join(''))
  return rows.join('\n')
}

export interface ShareSummary {
  round: string
  correct: number
  total: number
  time: string
  medal: 'gold' | 'silver' | null
  grid: string
  // The closing line: a dare, or how the player did against the challenge they answered.
  call: string
}

export function shareText({ round, correct, total, time, medal, grid, call }: ShareSummary): string {
  const medalMark = medal === 'gold' ? ' 🥇' : medal === 'silver' ? ' 🥈' : ''
  return [`Polo 🌍 ${round}`, `${correct}/${total} · ⏱ ${time}${medalMark}`, grid, call].filter(Boolean).join('\n')
}
