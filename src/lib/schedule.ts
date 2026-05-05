import { type Task, type ScheduleSlot } from '@/types'
import { addDays, format, differenceInDays, isBefore } from 'date-fns'

interface ScheduleInput {
  tasks: Task[]
  subjects: Subject[]
  dailyStart: string
  dailyEnd: string
  offDays: number[]
  startDate: Date
}

export function calculatePriorityScore(task: Task): number {
  if (!task.deadline) return task.priority * 2
  const daysUntilDeadline = differenceInDays(new Date(task.deadline), new Date())
  const urgency = daysUntilDeadline <= 0 ? 100 : 1 / Math.max(daysUntilDeadline, 0.5)
  const complexity = 1 + Math.log(Math.max(task.estimatedMinutes, 1))
  return urgency * task.priority * complexity
}

export function generateSchedule(input: ScheduleInput): ScheduleSlot[] {
  const { tasks, subjects, dailyStart, dailyEnd, offDays, startDate } = input
  const pendingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a))

  const slots: ScheduleSlot[] = []
  const [startH, startM] = dailyStart.split(':').map(Number)
  const [endH, endM] = dailyEnd.split(':').map(Number)
  const dailyMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  const bufferRatio = 0.2
  const availableDailyMin = Math.floor(dailyMinutes * (1 - bufferRatio))

  const dateAllocations: Map<string, { remaining: number; subjects: Set<string> }> = new Map()
  const allocated: Set<string> = new Set()

  let currentDate = new Date(startDate)
  const maxDays = 60
  let dayCount = 0

  while (allocated.size < pendingTasks.length && dayCount < maxDays) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayOfWeek = currentDate.getDay()

    if (!offDays.includes(dayOfWeek)) {
      dateAllocations.set(dateKey, { remaining: availableDailyMin, subjects: new Set() })

      for (const task of pendingTasks) {
        if (allocated.has(task.id)) continue
        if (task.scheduledDate && isBefore(new Date(task.scheduledDate), currentDate)) continue
        if (task.deadline && isBefore(new Date(task.deadline), currentDate)) continue

        const alloc = dateAllocations.get(dateKey)!
        if (alloc.remaining <= 0) break

        const subject = subjects.find(s => s.id === task.subjectId)
        const subjectName = subject?.name

        const taskDuration = Math.min(task.estimatedMinutes, alloc.remaining)

        let startMinutes = startH * 60 + startM
        if (slots.length > 0) {
          const lastSlot = slots.filter(s => s.date === dateKey).pop()
          if (lastSlot) {
            const [lh, lm] = lastSlot.endTime.split(':').map(Number)
            startMinutes = lh * 60 + lm
          }
        }

        const startHour = Math.floor(startMinutes / 60)
        const startMinute = startMinutes % 60
        const endMinutes = startMinutes + taskDuration
        const endHour = Math.floor(endMinutes / 60)
        const endMinute = endMinutes % 60

        slots.push({
          date: dateKey,
          startTime: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
          endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
          taskId: task.id,
          taskTitle: task.title,
          subjectName,
          subjectColor: subject?.color,
        })

        alloc.remaining -= taskDuration
        alloc.subjects.add(subjectName || '')
        allocated.add(task.id)
      }
    }

    currentDate = addDays(currentDate, 1)
    dayCount++
  }

  return diversifySchedule(slots)
}

function diversifySchedule(slots: ScheduleSlot[]): ScheduleSlot[] {
  const byDate = new Map<string, ScheduleSlot[]>()
  for (const slot of slots) {
    if (!byDate.has(slot.date)) byDate.set(slot.date, [])
    byDate.get(slot.date)!.push(slot)
  }

  for (const [, daySlots] of byDate) {
    if (daySlots.length <= 1) continue

    for (let i = 1; i < daySlots.length; i++) {
      if (daySlots[i].subjectName && daySlots[i].subjectName === daySlots[i - 1].subjectName) {
        for (let j = i + 1; j < daySlots.length; j++) {
          if (daySlots[j].subjectName !== daySlots[i].subjectName) {
            const temp = daySlots[i]
            daySlots[i] = daySlots[j]
            daySlots[j] = temp
            break
          }
        }
      }
    }
  }

  const result: ScheduleSlot[] = []
  for (const [, daySlots] of byDate) {
    result.push(...daySlots)
  }
  return result
}

export function getConflictingTasks(tasks: Task[], dailyStart: string, dailyEnd: string, offDays: number[]): Task[] {
  const [startH, startM] = dailyStart.split(':').map(Number)
  const [endH, endM] = dailyEnd.split(':').map(Number)
  const dailyMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  const availableDailyMin = Math.floor(dailyMinutes * 0.8)

  const conflicts: Task[] = []
  const pending = tasks.filter(t => t.status !== 'completed' && t.deadline)

  for (const task of pending) {
    if (!task.deadline) continue
    const daysLeft = differenceInDays(new Date(task.deadline), new Date())
    if (daysLeft < 0) {
      conflicts.push(task)
      continue
    }

    const workingDays = Math.max(1, daysLeft - Math.floor(daysLeft / 7) * offDays.length)
    const totalCapacity = workingDays * availableDailyMin
    const totalWorkload = tasks
      .filter(t => t.status !== 'completed' && t.deadline && task.deadline && !isBefore(new Date(task.deadline), new Date(t.deadline!)))
      .reduce((sum, t) => sum + t.estimatedMinutes, 0)

    if (totalWorkload > totalCapacity && task === pending[pending.length - 1]) {
      conflicts.push(task)
    }
  }

  return conflicts
}
