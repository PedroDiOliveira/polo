import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import mapshaper from 'mapshaper'
import {
  CAPITALS,
  CONTINENT_OVERRIDES,
  COUNTRY_EN_OVERRIDES,
  COUNTRY_PT_OVERRIDES,
  OWNER_OVERRIDES,
  PLACE_ALIASES,
} from './capitals.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = resolve(ROOT, '.cache/ne')
const SOURCE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'
const COUNTRIES_FILE = 'ne_10m_admin_0_countries.geojson'
const PLACES_FILE = 'ne_10m_populated_places_simple.geojson'
const SIMPLIFY = process.env.POLO_SIMPLIFY ?? '13%'
const TINY_SIZE_DEG = 1.1
const TINY_PADDING_DEG = 1.5
const PLACE_CODE_ALIASES = { SDS: 'SSD', PSX: 'PSE', KOS: 'KOS' }
const CONTINENT_IDS = {
  Africa: 'africa',
  Asia: 'asia',
  Europe: 'europe',
  'North America': 'north-america',
  'South America': 'south-america',
  Oceania: 'oceania',
}

async function cached(file) {
  const target = resolve(CACHE, file)
  try {
    await access(target)
  } catch {
    await mkdir(CACHE, { recursive: true })
    const response = await fetch(`${SOURCE}/${file}`)
    if (!response.ok) throw new Error(`Failed to download ${file}: ${response.status}`)
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
  }
  return target
}

const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()

const round = (value, digits = 3) => Number(value.toFixed(digits))

function ringArea(ring) {
  let sum = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1])
  }
  return Math.abs(sum / 2)
}

function largestPolygonBounds(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let best = polygons[0]
  let bestArea = -1
  for (const polygon of polygons) {
    const area = ringArea(polygon[0])
    if (area > bestArea) {
      best = polygon
      bestArea = area
    }
  }
  let [west, south, east, north] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [lng, lat] of best[0]) {
    west = Math.min(west, lng)
    east = Math.max(east, lng)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
  }
  return [west, south, east, north]
}

function capitalZoomFor(size) {
  const zoom = Math.log2(98 / Math.max(size, 0.01))
  return round(Math.min(5.2, Math.max(1.6, zoom)), 2)
}

const countriesPath = await cached(COUNTRIES_FILE)
const placesPath = await cached(PLACES_FILE)
const simplifiedPath = resolve(CACHE, 'countries.simplified.geojson')

await mapshaper.runCommands(
  `-i ${countriesPath} -filter-fields ADM0_A3,SOV_A3,NAME_EN,NAME_PT,CONTINENT,LABEL_X,LABEL_Y ` +
    `-simplify ${SIMPLIFY} weighted keep-shapes -clean -o precision=0.001 ${simplifiedPath}`,
)

const world = JSON.parse(await readFile(simplifiedPath, 'utf8'))
const places = JSON.parse(await readFile(placesPath, 'utf8')).features.map((f) => f.properties)

const playable = new Map(CAPITALS.map((entry) => [entry[0], entry]))
const featureByCode = new Map(world.features.map((f) => [f.properties.ADM0_A3, f]))

const sovereignToCode = new Map()
for (const feature of world.features) {
  const { ADM0_A3, SOV_A3 } = feature.properties
  if (!playable.has(ADM0_A3)) continue
  sovereignToCode.set(SOV_A3, sovereignToCode.has(SOV_A3) ? null : ADM0_A3)
}

function ownerOf({ ADM0_A3, SOV_A3 }) {
  if (playable.has(ADM0_A3)) return ADM0_A3
  return OWNER_OVERRIDES[ADM0_A3] ?? sovereignToCode.get(SOV_A3) ?? null
}

const unresolved = []

function resolveCapital(code, name, fallback) {
  const wanted = [name, ...(PLACE_ALIASES[code] ?? [])].map(normalize)
  const matches = places
    .filter((p) => wanted.includes(normalize(p.name)) || wanted.includes(normalize(p.nameascii ?? '')))
    .sort((a, b) => b.adm0cap - a.adm0cap)
  const codes = [code, PLACE_CODE_ALIASES[code]]
  const match = matches.find((p) => codes.includes(p.adm0_a3) || codes.includes(p.sov_a3))
  if (match) return [round(match.longitude, 4), round(match.latitude, 4)]
  if (fallback) return fallback
  unresolved.push(`${code}: ${name}`)
  return [0, 0]
}

const names = (properties) => ({
  en: COUNTRY_EN_OVERRIDES[properties.ADM0_A3] ?? properties.NAME_EN,
  pt: COUNTRY_PT_OVERRIDES[properties.ADM0_A3] ?? properties.NAME_PT,
})

const countries = CAPITALS.map(([code, capitalEn, capitalPt, fallback]) => {
  const feature = featureByCode.get(code)
  if (!feature) throw new Error(`Missing geometry for ${code}`)
  const { CONTINENT, LABEL_X, LABEL_Y } = feature.properties
  const continent = CONTINENT_IDS[CONTINENT_OVERRIDES[code] ?? CONTINENT]
  if (!continent) throw new Error(`Unknown continent for ${code}: ${CONTINENT}`)
  const shape = largestPolygonBounds(feature.geometry)
  const midLat = (shape[1] + shape[3]) / 2
  const size = Math.max((shape[2] - shape[0]) * Math.cos((midLat * Math.PI) / 180), shape[3] - shape[1])
  const tiny = size < TINY_SIZE_DEG
  const capitalAt = resolveCapital(code, capitalEn, fallback)
  const [lng, lat] = capitalAt
  const bounds = tiny ? [lng - TINY_PADDING_DEG, lat - TINY_PADDING_DEG, lng + TINY_PADDING_DEG, lat + TINY_PADDING_DEG] : shape
  return {
    code,
    name: names(feature.properties),
    capital: { en: capitalEn, pt: capitalPt ?? capitalEn },
    capitalAt,
    continent,
    anchor: tiny ? capitalAt : [round(LABEL_X, 3), round(LABEL_Y, 3)],
    bounds: bounds.map((value) => round(value, 2)),
    capitalZoom: capitalZoomFor(size),
    tiny,
  }
})

if (unresolved.length > 0) throw new Error(`No coordinates for capitals: ${unresolved.join(', ')}`)

const territories = world.features
  .filter((f) => !playable.has(f.properties.ADM0_A3))
  // Where a territory lies, which may be far from its owner (Greenland, Guam): a regional round only lights up
  // the territories inside its own continent. Open-ocean islands and Antarctica belong to none.
  .map((f) => ({
    code: f.properties.ADM0_A3,
    owner: ownerOf(f.properties),
    continent: CONTINENT_IDS[f.properties.CONTINENT] ?? null,
    name: names(f.properties),
  }))

const geojson = {
  type: 'FeatureCollection',
  features: world.features.map((f) => ({
    type: 'Feature',
    properties: { code: f.properties.ADM0_A3, owner: ownerOf(f.properties) ?? '' },
    geometry: f.geometry,
  })),
}

await mkdir(resolve(ROOT, 'public/data'), { recursive: true })
await mkdir(resolve(ROOT, 'src/data/generated'), { recursive: true })
await writeFile(resolve(ROOT, 'public/data/world.geojson'), JSON.stringify(geojson))
await writeFile(resolve(ROOT, 'src/data/generated/world.json'), JSON.stringify({ countries, territories }))

const perContinent = countries.reduce((acc, c) => ({ ...acc, [c.continent]: (acc[c.continent] ?? 0) + 1 }), {})
console.log(`countries: ${countries.length}`, perContinent)
console.log(`territories: ${territories.length}, unowned: ${territories.filter((t) => !t.owner).map((t) => t.code).join(' ')}`)
console.log(`tiny: ${countries.filter((c) => c.tiny).map((c) => c.code).join(' ')}`)
