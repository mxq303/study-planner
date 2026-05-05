'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, Circle, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn, getTimeString, getStatusLabel } from '@/lib/utils'
import type { TaskStatus } from '@/types'

const STATUS_TABS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
]

export default function TasksPage() {
  const { tasks, loadTasks, completeTask } = useTaskStore()
  const { subjects, loadSubjects } = useSubjectStore()
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')

  useEffect(() => {
    loadTasks()
    loadSubjects()
  }, [loadTasks, loadSubjects])

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks
    return tasks.filter(t => t.status === activeTab)
  }, [tasks, activeTab])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {
      in_progress: [],
      pending: [],
      completed: [],
    }
    for (const t of filteredTasks) {
      groups[t.status]?.push(t)
    }
    return groups
  }, [filteredTasks])

  const getSubjectById = (id?: string) => subjects.find(s => s.id === id)

  return (
    <div className="pb-4">
      <PageHeader
        title="任务管理"
        action={
          <Link
            href="/tasks/new"
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </Link>
        }
      />

      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border mb-4 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            )}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
                ({tasks.filter(t => tab.key === 'all' ? true : t.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title="暂无任务"
          description={activeTab === 'all' ? '点击右上角的 + 按钮添加第一个学习任务' : '该状态下没有任务'}
          action={
            activeTab === 'all' ? (
              <Link
                href="/tasks/new"
                className="inline-flex items-center gap-1 text-xs text-white bg-primary px-4 py-2 rounded-full font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> 添加任务
              </Link>
            ) : undefined
          }
        />
      ) : activeTab === 'all' ? (
        <div className="space-y-4">
          {(['in_progress', 'pending', 'completed'] as TaskStatus[]).map(status => {
            const list = groupedTasks[status]
            if (!list?.length) return null
            return (
              <div key={status}>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
                  {getStatusLabel(status)}
                  <span className="ml-1 font-normal normal-case">({list.length})</span>
                </h3>
                <div className="space-y-2">
                  {list.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      subject={getSubjectById(task.subjectId)}
                      onComplete={() => completeTask(task.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              subject={getSubjectById(task.subjectId)}
              onComplete={() => completeTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  subject,
  onComplete,
}: {
  task: import('@/types').Task
  subject?: import('@/types').Subject
  onComplete: () => void
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block"
    >
      <Card className="active:scale-[0.98] transition-transform hover:shadow-md">
        <div className="flex items-start gap-3">
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
          ) : (
            <button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                onComplete()
              }}
              className="text-text-muted hover:text-success transition-colors mt-0.5 flex-shrink-0"
            >
              <Circle className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {subject && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
              )}
              {subject && (
                <span className="text-xs text-text-muted">{subject.name}</span>
              )}
              <PriorityBadge priority={task.priority} />
            </div>
            <p className={cn(
              'text-sm font-medium mt-1',
              task.status === 'completed' && 'line-through text-text-muted'
            )}>
              {task.title}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getTimeString(task.estimatedMinutes)}
              </span>
              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {format(new Date(task.deadline), 'M/d')}
                </span>
              )}
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px]',
                task.status === 'completed' ? 'bg-success/10 text-success' :
                task.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                'bg-gray-100 text-gray-600'
              )}>
                {getStatusLabel(task.status)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
