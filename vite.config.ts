import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { APP } from './src/config/app.ts'

// Injects the single source of truth for the product name into the HTML metadata and the web manifest.
function appMetadata(): Plugin {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  const tokens: Record<string, string> = {
    APP_NAME: APP.name,
    APP_TAGLINE: APP.tagline,
    APP_DESCRIPTION: APP.description,
    APP_THEME_COLOR: APP.themeColor,
    APP_LOCALE: APP.locale,
    APP_ORIGIN: process.env.SITE_URL ?? (host ? `https://${host}` : ''),
  }
  const manifest = JSON.stringify({
    name: APP.name,
    short_name: APP.name,
    description: APP.description,
    start_url: '/',
    display: 'standalone',
    background_color: APP.themeColor,
    theme_color: APP.themeColor,
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  })

  return {
    name: 'polo:app-metadata',
    transformIndexHtml: (html) => html.replace(/%(APP_[A-Z_]+)%/g, (match, key: string) => tokens[key] ?? match),
    configureServer(server) {
      server.middlewares.use('/site.webmanifest', (_request, response) => {
        response.setHeader('Content-Type', 'application/manifest+json')
        response.end(manifest)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'site.webmanifest', source: manifest })
    },
  }
}

// Google's Ad Placement API (AdSense H5 Games Ads). Nothing is injected unless VITE_ADSENSE_CLIENT is set,
// so local development and forks make no third-party request. Outside production the test flag is on:
// Google then serves test ads, which keeps our own clicks from counting as invalid traffic.
function adsense(): Plugin {
  const client = process.env.VITE_ADSENSE_CLIENT?.trim()
  if (client && !/^ca-pub-\d{10,20}$/.test(client)) {
    throw new Error(`VITE_ADSENSE_CLIENT must look like ca-pub-0000000000000000, got "${client}"`)
  }
  const forcedTest = process.env.ADS_TEST === 'on' || process.env.VERCEL_ENV === 'preview'

  return {
    name: 'polo:adsense',
    transformIndexHtml(_html, context) {
      if (!client) return []
      const test = forcedTest || context.server !== undefined
      return [
        {
          tag: 'script',
          attrs: {
            async: true,
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`,
            crossorigin: 'anonymous',
            'data-ad-frequency-hint': '60s',
            ...(test ? { 'data-adbreak-test': 'on' } : {}),
          },
          injectTo: 'head',
        },
        {
          tag: 'script',
          children:
            'window.adsbygoogle=window.adsbygoogle||[];window.adBreak=window.adConfig=function(o){window.adsbygoogle.push(o)};',
          injectTo: 'head',
        },
      ]
    },
    generateBundle() {
      if (!client) return
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), appMetadata(), adsense()],
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
})
