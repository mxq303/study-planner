'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Sunrise, Sun, Moon, BookOpen, Clock, CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getTimeString } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export default function DashboardPage() {
  const { t } = useI18n()
  const { tasks, completeTask, loadTasks } = useTaskStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const { sessions, loadSessions } = usePomodoroStore()

  useEffect(() => {
    loadTasks()
    loadSubjects()
    loadSessions()
  }, [loadTasks, loadSubjects, loadSessions])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 6) return { text: t.home.greeting.evening, icon: Moon }
    if (h < 12) return { text: t.home.greeting.morning, icon: Sunrise }
    if (h < 18) return { text: t.home.greeting.afternoon, icon: Sun }
    return { text: t.home.greeting.evening, icon: Moon }
  }, [t])

  const GreetingIcon = greeting.icon
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const todayTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'completed' && t.scheduledDate?.startsWith(todayStr)),
    [tasks, todayStr]
  )

  const pendingTasks = useMemo(() =>
    tasks
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }),
    [tasks]
  )

  const todaySessions = useMemo(() =>
    sessions.filter(s => s.createdAt.startsWith(todayStr)),
    [sessions, todayStr]
  )
  const todayPomodoros = todaySessions.filter(s => s.isCompleted && s.mode === 'focus').length
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  const getSubjectById = (id?: string) => subjects.find(s => s.id === id)

  return (
    <div className="pb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-text-muted">
            <GreetingIcon className="w-5 h-5" />
            <span className="text-sm">{greeting.text}</span>
          </div>
          <h1 className="text-2xl font-bold text-text mt-1">
            {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
          </h1>
        </div>
        <Link
          href="/tasks/new"
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform animate-bounce-gentle"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <Card className="card-bg mb-4 card-hover">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {t.home.todayPlan}
          </h2>
          <Link href="/calendar" className="text-xs text-text-muted hover:text-primary flex items-center gap-1">
            {t.home.viewCalendar} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {todayTasks.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-primary" />}
            title={t.home.noPlanToday}
            description={t.home.noPlanHint}
            action={
              <Link
                href="/tasks/new"
                className="inline-flex items-center gap-1 text-xs text-white bg-primary px-4 py-2 rounded-full font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> {t.home.addTask}
              </Link>
            }
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map((task, i) => {
              const subj = getSubjectById(task.subjectId)
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors active:scale-[0.98] stagger-${i + 1}`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subj?.color || '#94a3b8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-muted">
                      {task.scheduledStart ? `${task.scheduledStart} - ${getTimeString(task.estimatedMinutes)}` : getTimeString(task.estimatedMinutes)}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="card-bg mb-4 card-hover">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t.home.pendingTasks}
          </h2>
          <Link href="/tasks" className="text-xs text-text-muted hover:text-primary flex items-center gap-1">
            {t.home.allTasks} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {pendingTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 text-success" />}
            title={t.home.allDone}
            description={t.home.keepUp}
            className="py-6"
          />
        ) : (
          <div className="space-y-1">
            {pendingTasks.slice(0, 6).map((task, i) => {
              const subj = getSubjectById(task.subjectId)
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-hover transition-colors group active:scale-[0.98] stagger-${i + 1}`}
                >
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      await completeTask(task.id)
                    }}
                    className="flex-shrink-0 text-text-muted hover:text-success transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subj?.color || '#94a3b8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-muted">
                      {task.deadline ? `${t.home.dueDate}: ${format(new Date(task.deadline), 'M/d')}` : t.home.noDeadline}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="card-bg card-hover">
        <h2 className="text-base font-semibold text-text flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          {t.home.todayStudy}
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex-1 text-center p-3 rounded-xl bg-surface">
            <p className="text-2xl font-bold text-primary">{todayPomodoros}</p>
            <p className="text-xs text-text-muted mt-0.5">{t.home.pomodoros}</p>
          </div>
          <div className="flex-1 text-center p-3 rounded-xl bg-surface">
            <p className="text-2xl font-bold text-primary">{todayMinutes}</p>
            <p className="text-xs text-text-muted mt-0.5">{t.home.studyMinutes}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
