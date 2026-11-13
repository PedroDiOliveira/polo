import { LngLat, Marker, type Map as MapLibreMap } from 'maplibre-gl'
import type { Country, Locale } from '../data/types'
import { isOnVisibleHemisphere } from './visibility'

const MAX_LABELS = 70
const VIEWPORT_MARGIN = 24
const LABEL_HEIGHT = 22
const CHAR_WIDTH = 6.8
const LABEL_PADDING = 22

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

// Renders capital labels as DOM markers, but only for the capitals that pass three gates:
// the zoom threshold of their country, the visible viewport, and a greedy collision pass.
export class CapitalLabels {
  private readonly ordered: readonly Country[]
  private readonly markers = new Map<string, Marker>()
  private enabled = false
  private locale: Locale = 'en'
  private frame = 0

  constructor(
    private readonly map: MapLibreMap,
    countries: readonly Country[],
    private readonly isGlobe: () => boolean,
  ) {
    this.ordered = [...countries].sort((a, b) => a.capitalZoom - b.capitalZoom)
    this.map.on('move', this.schedule)
    this.map.on('resize', this.schedule)
  }

  configure(enabled: boolean, locale: Locale): void {
    if (locale !== this.locale) this.clear()
    this.enabled = enabled
    this.locale = locale
    this.schedule()
  }

  destroy(): void {
    cancelAnimationFrame(this.frame)
    this.map.off('move', this.schedule)
    this.map.off('resize', this.schedule)
    this.clear()
  }

  private readonly schedule = (): void => {
    cancelAnimationFrame(this.frame)
    this.frame = requestAnimationFrame(() => this.update())
  }

  private clear(): void {
    for (const marker of this.markers.values()) marker.remove()
    this.markers.clear()
  }

  private update(): void {
    if (!this.enabled) {
      this.clear()
      return
    }

    const zoom = this.map.getZoom()
    const { clientWidth: width, clientHeight: height } = this.map.getContainer()
    const center = this.map.getCenter()
    const globe = this.isGlobe()
    const placed: Box[] = []
    const visible = new Set<string>()

    for (const country of this.ordered) {
      if (country.capitalZoom > zoom) break
      if (visible.size >= MAX_LABELS) break

      if (globe && !isOnVisibleHemisphere([center.lng, center.lat], country.capitalAt)) continue
      const position = new LngLat(country.capitalAt[0], country.capitalAt[1])

      const point = this.map.project(position)
      if (
        point.x < -VIEWPORT_MARGIN ||
        point.y < -VIEWPORT_MARGIN ||
        point.x > width + VIEWPORT_MARGIN ||
        point.y > height + VIEWPORT_MARGIN
      ) {
        continue
      }

      const labelWidth = country.capital[this.locale].length * CHAR_WIDTH + LABEL_PADDING
      const box: Box = {
        left: point.x - 6,
        top: point.y - LABEL_HEIGHT / 2,
        right: point.x + labelWidth,
        bottom: point.y + LABEL_HEIGHT / 2,
      }
      if (placed.some((other) => overlaps(box, other))) continue

      placed.push(box)
      visible.add(country.code)
      if (!this.markers.has(country.code)) this.markers.set(country.code, this.createMarker(country, position))
    }

    for (const [code, marker] of this.markers) {
      if (visible.has(code)) continue
      marker.remove()
      this.markers.delete(code)
    }
  }

  private createMarker(country: Country, position: LngLat): Marker {
    const element = document.createElement('div')
    element.className = 'capital-label'
    const dot = document.createElement('span')
    dot.className = 'capital-label__dot'
    const text = document.createElement('span')
    text.className = 'capital-label__text'
    text.textContent = country.capital[this.locale]
    element.append(dot, text)
    return new Marker({ element, anchor: 'left', offset: [-4, 0], opacityWhenCovered: '0' })
      .setLngLat(position)
      .addTo(this.map)
  }
}
