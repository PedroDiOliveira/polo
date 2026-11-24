// A thin, typed facade over Google's Ad Placement API (AdSense H5 Games Ads).
// The game must work exactly as before without ads: every call here resolves on its own
// when the script is missing, blocked, not approved yet, or Google has no ad to show.

type BreakStatus =
  | 'notReady'
  | 'timeout'
  | 'error'
  | 'noAdPreloaded'
  | 'frequencyCapped'
  | 'ignored'
  | 'other'
  | 'dismissed'
  | 'viewed'

interface Placement {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward'
  name: string
  beforeAd?: () => void
  afterAd?: () => void
  beforeReward?: (showAdFn: () => void) => void
  adDismissed?: () => void
  adViewed?: () => void
  adBreakDone?: (info: { breakStatus: BreakStatus }) => void
}

interface AdConfig {
  preloadAdBreaks?: 'on' | 'auto'
  sound?: 'on' | 'off'
}

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { loaded?: boolean }
    adBreak?: (placement: Placement) => void
    adConfig?: (config: AdConfig) => void
  }
}

export const ADS = {
  // An interstitial is offered at a natural break once this many regular games have finished.
  gamesPerInterstitial: 2,
  // How long the extra-life offer stays open before it declines itself.
  offerTimeoutMs: 8_000,
  // How long to wait for Google to say whether an ad is ready before carrying on without one.
  lookupTimeoutMs: 1_500,
} as const

const COUNTER_KEY = 'polo.ads.games'

// The script sets `adsbygoogle.loaded` once it really runs; the inline stub alone never does.
function available(): boolean {
  return typeof window !== 'undefined' && typeof window.adBreak === 'function' && window.adsbygoogle?.loaded === true
}

let configured = false

export function initAds(): void {
  if (configured || typeof window.adConfig !== 'function') return
  configured = true
  window.adConfig({ preloadAdBreaks: 'on', sound: 'off' })
}

function readCounter(): number {
  try {
    return Number(sessionStorage.getItem(COUNTER_KEY)) || 0
  } catch {
    return 0
  }
}

function writeCounter(value: number): void {
  try {
    sessionStorage.setItem(COUNTER_KEY, String(value))
  } catch {
    // Without storage the counter simply restarts with the tab.
  }
}

// Called once for every regular game that ends (review rounds do not count).
export function countFinishedGame(): void {
  writeCounter(readCounter() + 1)
}

// Shows an interstitial if enough games have passed since the last one, then resolves.
// Google still has the last word: it may decline because of its own frequency cap.
export function interstitialBreak(name: string): Promise<void> {
  if (!available() || readCounter() < ADS.gamesPerInterstitial) return Promise.resolve()
  return new Promise((resolve) => {
    let started = false
    const done = () => {
      window.clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(() => {
      if (!started) resolve()
    }, ADS.lookupTimeoutMs)
    window.adBreak?.({
      type: 'next',
      name,
      beforeAd: () => {
        started = true
        writeCounter(0)
      },
      adBreakDone: done,
    })
  })
}

export interface Reward {
  // Plays the ad; resolves true only if the player watched it to the end.
  show: () => Promise<boolean>
}

// Asks Google for a rewarded ad. Resolves null when none is ready, so the game never offers an ad it cannot play.
export function requestReward(name: string): Promise<Reward | null> {
  if (!available()) return Promise.resolve(null)
  return new Promise((resolve) => {
    let settle: ((viewed: boolean) => void) | null = null
    let offered = false
    const timer = window.setTimeout(() => {
      if (!offered) resolve(null)
    }, ADS.lookupTimeoutMs)

    window.adBreak?.({
      type: 'reward',
      name,
      beforeReward: (showAdFn) => {
        offered = true
        window.clearTimeout(timer)
        resolve({
          show: () =>
            new Promise<boolean>((watched) => {
              settle = watched
              showAdFn()
            }),
        })
      },
      adViewed: () => settle?.(true),
      adDismissed: () => settle?.(false),
      adBreakDone: (info) => {
        window.clearTimeout(timer)
        if (!offered) resolve(null)
        else settle?.(info.breakStatus === 'viewed')
      },
    })
  })
}
