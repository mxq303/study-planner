'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Sunrise, Sun, Moon, BookOpen, Clock, CheckCircle2, Flame,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { usePomodoroStore } from '@/stores/pomodoroStore'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ParticleBg } from '@/components/ui/ParticleBg'
import { StatCard } from '@/components/ui/StatCard'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getTimeString } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export default function DashboardPage() {
  const { t } = useI18n()
  const { tasks, completeTask, loadTasks } = useTaskStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const { sessions, loadSessions } = usePomodoroStore()

  const [todayPlanRef] = useAutoAnimate()
  const [pendingRef] = useAutoAnimate()

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
    <div className="pb-6 animate-fade-in space-y-5">
      <div
        className="relative overflow-hidden rounded-2xl p-6 animate-slide-up"
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 50%, #c084fc 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-6 right-16 w-20 h-20 rounded-full bg-white/5 blur-sm" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-6 w-16 h-16 rounded-full bg-white/5 blur-sm" />

        <div className="relative z-10 text-white flex flex-col gap-1">
          <div className="flex items-center gap-2 opacity-90">
            <GreetingIcon className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">{greeting.text}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {format(new Date(), 'M月d日 EEEE', { locale: zhCN })}
          </h1>
          <p className="text-xs opacity-70 mt-0.5">
            {todayTasks.length > 0
              ? `${t.home.todayPlan} · ${todayTasks.length} ${t.tasks.priorityLevels ? '项' : ''}`
              : t.home.noPlanToday}
          </p>
        </div>

        <Link
          href="/tasks/new"
          className="absolute bottom-5 right-5 z-10 flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 active:scale-95 transition-all shadow-lg text-sm font-medium group"
        >
          <span className="hidden sm:inline">{t.home.addTask}</span>
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </Link>

        <ParticleBg />
      </div>

      <Card className="card-bg card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {t.home.todayPlan}
          </h2>
          <Link href="/calendar" className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
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
                className="inline-flex items-center gap-1.5 text-xs text-white bg-primary px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="w-3.5 h-3.5" /> {t.home.addTask}
              </Link>
            }
            className="py-6"
          />
        ) : (
          <div ref={todayPlanRef} className="space-y-1">
            {todayTasks.slice(0, 5).map((task, i) => {
              const subj = getSubjectById(task.subjectId)
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-all active:scale-[0.98] stagger-${i + 1}`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                    style={{ backgroundColor: subj?.color || '#94a3b8', '--tw-ring-color': subj?.color || '#94a3b8' } as React.CSSProperties}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {task.scheduledStart ? `${task.scheduledStart} · ${getTimeString(task.estimatedMinutes)}` : getTimeString(task.estimatedMinutes)}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} label={t.tasks.priorityLevels[task.priority - 1]} />
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="card-bg card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t.home.pendingTasks}
          </h2>
          <Link href="/tasks" className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
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
          <div ref={pendingRef} className="space-y-0.5">
            {pendingTasks.slice(0, 6).map((task, i) => {
              const subj = getSubjectById(task.subjectId)
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-all group active:scale-[0.98] stagger-${i + 1}`}
                >
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      await completeTask(task.id)
                    }}
                    className="flex-shrink-0 text-text-muted hover:text-success transition-all hover:scale-110 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subj?.color || '#94a3b8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {task.deadline ? `${t.home.dueDate}: ${format(new Date(task.deadline), 'M/d')}` : t.home.noDeadline}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} label={t.tasks.priorityLevels[task.priority - 1]} />
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="card-bg card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t.home.todayStudy}
          </h2>
          <Link href="/stats" className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
            {t.home.allTasks} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label={t.home.pomodoros}
            value={todayPomodoros}
            className="bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-primary" />}
            label={t.home.studyMinutes}
            value={todayMinutes}
            className="bg-gradient-to-br from-primary/5 to-transparent"
          />
        </div>
      </Card>
    </div>
  )
}
