'use client'

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Locale } from './types'
import zhCN from './zh-CN'
import enUS from './en-US'

type Translations = typeof zhCN

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

const translations: Record<Locale, Translations> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh-CN'
  const stored = localStorage.getItem('app_locale')
  if (stored === 'en-US' || stored === 'zh-CN') return stored
  const browserLang = navigator.language || ''
  if (browserLang.startsWith('zh')) return 'zh-CN'
  return 'zh-CN'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const t = useMemo(() => translations[locale], [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('app_locale', newLocale)
    setLocaleState(newLocale)
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
