import { createContext, use } from 'react'
import type { Locale } from '../data/types'
import type { Messages } from './messages'

export interface I18n {
  locale: Locale
  t: Messages
  toggleLocale: () => void
}

export const I18nContext = createContext<I18n | null>(null)

export function useI18n(): I18n {
  const value = use(I18nContext)
  if (!value) throw new Error('useI18n must be used within I18nProvider')
  return value
}
