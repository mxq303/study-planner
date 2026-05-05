'use client'

import { useEffect } from 'react'
import { useSubjectStore } from '@/stores/subjectStore'
import { useTaskStore } from '@/stores/taskStore'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useReviewStore } from '@/stores/reviewStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'

export function AppInitializer() {
  const { initPresetSubjects, loadSubjects } = useSubjectStore()
  const { loadTasks } = useTaskStore()
  const { initDefaultPreferences, loadPreferences } = usePreferenceStore()
  const { loadReminders } = useReviewStore()
  const { loadSessions } = usePomodoroStore()

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

  return null
}
