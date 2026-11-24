// A local stand-in for Google's Ad Placement API, to test the ad flows before the AdSense account exists.
// Enabled with ?ads=mock in the URL, and only in builds without VITE_ADSENSE_CLIENT, so it can never
// replace real ads. It answers adBreak() the way Google does, with a fake ad drawn on top of the page.

const REWARD_SECONDS = 5
const INTERSTITIAL_SECONDS = 3

type Callbacks = {
  type: string
  beforeAd?: () => void
  afterAd?: () => void
  beforeReward?: (showAdFn: () => void) => void
  adDismissed?: () => void
  adViewed?: () => void
  adBreakDone?: (info: { breakStatus: string }) => void
}

function showFakeAd(label: string, seconds: number, skippable: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-label', label)
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgb(0 0 0/.82);font:16px system-ui,sans-serif;color:#fff'
    overlay.innerHTML = `
      <div style="width:min(420px,90vw);padding:28px;border-radius:16px;background:#1d2b4f;text-align:center;box-shadow:0 20px 60px #000">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">Simulated ad · not from Google</p>
        <h2 style="margin:0 0 14px;font-size:22px">${label}</h2>
        <p data-count style="margin:0 0 18px;font-size:40px;font-weight:700"></p>
        ${skippable ? '<button type="button" data-close style="font:inherit;padding:8px 16px;border-radius:999px;border:1px solid #fff6;background:none;color:#fff;cursor:pointer">Close without finishing</button>' : ''}
      </div>`
    document.body.append(overlay)
    const count = overlay.querySelector<HTMLElement>('[data-count]')!
    let left = seconds
    const finish = (viewed: boolean) => {
      window.clearInterval(timer)
      overlay.remove()
      resolve(viewed)
    }
    const tick = () => {
      count.textContent = `${left}s`
      if (left-- <= 0) finish(true)
    }
    const timer = window.setInterval(tick, 1000)
    tick()
    overlay.querySelector('[data-close]')?.addEventListener('click', () => finish(false))
  })
}

export function installMockAds(): void {
  const queue = Object.assign([] as unknown[], { loaded: true })
  window.adsbygoogle = queue
  window.adConfig = () => {}
  window.adBreak = (placement) => {
    const p = placement as Callbacks
    if (p.type === 'reward') {
      // Like Google, offer the reward only once an ad is "ready".
      window.setTimeout(() => {
        p.beforeReward?.(() => {
          p.beforeAd?.()
          void showFakeAd('Rewarded ad (extra life)', REWARD_SECONDS, true).then((viewed) => {
            p.afterAd?.()
            if (viewed) p.adViewed?.()
            else p.adDismissed?.()
            p.adBreakDone?.({ breakStatus: viewed ? 'viewed' : 'dismissed' })
          })
        })
      }, 150)
      return
    }
    p.beforeAd?.()
    void showFakeAd('Interstitial ad', INTERSTITIAL_SECONDS, false).then(() => {
      p.afterAd?.()
      p.adBreakDone?.({ breakStatus: 'viewed' })
    })
  }
  console.info('[ads] Simulated ads are on (?ads=mock). Nothing here comes from Google.')
}
