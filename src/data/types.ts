export const CONTINENT_IDS = ['africa', 'asia', 'europe', 'north-america', 'south-america', 'oceania'] as const

export type ContinentId = (typeof CONTINENT_IDS)[number]
export type Locale = 'en' | 'pt'
export type Localized = Record<Locale, string>
export type LngLat = [lng: number, lat: number]
export type Bounds = [west: number, south: number, east: number, north: number]

export interface Country {
  code: string
  name: Localized
  capital: Localized
  capitalAt: LngLat
  continent: ContinentId
  anchor: LngLat
  bounds: Bounds
  capitalZoom: number
  tiny: boolean
}

export interface Territory {
  code: string
  owner: string | null
  name: Localized
}
