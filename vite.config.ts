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

export default defineConfig({
  plugins: [react(), appMetadata()],
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
})
