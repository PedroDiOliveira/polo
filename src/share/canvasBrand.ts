// The brand, redrawn on a 2D canvas for the share images: colours, faces, the wordmark and the medal.

export const INK = {
  background: '#06201A',
  text: '#F3F7F2',
  dim: '#A9C0B4',
  aurora: '#A8F26A',
  amber: '#FFC53D',
  sage: '#D5E3D6',
  line: 'rgba(243, 247, 242, 0.12)',
}
export const SANS = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
export const MONO = "'Geist Mono Variable', ui-monospace, Menlo, monospace"

export function loadBrandFonts(): Promise<unknown> {
  return Promise.all([document.fonts.load(`600 40px ${SANS}`), document.fonts.load(`600 40px ${MONO}`)])
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}

// public/brand/polo-wordmark.svg, redrawn: four strokes and a tilted globe with its pole dot.
export function drawWordmark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.strokeStyle = INK.text
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(8, 14)
  ctx.lineTo(8, 46)
  ctx.moveTo(28, 24)
  ctx.arc(18, 24, 10, 0, Math.PI * 2)
  ctx.moveTo(56, 24)
  ctx.arc(46, 24, 10, 0, Math.PI * 2)
  ctx.moveTo(64, 5)
  ctx.lineTo(64, 34)
  ctx.stroke()
  ctx.translate(84, 24)
  ctx.rotate((23.5 * Math.PI) / 180)
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, -16.6, 2.6, 0, Math.PI * 2)
  ctx.fillStyle = INK.aurora
  ctx.fill()
  ctx.restore()
}

// PlanetMedal.tsx, redrawn at the given centre and size.
export function drawMedal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  tier: 'gold' | 'silver',
): void {
  const gold = tier === 'gold'
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(size / 48, size / 48)
  ctx.rotate((23.5 * Math.PI) / 180)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  if (gold) {
    ctx.globalAlpha = 0.55
    ctx.strokeStyle = INK.amber
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, 16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.lineWidth = 2.5
  }
  ctx.strokeStyle = gold ? INK.text : INK.dim
  ctx.beginPath()
  ctx.ellipse(0, 0, 21, 6.5, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 11, 0, Math.PI * 2)
  ctx.fillStyle = gold ? INK.aurora : 'rgba(213, 227, 214, 0.14)'
  ctx.fill()
  ctx.strokeStyle = gold ? INK.aurora : INK.sage
  ctx.stroke()
  // The front half of the orbit passes over the planet.
  ctx.strokeStyle = gold ? INK.text : INK.dim
  ctx.beginPath()
  ctx.ellipse(0, 0, 21, 6.5, 0, 0, Math.PI)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, -17, 2.6, 0, Math.PI * 2)
  ctx.fillStyle = gold ? INK.amber : INK.sage
  ctx.fill()
  ctx.restore()
}
