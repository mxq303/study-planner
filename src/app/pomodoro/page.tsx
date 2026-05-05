'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer, Flame } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
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
            timer.mode === 'focus' ? '专注时间结束！休息一下吧 🎉' : '休息时间结束，继续加油！💪'
          )
          completeSession()
        }
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [timer.isRunning, tick, clearTimer, completeSession, timer.mode])

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
    // Manually reset and start new session
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
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">番茄钟</h1>

      {/* Timer display */}
      <Card className="flex flex-col items-center py-8">
        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-6">
          <button
            onClick={() => handleModeSwitch('focus')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              timer.mode === 'focus'
                ? 'bg-primary text-white'
                : 'text-text-muted'
            }`}
          >
            专注
          </button>
          <button
            onClick={() => handleModeSwitch('break')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              timer.mode === 'break'
                ? 'bg-success text-white'
                : 'text-text-muted'
            }`}
          >
            休息
          </button>
        </div>

        {/* Circular progress */}
        <div className="relative flex items-center justify-center mb-6">
          <svg width="280" height="280" className="-rotate-90">
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
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
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold tabular-nums tracking-tight">
              {formatTime(timer.secondsLeft)}
            </span>
            <span className="text-sm text-text-muted mt-1">
              第 {timer.currentRound}/{timer.totalRounds} 轮
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { clearTimer(); resetTimer() }}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
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
        <label className="block text-sm font-medium mb-2">关联任务</label>
        <select
          value={selectedTaskId || ''}
          onChange={e => setSelectedTaskId(e.target.value || null)}
          className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-white"
        >
          <option value="">不关联任务</option>
          {pendingTasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </Card>

      {/* Quick presets */}
      <div className="flex gap-2">
        {PRESETS.map(min => (
          <button
            key={min}
            onClick={() => handlePreset(min)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${
              timer.totalSeconds === min * 60 && !timer.isRunning
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-text-muted hover:border-primary'
            }`}
          >
            {min}min
          </button>
        ))}
      </div>

      {/* Today's stats */}
      <Card>
        <h3 className="text-sm font-medium mb-3">今日统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{todayCompleted}</p>
              <p className="text-xs text-text-muted">完成番茄钟</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold">{todayMinutes}</p>
              <p className="text-xs text-text-muted">专注分钟</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
