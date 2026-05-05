'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Wand2
} from 'lucide-react'
import {
  format, addWeeks, subWeeks, startOfWeek, endOfWeek,
  addDays, isToday, isBefore
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { generateSchedule } from '@/lib/schedule'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { ScheduleSlot } from '@/types'

export default function CalendarPage() {
  const { t } = useI18n()
  const { tasks, loadTasks, updateTask } = useTaskStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const { preferences, loadPreferences } = usePreferenceStore()

  const [slotsRef] = useAutoAnimate()

  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadTasks()
    loadSubjects()
    loadPreferences()
  }, [loadTasks, loadSubjects, loadPreferences])

  const weekStart = useMemo(() => startOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek])
  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 1 }), [currentWeek])

  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i))
    }
    return days
  }, [weekStart])

  const todaySlots = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return slots.filter(s => s.date === todayStr)
  }, [slots])

  const handleGenerate = async () => {
    if (!preferences) {
      toast.error('请先完成偏好设置')
      return
    }
    setGenerating(true)
    try {
      const result = generateSchedule({
        tasks,
        subjects,
        dailyStart: preferences.dailyStudyStart,
        dailyEnd: preferences.dailyStudyEnd,
        offDays: preferences.weeklyOffDays,
        startDate: new Date(),
      })
      setSlots(result)

      for (const slot of result) {
        if (slot.date === format(new Date(), 'yyyy-MM-dd')) {
          try {
            await updateTask(slot.taskId, {
              scheduledDate: slot.date,
              scheduledStart: slot.startTime,
            })
          } catch {}
        }
      }
      toast.success(`已生成 ${result.length} 个学习时段`)
    } catch {
      toast.error('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const getSlotsForDate = (date: Date): ScheduleSlot[] => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return slots.filter(s => s.date === dateKey)
  }

  const isOffDay = (date: Date): boolean => {
    if (!preferences) return false
    return preferences.weeklyOffDays.includes(date.getDay())
  }

  const pendingCount = tasks.filter(t => t.status !== 'completed').length

  return (
    <div className="animate-fade-in">
    <div className="pb-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-text">{t.schedule.title}</h1>
        </div>
        <p className="text-xs text-text-muted">
          {t.schedule.noScheduleHint}
        </p>
      </div>

      <Card className="card-bg p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-1.5 rounded-lg hover:bg-hover text-text-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-text">
            {format(weekStart, 'M月d日', { locale: zhCN })} - {format(weekEnd, 'd日', { locale: zhCN })}
          </span>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-1.5 rounded-lg hover:bg-hover text-text-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => (
            <div key={day} className="text-center text-[10px] text-text-muted font-medium py-1">
              {day}
            </div>
          ))}
          {weekDays.map(date => {
            const daySlots = getSlotsForDate(date)
            const off = isOffDay(date)
            const today = isToday(date)
            const past = isBefore(date, new Date()) && !today
            return (
              <button
                key={date.toISOString()}
                className={cn(
                  'relative rounded-lg p-1 text-center min-h-[52px] flex flex-col items-center transition-colors card-hover',
                  today && 'bg-primary/10 ring-1 ring-primary',
                  off && 'opacity-40',
                  past && !today && 'opacity-30',
                )}
              >
                <span className={cn(
                  'text-xs w-6 h-6 rounded-full flex items-center justify-center',
                  today && 'bg-primary text-white font-semibold',
                  !today && 'text-text',
                )}>
                  {format(date, 'd')}
                </span>
                {daySlots.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {daySlots.slice(0, 3).map(s => (
                      <span
                        key={s.taskId}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: s.subjectColor || '#6366f1' }}
                      />
                    ))}
                    {daySlots.length > 3 && (
                      <span className="text-[8px] text-text-muted">+{daySlots.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <button
        onClick={handleGenerate}
        disabled={generating || pendingCount === 0}
        className={cn(
          'w-full py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-4',
          generating
            ? 'bg-surface text-text-muted'
            : 'bg-primary text-white shadow-lg shadow-primary/30'
        )}
      >
        {generating ? (
          <>
            <Wand2 className="w-4 h-4 animate-pulse" /> {t.schedule.generate}...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" /> {t.schedule.generate}
          </>
        )}
      </button>

      <Card className="card-bg">
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          {t.home.todayPlan}
        </h3>
        {todaySlots.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-8 h-8 text-primary" />}
            title={t.schedule.noSchedule}
            description={t.schedule.noScheduleHint}
            className="py-6"
          />
        ) : (
          <div ref={slotsRef} className="space-y-2">
            {todaySlots
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot, i) => (
                <Link
                  key={i}
                  href={`/tasks/${slot.taskId}`}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors active:scale-[0.98] animate-slide-up stagger-${(i % 8) + 1}`}
                >
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: slot.subjectColor || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{slot.taskTitle}</p>
                    {slot.subjectName && (
                      <p className="text-xs text-text-muted">{slot.subjectName}</p>
                    )}
                  </div>
                  <div className="text-xs text-text-muted font-mono flex-shrink-0">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </Card>
    </div>
    </div>
  )
}
