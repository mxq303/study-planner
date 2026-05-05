import { create } from 'zustand'
import { db } from '@/lib/storage'
import type { ReviewReminder } from '@/types'
import { getTodayReminders, getUpcomingReminders, getStreakInfo } from '@/lib/ebbinghaus'

interface ReviewStore {
  reminders: ReviewReminder[]
  isLoading: boolean
  loadReminders: () => Promise<void>
  completeReminder: (id: string) => Promise<void>
  getTodayReminders: () => ReviewReminder[]
  getUpcomingReminders: (days?: number) => ReviewReminder[]
  getStreakInfo: () => { streak: number; total: number; rate: number }
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reminders: [],
  isLoading: true,

  loadReminders: async () => {
    const reminders = await db.reviewReminders.orderBy('reviewDate').toArray()
    set({ reminders, isLoading: false })
  },

  completeReminder: async (id) => {
    const now = new Date().toISOString()
    await db.reviewReminders.update(id, {
      isCompleted: true,
      completedAt: now,
    })
    const reminders = await db.reviewReminders.orderBy('reviewDate').toArray()
    set({ reminders })
  },

  getTodayReminders: () => getTodayReminders(get().reminders),

  getUpcomingReminders: (days = 7) => getUpcomingReminders(get().reminders, days),

  getStreakInfo: () => getStreakInfo(get().reminders),
}))
