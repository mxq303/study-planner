import { create } from 'zustand'
import { db } from '@/lib/storage'
import type { UserPreference, PomodoroMode } from '@/types'
import { generateId } from '@/lib/utils'

interface PreferenceStore {
  preferences: UserPreference | null
  isLoading: boolean
  loadPreferences: () => Promise<void>
  initDefaultPreferences: () => Promise<void>
  updatePreferences: (data: Partial<UserPreference>) => Promise<void>
  getPomodoroConfig: () => {
    mode: PomodoroMode
    focusMinutes: number
    breakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
  }
}

export const usePreferenceStore = create<PreferenceStore>((set, get) => ({
  preferences: null,
  isLoading: true,

  loadPreferences: async () => {
    const prefs = await db.userPreferences.toArray()
    set({ preferences: prefs[0] || null, isLoading: false })
  },

  initDefaultPreferences: async () => {
    const existing = await db.userPreferences.count()
    if (existing > 0) return

    const pref: UserPreference = {
      id: generateId(),
      pomodoroMode: 'fixed',
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      pomodoroLongBreakMinutes: 15,
      pomodoroLongBreakInterval: 4,
      dailyStudyStart: '19:00',
      dailyStudyEnd: '22:00',
      weeklyOffDays: [0, 6],
      theme: 'light',
      language: 'zh-CN',
      weeklyGoalMinutes: 300,
      notificationEnabled: false,
      notificationTime: '20:00',
      soundEnabled: true,
      accentColor: '#6366f1',
      onboardingCompleted: false,
    }
    await db.userPreferences.add(pref)
    set({ preferences: pref })
  },

  updatePreferences: async (data) => {
    const prefs = get().preferences
    if (!prefs) return
    const updated = { ...prefs, ...data }
    await db.userPreferences.update(prefs.id, updated)
    set({ preferences: updated })
  },

  getPomodoroConfig: () => {
    const p = get().preferences
    return {
      mode: p?.pomodoroMode || 'fixed',
      focusMinutes: p?.pomodoroFocusMinutes || 25,
      breakMinutes: p?.pomodoroBreakMinutes || 5,
      longBreakMinutes: p?.pomodoroLongBreakMinutes || 15,
      longBreakInterval: p?.pomodoroLongBreakInterval || 4,
    }
  },
}))
