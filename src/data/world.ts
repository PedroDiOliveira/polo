import generated from './generated/world.json'
import type { ContinentId, Country, Localized, Territory } from './types'

interface WorldData {
  countries: Country[]
  territories: Territory[]
}

const data = generated as unknown as WorldData

export const COUNTRIES: readonly Country[] = data.countries
export const WORLD_GEOJSON_URL = '/data/world.geojson'

const countryByCode = new Map(COUNTRIES.map((country) => [country.code, country]))
const territoryByCode = new Map(data.territories.map((territory) => [territory.code, territory]))

// Every map feature a country answers for: itself plus its territories (France paints French Guiana too).
const featuresByOwner = new Map(COUNTRIES.map((country) => [country.code, [country.code]]))
for (const territory of data.territories) {
  if (territory.owner) featuresByOwner.get(territory.owner)?.push(territory.code)
}

export function featuresOwnedBy(owner: string): readonly string[] {
  return featuresByOwner.get(owner) ?? [owner]
}

// The map features that belong to a continent's round: its countries, plus those of their territories that lie on
// the same continent. Greenland answers for Denmark, but it is not part of a European round.
export function regionFeatures(continent: ContinentId): readonly string[] {
  const owners = new Set(COUNTRIES.filter((country) => country.continent === continent).map((country) => country.code))
  return [
    ...owners,
    ...data.territories
      .filter((territory) => territory.owner && owners.has(territory.owner) && territory.continent === continent)
      .map((territory) => territory.code),
  ]
}

// Every feature on the map, countries and territories alike.
export const ALL_FEATURES: readonly string[] = [
  ...COUNTRIES.map((country) => country.code),
  ...data.territories.map((territory) => territory.code),
]

export function getCountry(code: string): Country | undefined {
  return countryByCode.get(code)
}

export interface Place {
  name: Localized
  owner: Country | null
  isCountry: boolean
}

export function describePlace(code: string): Place | null {
  const country = countryByCode.get(code)
  if (country) return { name: country.name, owner: country, isCountry: true }
  const territory = territoryByCode.get(code)
  if (!territory) return null
  const owner = territory.owner ? (countryByCode.get(territory.owner) ?? null) : null
  return { name: territory.name, owner, isCountry: false }
}
