import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import type { Bounds } from '../data/types'
import { COUNTRIES, WORLD_GEOJSON_URL } from '../data/world'
import { MAP_COLORS } from '../map/theme'
import { canvasToPng, drawMedal, drawWordmark, INK, loadBrandFonts, MONO, SANS } from './canvasBrand'

// The result card: drawn on a plain 2D canvas from the same geometry the map uses, so it is always framed on
// the round's region, whatever the camera was doing, and needs neither a server nor a WebGL capture.

export interface ResultCard {
  round: string
  headline: string
  correct: number
  total: number
  time: string
  medal: 'gold' | 'silver' | null
  medalLabel: string
  // Countries (owner codes) painted green and red.
  hits: readonly string[]
  misses: readonly string[]
  // The region to frame; null shows the whole world.
  bounds: Bounds | null
  // The features of a regional round; the rest of the world is drawn switched off, as on the map.
  region: readonly string[] | null
  // "You 41/54 · 03:12   Friend 40/54 · 03:30", when the round answered a challenge.
  versus: { label: string; you: string; friend: string; won: boolean } | null
  call: string
  host: string
}

const WIDTH = 1080
const MARGIN = 64
// Everything below the map: headline, score, the challenge line and the footer.
const SUMMARY_HEIGHT = 474
const MAP_TOP = 176
const MAP_WIDTH = WIDTH - 2 * MARGIN
// A region gets a 4:5 portrait card (Instagram's tallest feed format); the world is wide, so its card is shorter
// rather than padded with empty ocean.
const REGION_MAP_HEIGHT = 700
const WORLD_MAP_HEIGHT = 440
const WORLD_VIEW: Bounds = [-170, -56, 180, 80]
// Antarctica has no capital to ask about and would fill a third of the world card.
const LEFT_OUT = new Set(['ATA'])
const FRAME_PADDING = 0.06

interface Box {
  x: number
  y: number
  w: number
  h: number
}

type Shape = Polygon | MultiPolygon
type World = FeatureCollection<Shape, { code: string; owner: string | null }>

let world: Promise<World> | null = null

// The map already downloaded this file, so the browser usually answers from its cache.
function loadWorld(): Promise<World> {
  world ??= fetch(WORLD_GEOJSON_URL).then((response) => {
    if (!response.ok) throw new Error(`world.geojson: ${response.status}`)
    return response.json() as Promise<World>
  })
  world.catch(() => (world = null))
  return world
}

export async function drawResultCard(card: ResultCard): Promise<Blob> {
  const [geometry] = await Promise.all([loadWorld(), loadBrandFonts()])
  const box: Box = { x: MARGIN, y: MAP_TOP, w: MAP_WIDTH, h: card.bounds ? REGION_MAP_HEIGHT : WORLD_MAP_HEIGHT }
  const height = box.y + box.h + SUMMARY_HEIGHT
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')

  ctx.fillStyle = INK.background
  ctx.fillRect(0, 0, WIDTH, height)

  drawWordmark(ctx, MARGIN, 64, 1.1)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'right'
  ctx.fillStyle = INK.dim
  ctx.font = `500 30px ${SANS}`
  ctx.fillText(card.round, WIDTH - MARGIN, 112, WIDTH - 2 * MARGIN - 160)

  drawMap(ctx, geometry, card, box)
  drawSummary(ctx, card, box.y + box.h, height)

  return canvasToPng(canvas)
}

function drawMap(ctx: CanvasRenderingContext2D, geometry: World, card: ResultCard, box: Box): void {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(box.x, box.y, box.w, box.h, 32)
  ctx.clip()
  ctx.fillStyle = MAP_COLORS.ocean
  ctx.fillRect(box.x, box.y, box.w, box.h)

  const { project, scale } = projection(card.bounds ?? WORLD_VIEW, box)
  // Dots shrink with the zoom, or the zoomed-out world card is all dots around Europe and the Caribbean.
  const dotRadius = Math.min(7, Math.max(3.5, scale * 0.8))
  const hits = new Set(card.hits)
  const misses = new Set(card.misses)
  const region = card.region && new Set(card.region)
  const hatch = hatchPattern(ctx)
  const colorOf = (code: string, owner: string | null) =>
    region && !region.has(code)
      ? MAP_COLORS.outside
      : owner && hits.has(owner)
        ? MAP_COLORS.correct
        : owner && misses.has(owner)
          ? MAP_COLORS.wrong
          : MAP_COLORS.land

  ctx.lineJoin = 'round'
  for (const feature of geometry.features) {
    if (LEFT_OUT.has(feature.properties.code)) continue
    const owner = feature.properties.owner
    const path = shapePath(feature.geometry, project)
    ctx.fillStyle = colorOf(feature.properties.code, owner)
    ctx.fill(path, 'evenodd')
    // Misses keep their hatch here too: colour is never the only signal (see docs/BRAND.md).
    if (owner && misses.has(owner) && hatch) {
      ctx.fillStyle = hatch
      ctx.fill(path, 'evenodd')
    }
    ctx.strokeStyle = MAP_COLORS.border
    ctx.lineWidth = 1.2
    ctx.stroke(path)
  }

  // Microstates are too small to see as shapes, so the map shows them as dots; so does the card.
  for (const country of COUNTRIES) {
    if (!country.tiny) continue
    const [x, y] = project(country.anchor)
    if (x < box.x || x > box.x + box.w || y < box.y || y > box.y + box.h) continue
    ctx.beginPath()
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
    ctx.fillStyle = colorOf(country.code, country.code)
    ctx.fill()
    ctx.strokeStyle = MAP_COLORS.border
    ctx.lineWidth = dotRadius > 5 ? 2 : 1.2
    ctx.stroke()
  }
  ctx.restore()
}

function drawSummary(ctx: CanvasRenderingContext2D, card: ResultCard, top: number, height: number): void {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = INK.text
  ctx.font = `600 52px ${SANS}`
  ctx.fillText(card.headline, MARGIN, top + 96, WIDTH - 2 * MARGIN)

  // The score, big, in the numeric face.
  ctx.font = `600 150px ${MONO}`
  const score = String(card.correct)
  ctx.fillText(score, MARGIN, top + 262)
  const scoreWidth = ctx.measureText(score).width
  ctx.fillStyle = INK.dim
  ctx.font = `400 70px ${MONO}`
  ctx.fillText(`/${card.total}`, MARGIN + scoreWidth + 6, top + 262)

  // The time and medal, right-aligned beside the score.
  const right = WIDTH - MARGIN
  ctx.textAlign = 'right'
  ctx.fillStyle = INK.text
  ctx.font = `500 60px ${MONO}`
  ctx.fillText(card.time, right, top + 200)
  if (card.medal) {
    ctx.font = `500 26px ${SANS}`
    ctx.fillStyle = card.medal === 'gold' ? INK.aurora : INK.sage
    const labelWidth = ctx.measureText(card.medalLabel).width
    ctx.fillText(card.medalLabel, right, top + 256, 420)
    drawMedal(ctx, right - Math.min(labelWidth, 420) - 52, top + 246, 44, card.medal)
  }

  const footer = height - MARGIN
  if (card.versus) {
    ctx.textAlign = 'left'
    ctx.font = `500 30px ${SANS}`
    ctx.fillStyle = card.versus.won ? INK.aurora : INK.text
    ctx.fillText(card.versus.label, MARGIN, footer - 76, 400)
    ctx.textAlign = 'right'
    ctx.font = `500 28px ${MONO}`
    ctx.fillStyle = INK.dim
    ctx.fillText(`${card.versus.you}   ${card.versus.friend}`, right, footer - 76, 540)
  }

  ctx.strokeStyle = INK.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(MARGIN, footer - 48)
  ctx.lineTo(right, footer - 48)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = `500 30px ${SANS}`
  ctx.fillStyle = INK.text
  ctx.fillText(card.call, MARGIN, footer, 640)
  ctx.textAlign = 'right'
  ctx.font = `600 30px ${MONO}`
  ctx.fillStyle = INK.aurora
  ctx.fillText(card.host, right, footer, 340)
}

// Equirectangular, scaled by the cosine of the middle latitude so a region keeps its familiar shape,
// and fitted to cover the box: whatever lies outside the region still shows around it.
function projection(bounds: Bounds, box: Box): { project: (point: Position) => [number, number]; scale: number } {
  const [west, south, east, north] = bounds
  const shrink = Math.cos((((south + north) / 2) * Math.PI) / 180)
  const spanX = (east - west) * shrink
  const spanY = north - south
  const scale = Math.min(box.w / spanX, box.h / spanY) * (1 - 2 * FRAME_PADDING)
  const [cx, cy] = [(west + east) / 2, (south + north) / 2]
  const [ox, oy] = [box.x + box.w / 2, box.y + box.h / 2]
  return { project: ([lng, lat]) => [ox + (lng - cx) * shrink * scale, oy - (lat - cy) * scale], scale }
}

function shapePath(shape: Shape, project: (point: Position) => [number, number]): Path2D {
  const path = new Path2D()
  const polygons = shape.type === 'Polygon' ? [shape.coordinates] : shape.coordinates
  for (const rings of polygons) {
    for (const ring of rings) {
      ring.forEach((point, i) => {
        const [x, y] = project(point)
        if (i === 0) path.moveTo(x, y)
        else path.lineTo(x, y)
      })
      path.closePath()
    }
  }
  return path
}

function hatchPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas')
  tile.width = tile.height = 12
  const t = tile.getContext('2d')
  if (!t) return null
  t.strokeStyle = MAP_COLORS.wrongHatch
  t.globalAlpha = 0.55
  t.lineWidth = 2
  t.beginPath()
  for (const offset of [-12, 0, 12]) {
    t.moveTo(offset, 12)
    t.lineTo(offset + 12, 0)
  }
  t.stroke()
  return ctx.createPattern(tile, 'repeat')
}
