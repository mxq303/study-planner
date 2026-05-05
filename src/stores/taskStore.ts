import { create } from 'zustand'
import { db } from '@/lib/storage'
import type { Task, AITaskSuggestion } from '@/types'
import { generateId } from '@/lib/utils'
import { generateReviewReminders } from '@/lib/ebbinghaus'

interface TaskStore {
  tasks: Task[]
  isLoading: boolean
  loadTasks: () => Promise<void>
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isAiDecomposed'>) => Promise<string>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  getTaskById: (id: string) => Task | undefined
  getSubtasks: (parentId: string) => Task[]
  getPendingTasks: () => Task[]
  getTodayTasks: () => Task[]
  addSubtasks: (parentId: string, suggestions: AITaskSuggestion[], subjectId?: string) => Promise<string[]>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: true,

  loadTasks: async () => {
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks, isLoading: false })
  },

  addTask: async (data) => {
    const id = generateId()
    const now = new Date().toISOString()
    const task: Task = {
      ...data,
      id,
      status: 'pending',
      isAiDecomposed: false,
      createdAt: now,
      updatedAt: now,
    }
    await db.tasks.add(task)
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks })
    return id
  },

  updateTask: async (id, data) => {
    const updated = { ...data, updatedAt: new Date().toISOString() }
    await db.tasks.update(id, updated)
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks })
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    await db.tasks.where('parentTaskId').equals(id).delete()
    await db.pomodoroSessions.where('taskId').equals(id).delete()
    await db.reviewReminders.where('taskId').equals(id).delete()
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks })
  },

  completeTask: async (id) => {
    const now = new Date().toISOString()
    const task = get().tasks.find(t => t.id === id)
    if (!task) return

    await db.tasks.update(id, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    })

    const subIds = get().tasks
      .filter(t => t.parentTaskId === id)
      .map(t => t.id)
    for (const sid of subIds) {
      await db.tasks.update(sid, { status: 'completed', completedAt: now, updatedAt: now })
    }

    const reminders = generateReviewReminders(id, now)
    for (const r of reminders) {
      await db.reviewReminders.add(r)
    }

    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks })
  },

  getTaskById: (id) => get().tasks.find(t => t.id === id),

  getSubtasks: (parentId) => get().tasks.filter(t => t.parentTaskId === parentId),

  getPendingTasks: () => get().tasks.filter(t => t.status !== 'completed'),

  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().tasks.filter(t => t.scheduledDate?.startsWith(today) || false)
  },

  addSubtasks: async (parentId, suggestions, subjectId) => {
    const now = new Date().toISOString()
    const ids: string[] = []

    const subtasks: Task[] = suggestions.map((s) => {
      const id = generateId()
      ids.push(id)
      return {
        id,
        subjectId,
        parentTaskId: parentId,
        title: s.subtaskTitle,
        priority: 3,
        estimatedMinutes: s.estimatedMinutes,
        status: 'pending' as const,
        isAiDecomposed: true,
        createdAt: now,
        updatedAt: now,
      }
    })

    await db.tasks.bulkAdd(subtasks)
    await db.tasks.update(parentId, { isAiDecomposed: true, updatedAt: now })
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks })
    return ids
  },
}))
