import { create } from 'zustand'
import { db } from '@/lib/storage'
import { PRESET_SUBJECTS, type Subject } from '@/types'
import { generateId } from '@/lib/utils'

interface SubjectStore {
  subjects: Subject[]
  isLoading: boolean
  loadSubjects: () => Promise<void>
  initPresetSubjects: () => Promise<void>
  addSubject: (data: Omit<Subject, 'id' | 'createdAt'>) => Promise<string>
  updateSubject: (id: string, data: Partial<Subject>) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  getSubjectById: (id: string) => Subject | undefined
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
  subjects: [],
  isLoading: true,

  loadSubjects: async () => {
    const subjects = await db.subjects.orderBy('sortOrder').toArray()
    set({ subjects, isLoading: false })
  },

  initPresetSubjects: async () => {
    const existing = await db.subjects.count()
    if (existing > 0) return

    const now = new Date().toISOString()
    const presets = PRESET_SUBJECTS.map(s => ({
      ...s,
      id: generateId(),
      createdAt: now,
    }))
    await db.subjects.bulkAdd(presets)
    set({ subjects: presets })
  },

  addSubject: async (data) => {
    const id = generateId()
    const subject: Subject = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    }
    await db.subjects.add(subject)
    const subjects = await db.subjects.orderBy('sortOrder').toArray()
    set({ subjects })
    return id
  },

  updateSubject: async (id, data) => {
    await db.subjects.update(id, data)
    const subjects = await db.subjects.orderBy('sortOrder').toArray()
    set({ subjects })
  },

  deleteSubject: async (id) => {
    await db.subjects.delete(id)
    const subjects = await db.subjects.orderBy('sortOrder').toArray()
    set({ subjects })
  },

  getSubjectById: (id) => get().subjects.find(s => s.id === id),
}))
