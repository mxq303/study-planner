'use client'

import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { ThemeProvider } from '@/lib/theme'
import { I18nProvider } from '@/lib/i18n'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { usePreferenceStore } from '@/stores/preferenceStore'

export function Providers({ children }: { children: ReactNode }) {
  const handleOnboardingComplete = useCallback(() => {
    const store = usePreferenceStore.getState()
    if (store.preferences) {
      store.updatePreferences({ onboardingCompleted: true }).catch(console.error)
    }
  }, [])

  return (
    <ThemeProvider>
      <I18nProvider>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
        {children}
      </I18nProvider>
    </ThemeProvider>
  )
}
