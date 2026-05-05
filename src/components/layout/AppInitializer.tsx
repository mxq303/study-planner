'use client'

import { useEffect } from 'react'
import { useSubjectStore } from '@/stores/subjectStore'
import { useTaskStore } from '@/stores/taskStore'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useReviewStore } from '@/stores/reviewStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useTheme } from '@/lib/theme'
import { useI18n } from '@/lib/i18n'

export function AppInitializer() {
  const { initPresetSubjects, loadSubjects } = useSubjectStore()
  const { loadTasks } = useTaskStore()
  const { initDefaultPreferences, loadPreferences, preferences } = usePreferenceStore()
  const { loadReminders } = useReviewStore()
  const { loadSessions } = usePomodoroStore()
  const { setTheme } = useTheme()
  const { setLocale } = useI18n()

  useEffect(() => {
    async function init() {
      await initDefaultPreferences()
      await initPresetSubjects()
      await Promise.all([
        loadSubjects(),
        loadTasks(),
        loadPreferences(),
        loadReminders(),
        loadSessions(),
      ])
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!preferences) return

    document.documentElement.style.setProperty('--accent', preferences.accentColor || '#6366f1')

    const html = document.documentElement
    html.className = html.className
      .replace(/text-scale-\w+/g, `text-scale-${preferences.fontSizeScale || 'md'}`)
      .replace(/density-\w+/g, `density-${preferences.uiDensity || 'comfortable'}`)
      .replace(/card-style-\w+/g, `card-style-${preferences.cardStyle || 'solid'}`)

    if (preferences.theme === 'light' || preferences.theme === 'dark' || preferences.theme === 'system') {
      setTheme(preferences.theme)
    }

    if (preferences.language === 'zh-CN' || preferences.language === 'en-US') {
      setLocale(preferences.language)
    }
  }, [preferences, setTheme, setLocale])

  return null
}
