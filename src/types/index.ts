export type StorageMode = 'local' | 'cloud'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type PomodoroMode = 'fixed' | 'adaptive'
export type SessionMode = 'focus' | 'break'

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  sortOrder: number
  isPreset: boolean
  createdAt: string
}

export interface Task {
  id: string
  subjectId?: string
  parentTaskId?: string
  title: string
  description?: string
  priority: number
  estimatedMinutes: number
  deadline?: string
  scheduledDate?: string
  scheduledStart?: string
  status: TaskStatus
  isAiDecomposed: boolean
  aiSuggestions?: AITaskSuggestion[]
  actualMinutes?: number
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AITaskSuggestion {
  subtaskTitle: string
  estimatedMinutes: number
  suggestedPomodoros: number
  strategy: string
}

export interface PomodoroSession {
  id: string
  taskId?: string
  mode: SessionMode
  durationMinutes: number
  startedAt: string
  endedAt?: string
  isCompleted: boolean
  createdAt: string
}

export interface ReviewReminder {
  id: string
  taskId: string
  stage: number
  reviewDate: string
  isCompleted: boolean
  completedAt?: string
  createdAt: string
}

export interface UserPreference {
  id: string
  pomodoroMode: PomodoroMode
  pomodoroFocusMinutes: number
  pomodoroBreakMinutes: number
  pomodoroLongBreakMinutes: number
  pomodoroLongBreakInterval: number
  dailyStudyStart: string
  dailyStudyEnd: string
  weeklyOffDays: number[]
  theme: string
  language: string
  weeklyGoalMinutes: number
  notificationEnabled: boolean
  notificationTime: string
  soundEnabled: boolean
  accentColor: string
  onboardingCompleted: boolean
  cardStyle: string
  uiDensity: string
  fontSizeScale: string
}

export interface ScheduleSlot {
  date: string
  startTime: string
  endTime: string
  taskId: string
  taskTitle: string
  subjectName?: string
  subjectColor?: string
}

export interface DailyStats {
  date: string
  totalMinutes: number
  completedTasks: number
  pomodoroCount: number
  subjects: Record<string, number>
}

export interface WeeklyStats {
  weekStart: string
  days: DailyStats[]
  totalMinutes: number
  totalTasks: number
  topSubject: string
}

export const PRESET_SUBJECTS: Omit<Subject, 'id' | 'createdAt'>[] = [
  { name: '语文', color: '#ef4444', icon: 'book-open', sortOrder: 0, isPreset: true },
  { name: '数学', color: '#3b82f6', icon: 'sigma', sortOrder: 1, isPreset: true },
  { name: '英语', color: '#22c55e', icon: 'languages', sortOrder: 2, isPreset: true },
  { name: '物理', color: '#f59e0b', icon: 'atom', sortOrder: 3, isPreset: true },
  { name: '化学', color: '#8b5cf6', icon: 'flask-conical', sortOrder: 4, isPreset: true },
  { name: '生物', color: '#10b981', icon: 'leaf', sortOrder: 5, isPreset: true },
  { name: '政治', color: '#ec4899', icon: 'landmark', sortOrder: 6, isPreset: true },
  { name: '历史', color: '#f97316', icon: 'scroll', sortOrder: 7, isPreset: true },
  { name: '地理', color: '#06b6d4', icon: 'globe', sortOrder: 8, isPreset: true },
]

export const DIFFICULTY_POMODORO_MAP: Record<string, { focus: number; break: number }> = {
  '背诵/记忆': { focus: 30, break: 5 },
  '逻辑/理解': { focus: 45, break: 10 },
  '复习/做题': { focus: 25, break: 5 },
  '写作/创作': { focus: 50, break: 10 },
}

export const EBBINGHAUS_STAGES = [
  { stage: 1, daysAfter: 0, label: '当天巩固' },
  { stage: 2, daysAfter: 1, label: '1天后' },
  { stage: 3, daysAfter: 2, label: '2天后' },
  { stage: 4, daysAfter: 4, label: '4天后' },
  { stage: 5, daysAfter: 7, label: '7天后' },
  { stage: 6, daysAfter: 15, label: '15天后' },
  { stage: 7, daysAfter: 30, label: '30天后' },
]
