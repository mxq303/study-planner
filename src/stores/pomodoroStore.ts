import { create } from 'zustand'
import { db } from '@/lib/storage'
import type { PomodoroSession, SessionMode } from '@/types'
import { generateId } from '@/lib/utils'

interface TimerState {
  isRunning: boolean
  mode: SessionMode
  currentRound: number
  totalRounds: number
  secondsLeft: number
  totalSeconds: number
  taskId: string | null
  sessionId: string | null
}

interface PomodoroStore {
  sessions: PomodoroSession[]
  timer: TimerState
  loadSessions: () => Promise<void>
  startTimer: (taskId: string | null, durationMinutes: number, mode: SessionMode) => void
  pauseTimer: () => void
  resumeTimer: () => void
  tick: () => boolean
  completeSession: () => Promise<void>
  resetTimer: () => void
  getTodaySessions: () => PomodoroSession[]
  getTodayTotalMinutes: () => number
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  sessions: [],
  timer: {
    isRunning: false,
    mode: 'focus',
    currentRound: 1,
    totalRounds: 4,
    secondsLeft: 25 * 60,
    totalSeconds: 25 * 60,
    taskId: null,
    sessionId: null,
  },

  loadSessions: async () => {
    const sessions = await db.pomodoroSessions.orderBy('createdAt').reverse().toArray()
    set({ sessions })
  },

  startTimer: (taskId, durationMinutes, mode) => {
    const id = generateId()
    const timer: TimerState = {
      isRunning: true,
      mode,
      currentRound: get().timer.currentRound,
      totalRounds: 4,
      secondsLeft: durationMinutes * 60,
      totalSeconds: durationMinutes * 60,
      taskId,
      sessionId: id,
    }
    set({ timer })

    db.pomodoroSessions.add({
      id,
      taskId: taskId || undefined,
      mode,
      durationMinutes,
      startedAt: new Date().toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    })
  },

  pauseTimer: () => {
    set(state => ({ timer: { ...state.timer, isRunning: false } }))
  },

  resumeTimer: () => {
    set(state => ({ timer: { ...state.timer, isRunning: true } }))
  },

  tick: () => {
    const { timer } = get()
    if (!timer.isRunning) return false

    const newSeconds = timer.secondsLeft - 1
    if (newSeconds <= 0) {
      set({ timer: { ...timer, secondsLeft: 0, isRunning: false } })
      return true
    }
    set({ timer: { ...timer, secondsLeft: newSeconds } })
    return false
  },

  completeSession: async () => {
    const { timer } = get()
    const now = new Date().toISOString()

    if (timer.sessionId) {
      await db.pomodoroSessions.update(timer.sessionId, {
        endedAt: now,
        isCompleted: true,
      })
    }

    const sessions = await db.pomodoroSessions.orderBy('createdAt').reverse().toArray()
    set({
      sessions,
      timer: {
        ...timer,
        isRunning: false,
        currentRound: timer.currentRound + 1,
        secondsLeft: 0,
      },
    })
  },

  resetTimer: () => {
    set({
      timer: {
        isRunning: false,
        mode: 'focus',
        currentRound: 1,
        totalRounds: 4,
        secondsLeft: 25 * 60,
        totalSeconds: 25 * 60,
        taskId: null,
        sessionId: null,
      },
    })
  },

  getTodaySessions: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().sessions.filter(s => s.createdAt.startsWith(today))
  },

  getTodayTotalMinutes: () => {
    const todaySessions = get().getTodaySessions()
    return todaySessions
      .filter(s => s.isCompleted)
      .reduce((sum, s) => sum + s.durationMinutes, 0)
  },
}))
