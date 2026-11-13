import generated from './generated/world.json'
import type { Country, Localized, Territory } from './types'

interface WorldData {
  countries: Country[]
  territories: Territory[]
}

const data = generated as unknown as WorldData

export const COUNTRIES: readonly Country[] = data.countries
export const WORLD_GEOJSON_URL = '/data/world.geojson'

const countryByCode = new Map(COUNTRIES.map((country) => [country.code, country]))
const territoryByCode = new Map(data.territories.map((territory) => [territory.code, territory]))

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
