import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'
import './styles/global.css'
import { installMockAds } from './ads/mockAds'
import { App } from './App'
import { I18nProvider } from './i18n/I18nProvider'

// ?ads=mock simulates Google's ads locally. Never in a build that has a real AdSense client.
if (!import.meta.env.VITE_ADSENSE_CLIENT && new URLSearchParams(location.search).get('ads') === 'mock') {
  installMockAds()
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
