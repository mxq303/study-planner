'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer, Flame } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { WhiteNoise } from '@/components/pomodoro/WhiteNoise'
import { useI18n } from '@/lib/i18n'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useTaskStore } from '@/stores/taskStore'
import type { SessionMode } from '@/types'

const PRESETS = [25, 30, 45, 50]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PomodoroPage() {
  const { t } = useI18n()

  const {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    tick,
    completeSession,
    resetTimer,
    getTodaySessions,
    getTodayTotalMinutes,
    loadSessions,
  } = usePomodoroStore()
  const { tasks, loadTasks } = useTaskStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
    loadTasks()
  }, [loadSessions, loadTasks])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        const completed = tick()
        if (completed) {
          clearTimer()
          toast.success(
            timer.mode === 'focus' ? t.pomodoro.focusComplete : t.pomodoro.breakComplete
          )
          completeSession()
        }
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [timer.isRunning, tick, clearTimer, completeSession, timer.mode, t.pomodoro.focusComplete, t.pomodoro.breakComplete])

  const progress = timer.totalSeconds > 0
    ? ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100
    : 0

  const strokeColor = timer.mode === 'focus' ? '#6366f1' : '#22c55e'
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseTimer()
    } else if (timer.secondsLeft > 0) {
      resumeTimer()
    } else {
      const config = usePreferenceStore.getState().getPomodoroConfig()
      const isFocus = timer.mode === 'focus'
      const duration = isFocus ? config.focusMinutes : config.breakMinutes
      startTimer(selectedTaskId, duration, timer.mode as SessionMode)
    }
  }

  const handleModeSwitch = (mode: SessionMode) => {
    clearTimer()
    const config = usePreferenceStore.getState().getPomodoroConfig()
    const duration = mode === 'focus' ? config.focusMinutes : config.breakMinutes
    usePomodoroStore.setState({
      timer: {
        isRunning: false,
        mode,
        currentRound: timer.currentRound,
        totalRounds: 4,
        secondsLeft: duration * 60,
        totalSeconds: duration * 60,
        taskId: selectedTaskId,
        sessionId: null,
      },
    })
  }

  const handlePreset = (min: number) => {
    clearTimer()
    usePomodoroStore.setState({
      timer: {
        ...timer,
        isRunning: false,
        secondsLeft: min * 60,
        totalSeconds: min * 60,
        sessionId: null,
      },
    })
  }

  const todaySessions = getTodaySessions()
  const todayCompleted = todaySessions.filter(s => s.isCompleted).length
  const todayMinutes = getTodayTotalMinutes()
  const pendingTasks = tasks.filter(t => t.status !== 'completed')

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <h1 className="text-lg font-bold text-text">{t.pomodoro.title}</h1>

      {/* Timer display */}
      <Card className="flex flex-col items-center py-8">
        {/* Mode toggle */}
        <div className="inline-flex items-center gap-1 px-1 py-0.5 rounded-full bg-hover mb-6 animate-scale-in">
          <button
            onClick={() => handleModeSwitch('focus')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              timer.mode === 'focus'
                ? 'bg-primary text-white shadow-lg'
                : 'text-text-muted'
            }`}
          >
            {t.pomodoro.focus}
          </button>
          <button
            onClick={() => handleModeSwitch('break')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              timer.mode === 'break'
                ? 'bg-success text-white shadow-lg'
                : 'text-text-muted'
            }`}
          >
            {t.pomodoro.break}
          </button>
        </div>

        {/* Circular progress */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-48 h-48 rounded-full opacity-20 blur-3xl" style={{
            background: `radial-gradient(circle, ${timer.mode === 'focus' ? '#6366f1' : '#22c55e'} 0%, transparent 70%)`
          }} />
          <svg viewBox="0 0 280 280" className="w-[280px] max-w-full h-auto -rotate-90" style={{ filter: `drop-shadow(0 0 10px ${timer.mode === 'focus' ? 'rgba(99,102,241,0.4)' : 'rgba(34,197,94,0.4)'})` }}>
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="10"
              className="animate-pulse-ring"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="animate-progress"
              style={{ '--progress-full': circumference, '--progress-current': strokeDashoffset } as React.CSSProperties}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold tabular-nums tracking-tight text-text animate-bounce-gentle" style={{ textShadow: '0 2px 10px rgba(99,102,241,0.3)' }}>
              {formatTime(timer.secondsLeft)}
            </span>
            <span className="text-sm text-text-muted mt-1">
              {t.pomodoro.round} {timer.currentRound}/{timer.totalRounds}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { clearTimer(); resetTimer() }}
            className="p-3 rounded-full bg-surface hover:bg-hover transition"
          >
            <RotateCcw className="w-5 h-5 text-text-muted" />
          </button>
          <button
            onClick={handleStartPause}
            className="p-5 rounded-full bg-primary text-white hover:bg-primary-dark transition shadow-lg shadow-primary/30"
          >
            {timer.isRunning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-0.5" />
            )}
          </button>
          <div className="w-10" />
        </div>
      </Card>

      {/* Task selector */}
      <Card>
        <label className="block text-sm font-medium text-text mb-2">{t.pomodoro.selectTask}</label>
        <select
          value={selectedTaskId || ''}
          onChange={e => setSelectedTaskId(e.target.value || null)}
          className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text"
        >
          <option value="">{t.pomodoro.noTask}</option>
          {pendingTasks.map(task => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
      </Card>

      {/* Quick presets */}
      <div className="flex gap-2">
        {PRESETS.map(min => (
          <button
            key={min}
            onClick={() => handlePreset(min)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition card-hover ${
              timer.totalSeconds === min * 60 && !timer.isRunning
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-text-muted hover:border-primary'
            }`}
          >
            {min}min
          </button>
        ))}
      </div>

      {/* White Noise */}
      <div className="flex justify-center">
        <WhiteNoise />
      </div>

      {/* Today's stats */}
      <Card className="card-hover">
        <h3 className="text-sm font-medium text-text mb-3">{t.pomodoro.todayStats}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{todayCompleted}</p>
              <p className="text-xs text-text-muted">{t.pomodoro.completed}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{todayMinutes}</p>
              <p className="text-xs text-text-muted">{t.pomodoro.totalFocus}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
