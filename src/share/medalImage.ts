import type { MedalTier } from '../game/records'
import { canvasToPng, drawMedal, drawWordmark, INK, loadBrandFonts, MONO, SANS } from './canvasBrand'

// A medal on its own, as a square picture that explains itself: which round, what the medal means, how many
// times it was earned. Square suits every feed and chat; it needs no map, so it draws instantly.

export interface MedalCard {
  tier: MedalTier
  tierLabel: string
  round: string
  meaning: string
  // Gold only: the mastery level, shown on the medal and spelled out below it. 0 hides both.
  mastery: number
  masteryLabel: string
  time: string
  timeLabel: string
  call: string
  host: string
}

const SIZE = 1080
const MARGIN = 64
const CENTRE = SIZE / 2
const MEDAL_Y = 360
const MEDAL_SIZE = 360

export async function drawMedalCard(card: MedalCard): Promise<Blob> {
  await loadBrandFonts()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  const gold = card.tier === 'gold'

  ctx.fillStyle = INK.background
  ctx.fillRect(0, 0, SIZE, SIZE)

  // A soft glow behind the medal: aurora for gold, a faint sage for silver.
  const glow = ctx.createRadialGradient(CENTRE, MEDAL_Y, 0, CENTRE, MEDAL_Y, 330)
  glow.addColorStop(0, gold ? 'rgba(168, 242, 106, 0.2)' : 'rgba(213, 227, 214, 0.1)')
  glow.addColorStop(1, 'rgba(6, 32, 26, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SIZE, SIZE)

  drawWordmark(ctx, MARGIN, 56, 1.1)
  drawMedal(ctx, CENTRE, MEDAL_Y, MEDAL_SIZE, card.tier)
  if (gold && card.mastery > 0) drawMasteryBadge(ctx, CENTRE + 118, MEDAL_Y + 112, card.mastery)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = gold ? INK.aurora : INK.sage
  ctx.font = `600 28px ${SANS}`
  ctx.letterSpacing = '4px'
  ctx.fillText(card.tierLabel.toUpperCase(), CENTRE, 610)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = INK.text
  ctx.font = `600 64px ${SANS}`
  ctx.fillText(card.round, CENTRE, 690, SIZE - 2 * MARGIN)

  ctx.fillStyle = INK.dim
  ctx.font = `400 32px ${SANS}`
  const lines = wrap(ctx, card.meaning, SIZE - 3 * MARGIN)
  lines.forEach((line, i) => ctx.fillText(line, CENTRE, 752 + i * 44))

  const stats = [gold && card.mastery > 0 ? card.masteryLabel : '', card.time ? `${card.timeLabel} ${card.time}` : '']
    .filter(Boolean)
    .join(' · ')
  ctx.fillStyle = INK.text
  ctx.font = `500 32px ${MONO}`
  ctx.fillText(stats, CENTRE, 752 + lines.length * 44 + 52, SIZE - 2 * MARGIN)

  const footer = SIZE - MARGIN
  ctx.strokeStyle = INK.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, footer - 52)
  ctx.lineTo(SIZE - MARGIN, footer - 52)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = INK.text
  ctx.font = `500 32px ${SANS}`
  ctx.fillText(card.call, MARGIN, footer, 620)
  ctx.textAlign = 'right'
  ctx.fillStyle = INK.aurora
  ctx.font = `600 30px ${MONO}`
  ctx.fillText(card.host, SIZE - MARGIN, footer, 360)

  return canvasToPng(canvas)
}

// The same amber pill as PlanetMedal's count, scaled up.
function drawMasteryBadge(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  const text = String(level)
  ctx.font = `700 64px ${MONO}`
  const width = Math.max(96, ctx.measureText(text).width + 52)
  ctx.beginPath()
  ctx.roundRect(x - width / 2, y - 48, width, 96, 48)
  ctx.fillStyle = INK.amber
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = INK.background
  ctx.stroke()
  ctx.fillStyle = INK.background
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y + 3)
  ctx.textBaseline = 'alphabetic'
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > width) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}
