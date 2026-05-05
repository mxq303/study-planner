'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/theme'
import { I18nProvider } from '@/lib/i18n'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <OnboardingWizard onComplete={() => {}} />
        {children}
      </I18nProvider>
    </ThemeProvider>
  )
}
