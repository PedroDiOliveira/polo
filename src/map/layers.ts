import type { Feature, FeatureCollection, LineString, Point } from 'geojson'
import type {
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import type { Country } from '../data/types'
import { WORLD_GEOJSON_URL } from '../data/world'
import { MAP_COLORS } from './theme'

export const LAYER = {
  land: 'land',
  hatch: 'land-hatch',
  hover: 'land-hover',
  signal: 'land-signal',
  borders: 'borders',
  dots: 'dots',
  dotsHover: 'dots-hover',
  dotsSignal: 'dots-signal',
} as const

export const HATCH_IMAGE = 'hatch'
export const NO_MATCH: FilterSpecification = ['==', ['get', 'code'], '']

const DOT_RADIUS: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 1, 3, 4, 5.5, 7, 8]

export function ownerFilter(owner: string): FilterSpecification {
  return ['==', ['get', 'owner'], owner]
}

export function codeFilter(code: string): FilterSpecification {
  return ['==', ['get', 'code'], code]
}

export function ownersFilter(owners: readonly string[]): FilterSpecification {
  return owners.length > 0 ? ['in', ['get', 'owner'], ['literal', [...owners]]] : NO_MATCH
}

export interface MapFill {
  color: string
  codes: readonly string[]
}

export function fillColor(fills: readonly MapFill[]): ExpressionSpecification | string {
  const branches = fills.filter((fill) => fill.codes.length > 0).flatMap((fill) => [[...fill.codes], fill.color])
  if (branches.length === 0) return MAP_COLORS.land
  return ['match', ['get', 'owner'], ...branches, MAP_COLORS.land] as unknown as ExpressionSpecification
}

function graticule(): FeatureCollection<LineString> {
  const features: Feature<LineString>[] = []
  const line = (coordinates: [number, number][], major: boolean) =>
    features.push({ type: 'Feature', properties: { major }, geometry: { type: 'LineString', coordinates } })

  for (let lng = -180; lng < 180; lng += 30) {
    const coordinates: [number, number][] = []
    for (let lat = -85; lat <= 85; lat += 5) coordinates.push([lng, lat])
    line(coordinates, lng === 0)
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const coordinates: [number, number][] = []
    for (let lng = -180; lng <= 180; lng += 5) coordinates.push([lng, lat])
    line(coordinates, lat === 0)
  }
  return { type: 'FeatureCollection', features }
}

function dots(countries: readonly Country[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: countries
      .filter((country) => country.tiny)
      .map((country) => ({
        type: 'Feature',
        properties: { code: country.code, owner: country.code },
        geometry: { type: 'Point', coordinates: country.anchor },
      })),
  }
}

export function hatchLayer(): LayerSpecification {
  return {
    id: LAYER.hatch,
    type: 'fill',
    source: 'world',
    filter: NO_MATCH,
    paint: { 'fill-pattern': HATCH_IMAGE, 'fill-opacity': 0.5 },
  }
}

export function buildStyle(countries: readonly Country[]): StyleSpecification {
  return {
    version: 8,
    projection: { type: 'globe' },
    sources: {
      world: { type: 'geojson', data: WORLD_GEOJSON_URL, tolerance: 0.25, buffer: 16, maxzoom: 9 },
      graticule: { type: 'geojson', data: graticule() },
      dots: { type: 'geojson', data: dots(countries) },
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': MAP_COLORS.ocean } },
      {
        id: 'graticule',
        type: 'line',
        source: 'graticule',
        paint: {
          'line-color': MAP_COLORS.graticule,
          'line-opacity': ['case', ['get', 'major'], 0.16, 0.07],
          'line-width': 0.8,
        },
      },
      { id: LAYER.land, type: 'fill', source: 'world', paint: { 'fill-color': MAP_COLORS.land } },
      {
        id: LAYER.hover,
        type: 'fill',
        source: 'world',
        filter: NO_MATCH,
        paint: { 'fill-color': MAP_COLORS.hover, 'fill-opacity': 0.2 },
      },
      {
        id: LAYER.signal,
        type: 'fill',
        source: 'world',
        filter: NO_MATCH,
        paint: { 'fill-color': MAP_COLORS.signal, 'fill-opacity': 0 },
      },
      {
        id: LAYER.borders,
        type: 'line',
        source: 'world',
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': MAP_COLORS.border,
          'line-opacity': 0.75,
          'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 4, 0.8, 8, 1.4],
        },
      },
      {
        id: LAYER.dots,
        type: 'circle',
        source: 'dots',
        paint: {
          'circle-radius': DOT_RADIUS,
          'circle-color': MAP_COLORS.land,
          'circle-stroke-color': MAP_COLORS.border,
          'circle-stroke-width': 1.5,
        },
      },
      {
        id: LAYER.dotsHover,
        type: 'circle',
        source: 'dots',
        filter: NO_MATCH,
        paint: { 'circle-radius': DOT_RADIUS, 'circle-color': MAP_COLORS.hover, 'circle-opacity': 0.3 },
      },
      {
        id: LAYER.dotsSignal,
        type: 'circle',
        source: 'dots',
        filter: NO_MATCH,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 6, 4, 9, 6, 11],
          'circle-color': MAP_COLORS.signal,
          'circle-opacity': 0,
        },
      },
    ],
  }
}

export function createHatchImage(): ImageData {
  const size = 16
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return new ImageData(size, size)
  context.strokeStyle = MAP_COLORS.wrongHatch
  context.lineWidth = 2
  context.lineCap = 'square'
  for (const offset of [-size, 0, size]) {
    context.beginPath()
    context.moveTo(offset, size)
    context.lineTo(offset + size, 0)
    context.stroke()
  }
  return context.getImageData(0, 0, size, size)
}
