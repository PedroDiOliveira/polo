import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../data/types'
import { I18nContext, type I18n } from './I18nContext'
import { MESSAGES } from './messages'

function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
  }, [locale])

  const value = useMemo<I18n>(
    () => ({
      locale,
      t: MESSAGES[locale],
      toggleLocale: () => setLocale((current) => (current === 'pt' ? 'en' : 'pt')),
    }),
    [locale],
  )

  return <I18nContext value={value}>{children}</I18nContext>
}
