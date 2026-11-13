import type { Bounds, ContinentId } from '../data/types'

export const CONTINENT_BOUNDS: Record<ContinentId, Bounds> = {
  africa: [-19, -35, 52, 38],
  asia: [26, -11, 146, 55],
  europe: [-24, 35, 42, 67],
  'north-america': [-130, 7, -58, 62],
  'south-america': [-82, -56, -34, 13],
  oceania: [112, -47, 179, 10],
}
