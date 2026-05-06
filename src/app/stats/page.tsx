'use client'

import { useEffect, useState } from 'react'
import { Flame, CheckCircle, Timer, Zap } from 'lucide-react'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
  differenceInDays,
  startOfDay,
  subDays,
} from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Heatmap } from '@/components/stats/Heatmap'
import { SubjectBar } from '@/components/stats/SubjectBar'
import { useI18n } from '@/lib/i18n'
import { useTaskStore } from '@/stores/taskStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { useSubjectStore } from '@/stores/subjectStore'

type TimeRange = 'week' | 'month' | 'all'

export default function StatsPage() {
  const { t } = useI18n()
  const { tasks, loadTasks } = useTaskStore()
  const { sessions, loadSessions } = usePomodoroStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const [range, setRange] = useState<TimeRange>('week')

  useEffect(() => {
    loadTasks()
    loadSessions()
    loadSubjects()
  }, [loadTasks, loadSessions, loadSubjects])

  const now = new Date()
  const today = startOfDay(now)

  let filterDate: Date
  if (range === 'week') filterDate = startOfWeek(now, { weekStartsOn: 1 })
  else if (range === 'month') filterDate = startOfMonth(now)
  else filterDate = new Date(0)

  const filteredSessions = sessions.filter(s => {
    return s.isCompleted && new Date(s.startedAt) >= filterDate
  })

  const filteredTasks = tasks.filter(t => {
    if (t.status !== 'completed') return false
    if (range === 'all') return true
    return t.completedAt && new Date(t.completedAt) >= filterDate
  })

  const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const pomodoroCount = filteredSessions.length
  const tasksCompleted = filteredTasks.length

  let streak = 0
  let checkDate = today
  const studyDates = new Set<string>()
  sessions
    .filter(s => s.isCompleted)
    .forEach(s => studyDates.add(format(startOfDay(parseISO(s.startedAt)), 'yyyy-MM-dd')))

  for (let i = 0; i < 365; i++) {
    const d = format(checkDate, 'yyyy-MM-dd')
    if (studyDates.has(d)) {
      streak++
      checkDate = subDays(checkDate, 1)
    } else {
      break
    }
  }

  // Heatmap data (this week)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const heatmapData: Record<string, number> = {}
  weekDays.forEach(d => {
    const key = format(d, 'yyyy-MM-dd')
    heatmapData[key] = sessions
      .filter(s => {
        if (!s.isCompleted) return false
        return isSameDay(startOfDay(parseISO(s.startedAt)), d)
      })
      .reduce((sum, s) => sum + s.durationMinutes, 0)
  })

  // Subject distribution
  const subjectMinutes: Record<string, { name: string; minutes: number; color: string }> = {}
  sessions
    .filter(s => s.isCompleted && s.taskId && s.mode === 'focus')
    .forEach(s => {
      const task = tasks.find(t => t.id === s.taskId)
      if (!task?.subjectId) return
      const subject = subjects.find(sub => sub.id === task.subjectId)
      if (!subject) return
      const key = subject.id
      if (!subjectMinutes[key]) {
        subjectMinutes[key] = { name: subject.name, minutes: 0, color: subject.color }
      }
      subjectMinutes[key].minutes += s.durationMinutes
    })

  const subjectData = Object.values(subjectMinutes).sort((a, b) => b.minutes - a.minutes)
  const maxSubjectMinutes = Math.max(...subjectData.map(s => s.minutes), 1)

  // Daily average
  let dayCount = 1
  if (range === 'week') dayCount = 7
  else if (range === 'month') dayCount = differenceInDays(now, filterDate) + 1
  else {
    const firstSession = sessions.filter(s => s.isCompleted).sort((a, b) =>
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )[0]
    if (firstSession) {
      dayCount = differenceInDays(now, startOfDay(parseISO(firstSession.startedAt))) + 1
    }
  }
  const avgMinutes = Math.round(totalMinutes / Math.max(dayCount, 1))

  const dayLabelKeys = [
    t.stats.monday,
    t.stats.tuesday,
    t.stats.wednesday,
    t.stats.thursday,
    t.stats.friday,
    t.stats.saturday,
    t.stats.sunday,
  ]

  const rangeLabels: Record<TimeRange, string> = {
    week: t.stats.thisWeek,
    month: t.stats.thisMonth,
    all: t.stats.allTime,
  }

  return (
    <div className="animate-fade-in">
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold text-text">{t.stats.title}</h1>

      {/* Time range selector */}
      <div className="flex gap-1 bg-surface rounded-full p-1">
        {([
          { key: 'week' as const, label: t.stats.thisWeek },
          { key: 'month' as const, label: t.stats.thisMonth },
          { key: 'all' as const, label: t.stats.allTime },
        ]).map(item => (
          <button
            key={item.key}
            onClick={() => setRange(item.key)}
            className={`flex-1 py-1.5 rounded-full text-sm font-medium transition ${
              range === item.key ? 'card-bg text-text shadow-sm' : 'text-text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Stats summary grid - responsive: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="flex items-center gap-3 animate-bounce-gentle stagger-1 card-hover p-3 sm:p-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-text truncate">{totalHours}h</p>
            <p className="text-[11px] sm:text-xs text-text-muted">{t.stats.totalHours}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 animate-bounce-gentle stagger-2 card-hover p-3 sm:p-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-text truncate">{tasksCompleted}</p>
            <p className="text-[11px] sm:text-xs text-text-muted">{t.stats.tasksCompleted}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 animate-bounce-gentle stagger-3 card-hover p-3 sm:p-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-text truncate">{pomodoroCount}</p>
            <p className="text-[11px] sm:text-xs text-text-muted">{t.stats.pomodoroCount}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 animate-bounce-gentle stagger-4 card-hover p-3 sm:p-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-text truncate">{streak}{t.stats.day}</p>
            <p className="text-[11px] sm:text-xs text-text-muted">{t.stats.currentStreak}</p>
          </div>
        </Card>
      </div>

      {/* Weekly heatmap */}
      <Card className="animate-fade-in">
        <h3 className="text-sm font-medium text-text mb-3">{t.stats.heatmap}</h3>
        <Heatmap data={heatmapData} dayLabels={dayLabelKeys} />
      </Card>

      {/* Subject distribution */}
      <Card className="animate-fade-in">
        <h3 className="text-sm font-medium text-text mb-3">{t.stats.subjectDistribution}</h3>
        {subjectData.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">{t.common.noData}</p>
        ) : (
          <SubjectBar data={subjectData} maxMinutes={maxSubjectMinutes} />
        )}
      </Card>

      {/* Daily average */}
      <Card>
        <h3 className="text-sm font-medium text-text mb-3">{t.stats.dailyAverage}</h3>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-primary">{avgMinutes}</span>
          <span className="text-sm text-text-muted pb-1">{t.stats.dailyAverage}</span>
        </div>
        <p className="text-xs text-text-muted mt-1">
          {rangeLabels[range]}
        </p>
      </Card>
    </div>
    </div>
  )
}
