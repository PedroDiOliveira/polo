import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import type { Bounds, Locale } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import ui from '../styles/primitives.module.css'
import type { MapFill } from './layers'
import { MapController, type MapInset, type ProjectionName, type SignalKind } from './MapController'
import styles from './MapView.module.css'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapSignal {
  code: string
  kind: SignalKind
  label: string
  durationMs: number
}

export type { MapInset }

export interface MapFocus {
  id: number
  bounds: Bounds | null
}

interface MapViewProps {
  locale: Locale
  showCapitals: boolean
  fills: readonly MapFill[]
  hatched: readonly string[]
  signal: MapSignal | null
  focus: MapFocus
  inset: MapInset
  tooltipFor: (code: string) => string | null
  onPick: (code: string) => void
}

type Status = 'loading' | 'ready' | 'error'

export function MapView({ locale, showCapitals, fills, hatched, signal, focus, inset, tooltipFor, onPick }: MapViewProps) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<MapController | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [hovered, setHovered] = useState<string | null>(null)
  const [projection, setProjection] = useState<ProjectionName>('globe')
  const handlePick = useEffectEvent(onPick)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let controller: MapController
    try {
      controller = new MapController(container, {
        onReady: () => setStatus('ready'),
        onError: () => setStatus('error'),
        onHover: setHovered,
        onPointer: (x, y) => {
          if (tooltipRef.current) tooltipRef.current.style.translate = `${x}px ${y}px`
        },
        onPick: (code) => handlePick(code),
      })
    } catch (error) {
      console.error(error)
      queueMicrotask(() => setStatus('error'))
      return
    }
    controllerRef.current = controller
    return () => {
      controllerRef.current = null
      controller.destroy()
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.setCapitals(showCapitals, locale)
  }, [showCapitals, locale])

  useEffect(() => {
    controllerRef.current?.setFills(fills, hatched)
  }, [fills, hatched])

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return
    if (signal) controller.signal(signal.code, signal.kind, signal.label, signal.durationMs)
    else controller.clearSignal()
  }, [signal])

  // Declared before the focus effect: when both change together, the framing must win.
  useEffect(() => {
    controllerRef.current?.setInset({ left: inset.left, bottom: inset.bottom })
  }, [inset.left, inset.bottom])

  useEffect(() => {
    if (focus.id > 0) controllerRef.current?.focus(focus.bounds)
  }, [focus])

  const tooltip = hovered ? tooltipFor(hovered) : null
  const toggleProjection = () => {
    const next = controllerRef.current?.toggleProjection()
    if (next) setProjection(next)
  }

  return (
    <div className={styles.root}>
      <div ref={containerRef} className={styles.map} role="application" aria-label={t.mapLabel} />

      <div ref={tooltipRef} className={styles.tooltipAnchor} aria-hidden="true">
        {tooltip && <span className={styles.tooltip}>{tooltip}</span>}
      </div>

      {status !== 'ready' && (
        <div className={styles.overlay} role="status">
          <img
            className={status === 'loading' ? styles.spinner : undefined}
            src="/brand/polo-symbol.svg"
            alt=""
            width={56}
            height={56}
          />
          <p>{status === 'loading' ? t.mapLoading : t.mapError}</p>
        </div>
      )}

      <div className={`${ui.panel} ${styles.controls}`}>
        <button
          type="button"
          className={`${ui.iconButton} ${styles.zoom}`}
          onClick={() => controllerRef.current?.zoomBy(1)}
          aria-label={t.zoomIn}
        >
          <Icon name="plus" />
        </button>
        <button
          type="button"
          className={`${ui.iconButton} ${styles.zoom}`}
          onClick={() => controllerRef.current?.zoomBy(-1)}
          aria-label={t.zoomOut}
        >
          <Icon name="minus" />
        </button>
        <span className={`${styles.divider} ${styles.zoom}`} aria-hidden="true" />
        <button
          type="button"
          className={ui.iconButton}
          onClick={toggleProjection}
          aria-label={projection === 'globe' ? t.showFlat : t.showGlobe}
        >
          <Icon name={projection === 'globe' ? 'flat' : 'globe'} />
        </button>
      </div>
    </div>
  )
}
