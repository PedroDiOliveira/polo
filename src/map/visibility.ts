import type { LngLat } from '../data/types'

const HORIZON_COSINE = 0.2
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// On the globe, anything past the horizon is hidden: compare the angular distance to the view centre.
export function isOnVisibleHemisphere(center: LngLat, point: LngLat): boolean {
  const [lng1, lat1] = center.map(toRadians)
  const [lng2, lat2] = point.map(toRadians)
  const cosine = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  return cosine > HORIZON_COSINE
}
