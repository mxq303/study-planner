import { addDays, format, startOfDay, isSameDay, parseISO } from 'date-fns'
import { EBBINGHAUS_STAGES } from '@/types'
import type { ReviewReminder } from '@/types'

export function generateReviewReminders(
  taskId: string,
  completedDate: string,
  existingReminders: ReviewReminder[] = []
): ReviewReminder[] {
  const baseDate = startOfDay(parseISO(completedDate))
  const existingDates = new Set(existingReminders.map(r => r.reviewDate))

  return EBBINGHAUS_STAGES
    .filter(stage => {
      const reviewDate = format(addDays(baseDate, stage.daysAfter), 'yyyy-MM-dd')
      return !existingDates.has(reviewDate)
    })
    .map(stage => ({
      id: crypto.randomUUID(),
      taskId,
      stage: stage.stage,
      reviewDate: format(addDays(baseDate, stage.daysAfter), 'yyyy-MM-dd'),
      isCompleted: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
    }))
}

export function getTodayReminders(reminders: ReviewReminder[]): ReviewReminder[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  return reminders.filter(r => !r.isCompleted && r.reviewDate <= today)
}

export function getUpcomingReminders(reminders: ReviewReminder[], days: number = 7): ReviewReminder[] {
  const today = startOfDay(new Date())
  const end = addDays(today, days)

  return reminders
    .filter(r => {
      if (r.isCompleted) return false
      const date = parseISO(r.reviewDate)
      return date >= today && date <= end
    })
    .sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime())
}

export function getStreakInfo(reminders: ReviewReminder[]): { streak: number; total: number; rate: number } {
  const completed = reminders.filter(r => r.isCompleted)
  const rate = reminders.length > 0 ? completed.length / reminders.length : 0

  const dates = reminders
    .filter(r => r.isCompleted && r.completedAt)
    .map(r => format(startOfDay(parseISO(r.completedAt!)), 'yyyy-MM-dd'))
    .sort()
    .reverse()

  let streak = 0
  let checkDate = startOfDay(new Date())
  for (const dateStr of dates) {
    const date = startOfDay(parseISO(dateStr))
    if (isSameDay(date, checkDate)) {
      streak++
      checkDate = addDays(checkDate, -1)
    } else {
      break
    }
  }

  return { streak, total: reminders.length, rate }
}
