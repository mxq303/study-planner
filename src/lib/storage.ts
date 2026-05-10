import Dexie, { type Table } from 'dexie'
import type { Subject, Task, PomodoroSession, ReviewReminder, UserPreference } from '@/types'

class StudyPlannerDB extends Dexie {
  subjects!: Table<Subject, string>
  tasks!: Table<Task, string>
  pomodoroSessions!: Table<PomodoroSession, string>
  reviewReminders!: Table<ReviewReminder, string>
  userPreferences!: Table<UserPreference, string>

  constructor() {
    super('StudyPlannerDB')
    this.version(1).stores({
      subjects: 'id, name, sortOrder, isPreset',
      tasks: 'id, subjectId, status, scheduledDate, deadline, priority, createdAt',
      pomodoroSessions: 'id, taskId, createdAt, mode',
      reviewReminders: 'id, taskId, reviewDate, isCompleted, stage',
      userPreferences: 'id',
    })
    this.version(2).stores({
      tasks: 'id, subjectId, status, scheduledDate, deadline, priority, createdAt, sortOrder',
    })
  }
}

export const db = new StudyPlannerDB()
