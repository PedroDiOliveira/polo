// The grid is the part people recognise at a glance in a chat; past this size it stops being readable.
const GRID_LIMIT = 60
const GRID_ROW = 10
const SQUARES = { H: '🟩', M: '🟥', U: '⬜' } as const

// One square per question in the order it was asked: hit, miss, or not reached before the game ended.
export function resultGrid(queue: readonly string[], correct: readonly string[], wrong: readonly string[]): string {
  const hits = new Set(correct)
  const misses = new Set(wrong)
  return marksGrid(queue.map((code) => (hits.has(code) ? 'H' : misses.has(code) ? 'M' : 'U')).join(''))
}

// The same grid from saved marks ("HHMU…"), for a daily shared again from the lobby.
export function marksGrid(marks: string): string {
  if (marks.length > GRID_LIMIT) return ''
  const squares = [...marks].map((mark) => SQUARES[mark as keyof typeof SQUARES] ?? SQUARES.U)
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
  // Days in a row of the daily Polo; shown from two on, when it starts to mean something.
  streak?: number
  // The closing line: a dare, or how the player did against the challenge they answered.
  call: string
}

export function shareText({ round, correct, total, time, medal, grid, streak, call }: ShareSummary): string {
  const medalMark = medal === 'gold' ? ' 🥇' : medal === 'silver' ? ' 🥈' : ''
  const streakMark = streak && streak > 1 ? ` · 🔥 ${streak}` : ''
  return [`Polo 🌍 ${round}`, `${correct}/${total} · ⏱ ${time}${medalMark}${streakMark}`, grid, call]
    .filter(Boolean)
    .join('\n')
}
