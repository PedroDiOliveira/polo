import {
  LngLat,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type MapMouseEvent,
  type PointLike,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import type { Bounds, Country, Locale } from '../data/types'
import { COUNTRIES, getCountry } from '../data/world'
import { CapitalLabels } from './CapitalLabels'
import {
  buildStyle,
  codeFilter,
  createHatchImage,
  hatchLayer,
  HATCH_IMAGE,
  LAYER,
  markColor,
  NO_MATCH,
  ownerFilter,
  ownersFilter,
} from './layers'
import { MAP_COLORS, MAP_VIEW } from './theme'
import { isOnVisibleHemisphere } from './visibility'

setWorkerUrl(workerUrl)

export type ProjectionName = 'globe' | 'mercator'
export type SignalKind = 'correct' | 'wrong'

export interface MapCallbacks {
  onReady(): void
  onError(): void
  onHover(code: string | null): void
  onPointer(x: number, y: number): void
  onPick(code: string): void
}

interface Hit {
  code: string
  owner: string
}

const DOT_HIT_RADIUS = 9
const ZOOM_STEP = 1
const SIGNAL_PULSE_MS = 520

export class MapController {
  private readonly map: MapLibreMap
  private readonly labels: CapitalLabels
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private ready = false
  private pending: (() => void)[] = []
  private hovered: string | null = null
  private hoverFrame = 0
  private signalFrame = 0
  private signalMarker: Marker | null = null
  private projection: ProjectionName = 'globe'

  constructor(
    container: HTMLElement,
    private readonly callbacks: MapCallbacks,
  ) {
    this.map = new MapLibreMap({
      container,
      style: buildStyle(COUNTRIES),
      center: MAP_VIEW.center,
      zoom: MAP_VIEW.zoom,
      minZoom: MAP_VIEW.minZoom,
      maxZoom: MAP_VIEW.maxZoom,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxPitch: 0,
      fadeDuration: 0,
    })
    this.map.touchZoomRotate.disableRotation()
    this.map.keyboard.disableRotation()
    this.labels = new CapitalLabels(this.map, COUNTRIES, () => this.projection === 'globe')

    this.map.once('load', () => {
      this.map.addImage(HATCH_IMAGE, createHatchImage(), { pixelRatio: 2 })
      this.map.addLayer(hatchLayer(), LAYER.hover)
      this.ready = true
      this.pending.forEach((task) => task())
      this.pending = []
      this.callbacks.onReady()
    })
    this.map.on('error', (event) => {
      if (!this.ready) this.callbacks.onError()
      console.error(event.error)
    })
    this.map.on('mousemove', this.handleMove)
    this.map.on('mouseout', this.handleLeave)
    this.map.on('click', this.handleClick)
    this.map.on('dragstart', this.handleLeave)
  }

  destroy(): void {
    cancelAnimationFrame(this.hoverFrame)
    cancelAnimationFrame(this.signalFrame)
    this.labels.destroy()
    this.map.remove()
  }

  setCapitals(visible: boolean, locale: Locale): void {
    this.labels.configure(visible, locale)
  }

  setMarks(correct: readonly string[], wrong: readonly string[]): void {
    this.whenReady(() => {
      const color = markColor(correct, wrong)
      this.map.setPaintProperty(LAYER.land, 'fill-color', color)
      this.map.setPaintProperty(LAYER.dots, 'circle-color', color)
      this.map.setFilter(LAYER.hatch, ownersFilter(wrong))
    })
  }

  signal(code: string, kind: SignalKind, label: string, durationMs: number): void {
    const country = getCountry(code)
    if (!country) return
    this.whenReady(() => {
      this.clearSignal()
      const color = kind === 'wrong' ? MAP_COLORS.signal : MAP_COLORS.flash
      this.map.setFilter(LAYER.signal, ownerFilter(code))
      this.map.setFilter(LAYER.dotsSignal, ownerFilter(code))
      this.map.setPaintProperty(LAYER.signal, 'fill-color', color)
      this.map.setPaintProperty(LAYER.dotsSignal, 'circle-color', color)

      if (kind === 'wrong') {
        this.reveal(country)
        this.signalMarker = this.createSignalMarker(country, label)
      }
      this.animateSignal(kind, durationMs)
    })
  }

  clearSignal(): void {
    cancelAnimationFrame(this.signalFrame)
    this.signalMarker?.remove()
    this.signalMarker = null
    if (!this.ready) return
    this.map.setFilter(LAYER.signal, NO_MATCH)
    this.map.setFilter(LAYER.dotsSignal, NO_MATCH)
    this.setSignalOpacity(0)
  }

  focus(bounds: Bounds | null): void {
    this.whenReady(() => {
      if (!bounds) {
        this.map.easeTo({ center: MAP_VIEW.center, zoom: MAP_VIEW.zoom, duration: this.duration(900) })
        return
      }
      this.fit(bounds, 6)
    })
  }

  zoomBy(direction: 1 | -1): void {
    this.map.easeTo({ zoom: this.map.getZoom() + direction * ZOOM_STEP, duration: this.duration(280) })
  }

  toggleProjection(): ProjectionName {
    this.projection = this.projection === 'globe' ? 'mercator' : 'globe'
    this.map.setProjection({ type: this.projection })
    return this.projection
  }

  private whenReady(task: () => void): void {
    if (this.ready) task()
    else this.pending.push(task)
  }

  private duration(ms: number): number {
    return this.reducedMotion ? 0 : ms
  }

  private fit(bounds: Bounds, maxZoom: number): void {
    const { clientWidth, clientHeight } = this.map.getContainer()
    const side = Math.round(clientWidth * 0.12)
    this.map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      {
        padding: { top: Math.round(clientHeight * 0.26), bottom: Math.round(clientHeight * 0.14), left: side, right: side },
        maxZoom,
        duration: this.duration(900),
      },
    )
  }

  private reveal(country: Country): void {
    const anchor = new LngLat(country.anchor[0], country.anchor[1])
    const { clientWidth, clientHeight } = this.map.getContainer()
    const point = this.map.project(anchor)
    const center = this.map.getCenter()
    const inView =
      (this.projection !== 'globe' || isOnVisibleHemisphere([center.lng, center.lat], country.anchor)) &&
      point.x > clientWidth * 0.1 &&
      point.x < clientWidth * 0.9 &&
      point.y > clientHeight * 0.24 &&
      point.y < clientHeight * 0.88
    const legible = !country.tiny || this.map.getZoom() >= 3
    if (inView && legible) return
    this.fit(country.bounds, country.tiny ? 5 : 4.5)
  }

  private createSignalMarker(country: Country, label: string): Marker {
    const element = document.createElement('div')
    element.className = 'signal-marker'
    const ring = document.createElement('span')
    ring.className = 'signal-marker__ring'
    const text = document.createElement('span')
    text.className = 'signal-marker__label'
    text.textContent = label
    element.append(ring, text)
    return new Marker({ element, anchor: 'center' }).setLngLat(country.anchor).addTo(this.map)
  }

  private animateSignal(kind: SignalKind, durationMs: number): void {
    const startedAt = performance.now()
    const step = (now: number) => {
      const elapsed = now - startedAt
      if (elapsed >= durationMs) {
        if (kind === 'correct') this.clearSignal()
        else this.setSignalOpacity(0.9)
        return
      }
      const opacity =
        kind === 'correct'
          ? 0.6 * (1 - elapsed / durationMs)
          : this.reducedMotion
            ? 0.9
            : 0.72 + 0.26 * Math.cos((elapsed / SIGNAL_PULSE_MS) * Math.PI * 2)
      this.setSignalOpacity(opacity)
      this.signalFrame = requestAnimationFrame(step)
    }
    this.signalFrame = requestAnimationFrame(step)
  }

  private setSignalOpacity(opacity: number): void {
    this.map.setPaintProperty(LAYER.signal, 'fill-opacity', opacity)
    this.map.setPaintProperty(LAYER.dotsSignal, 'circle-opacity', opacity)
  }

  private hitTest(event: MapMouseEvent): Hit | null {
    if (!this.ready) return null
    const { x, y } = event.point
    const box: [PointLike, PointLike] = [
      [x - DOT_HIT_RADIUS, y - DOT_HIT_RADIUS],
      [x + DOT_HIT_RADIUS, y + DOT_HIT_RADIUS],
    ]
    const feature =
      this.map.queryRenderedFeatures(box, { layers: [LAYER.dots] })[0] ??
      this.map.queryRenderedFeatures(event.point, { layers: [LAYER.land] })[0]
    if (!feature) return null
    const { code, owner } = feature.properties as Hit
    return { code, owner }
  }

  private setHover(hit: Hit | null): void {
    const code = hit?.code ?? null
    if (code === this.hovered) return
    this.hovered = code
    this.map.getCanvas().style.cursor = hit ? 'pointer' : ''
    const filter = !hit ? NO_MATCH : hit.owner ? ownerFilter(hit.owner) : codeFilter(hit.code)
    this.map.setFilter(LAYER.hover, filter)
    this.map.setFilter(LAYER.dotsHover, filter)
    this.callbacks.onHover(code)
  }

  private readonly handleMove = (event: MapMouseEvent): void => {
    cancelAnimationFrame(this.hoverFrame)
    this.hoverFrame = requestAnimationFrame(() => {
      this.callbacks.onPointer(event.point.x, event.point.y)
      this.setHover(this.hitTest(event))
    })
  }

  private readonly handleLeave = (): void => {
    cancelAnimationFrame(this.hoverFrame)
    if (this.ready) this.setHover(null)
  }

  private readonly handleClick = (event: MapMouseEvent): void => {
    const hit = this.hitTest(event)
    this.callbacks.onPointer(event.point.x, event.point.y)
    this.setHover(hit)
    if (hit) this.callbacks.onPick(hit.code)
  }
}
