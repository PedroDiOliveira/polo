import { describe, expect, it } from 'vitest'
import { resultGrid, shareText } from './shareText'

describe('share text', () => {
  it('draws one square per question, in the order asked, ten per row', () => {
    const queue = Array.from({ length: 12 }, (_, i) => `C${i}`)
    const grid = resultGrid(queue, ['C0', 'C2'], ['C1'])
    expect(grid.split('\n')).toHaveLength(2)
    expect([...grid.split('\n')[0]].slice(0, 3).join('')).toBe('🟩🟥🟩')
    expect(grid).toContain('⬜')
  })

  it('leaves the grid out of very long games', () => {
    expect(resultGrid(Array.from({ length: 197 }, (_, i) => `C${i}`), [], [])).toBe('')
  })

  it('puts the round, the score and the dare together', () => {
    const text = shareText({
      round: 'Capitals · Africa',
      correct: 54,
      total: 54,
      time: '03:12',
      medal: 'gold',
      grid: '',
      call: 'Can you beat me?',
    })
    expect(text).toBe('Polo 🌍 Capitals · Africa\n54/54 · ⏱ 03:12 🥇\nCan you beat me?')
  })
})
