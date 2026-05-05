'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Trash2, ArrowLeft, Clock, Calendar, BookOpen,
  Play, CheckCircle2, Sparkles, Edit3, Save, X, AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { Modal } from '@/components/ui/Modal'
import { cn, getTimeString } from '@/lib/utils'
import type { TaskStatus } from '@/types'

const STATUS_STEPS: { status: TaskStatus; label: string; icon: typeof Play }[] = [
  { status: 'pending', label: '待开始', icon: Clock },
  { status: 'in_progress', label: '进行中', icon: Play },
  { status: 'completed', label: '已完成', icon: CheckCircle2 },
]

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { tasks, updateTask, deleteTask, completeTask } = useTaskStore()
  const { subjects } = useSubjectStore()

  const task = tasks.find(t => t.id === id)
  const subject = subjects.find(s => s.id === task?.subjectId)
  const subtasks = tasks.filter(t => t.parentTaskId === id)

  const [showDelete, setShowDelete] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editEstimated, setEditEstimated] = useState(0)
  const [saving, setSaving] = useState(false)

  const enterEdit = (field: string) => {
    if (!task) return
    if (field === 'title') setEditTitle(task.title)
    if (field === 'description') setEditDescription(task.description || '')
    if (field === 'estimated') setEditEstimated(task.estimatedMinutes)
    setEditingField(field)
  }

  if (!task) {
    return (
      <div className="pb-4">
        <EmptyState
          title="任务不存在"
          description="该任务可能已被删除"
          action={
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-xs text-white bg-primary px-4 py-2 rounded-full font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 返回
            </button>
          }
        />
      </div>
    )
  }

  const handleStatusChange = async (status: TaskStatus) => {
    if (status === 'completed') {
      await completeTask(task.id)
      toast.success('任务已完成')
      return
    }
    await updateTask(task.id, { status })
    toast.success(status === 'in_progress' ? '任务已开始' : '任务已重置')
  }

  const handleSaveEdit = async (field: string) => {
    setSaving(true)
    try {
      if (field === 'title') {
        await updateTask(task.id, { title: editTitle.trim() })
      } else if (field === 'description') {
        await updateTask(task.id, { description: editDescription.trim() || undefined })
      } else if (field === 'estimated') {
        await updateTask(task.id, { estimatedMinutes: editEstimated })
      }
      toast.success('已更新')
      setEditingField(null)
    } catch {
      toast.error('更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    toast.success('任务已删除')
    router.push('/tasks')
  }

  const handleDecompose = () => {
    router.push(`/tasks/${task.id}/decompose`)
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === task.status)

  return (
    <div className="pb-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-lg hover:bg-surface text-text-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-text">任务详情</h1>
        <button
          onClick={() => setShowDelete(true)}
          className="ml-auto p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          {subject && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
          )}
          <span className="text-xs text-text-muted">{subject?.name || '未指定科目'}</span>
          <PriorityBadge priority={task.priority} />
        </div>

        {editingField === 'title' ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 rounded-lg border border-primary bg-white text-base font-semibold text-text outline-none"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit('title'); if (e.key === 'Escape') setEditingField(null) }}
            />
            <button onClick={() => handleSaveEdit('title')} disabled={saving} className="p-1 text-primary"><Save className="w-4 h-4" /></button>
            <button onClick={() => setEditingField(null)} className="p-1 text-text-muted"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2 group">
            <h2 className="text-base font-semibold text-text">{task.title}</h2>
            <button
              onClick={() => enterEdit('title')}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-primary transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {editingField === 'description' ? (
          <div className="mb-3">
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-primary bg-white text-sm text-text outline-none resize-none"
              rows={3}
              autoFocus
              onKeyDown={e => { if (e.key === 'Escape') setEditingField(null) }}
            />
            <div className="flex justify-end gap-1 mt-1">
              <button onClick={() => handleSaveEdit('description')} disabled={saving} className="text-xs text-primary px-2 py-1">保存</button>
              <button onClick={() => setEditingField(null)} className="text-xs text-text-muted px-2 py-1">取消</button>
            </div>
          </div>
        ) : (
          <div className="mb-3 group">
            {task.description ? (
              <p className="text-sm text-text-muted leading-relaxed">{task.description}</p>
            ) : (
              <p className="text-sm text-text-muted/50 italic">暂无描述</p>
            )}
            <button
              onClick={() => enterEdit('description')}
              className="text-xs text-text-muted hover:text-primary mt-1 opacity-0 group-hover:opacity-100 transition-all"
            >
              编辑描述
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-text-muted mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {editingField === 'estimated' ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editEstimated}
                  onChange={e => setEditEstimated(Number(e.target.value) || 0)}
                  className="w-16 px-1 py-0.5 rounded border border-primary bg-white text-xs text-text outline-none text-center"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit('estimated'); if (e.key === 'Escape') setEditingField(null) }}
                />
                <button onClick={() => handleSaveEdit('estimated')} disabled={saving} className="text-primary"><Save className="w-3 h-3" /></button>
                <button onClick={() => setEditingField(null)} className="text-text-muted"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <span className="cursor-pointer hover:text-primary" onClick={() => enterEdit('estimated')}>
                {getTimeString(task.estimatedMinutes)}
              </span>
            )}
          </span>
          {task.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.deadline), 'yyyy-MM-dd')}
            </span>
          )}
          {task.scheduledDate && (
            <span className="flex items-center gap-1 text-primary">
              <BookOpen className="w-3.5 h-3.5" />
              {format(new Date(task.scheduledDate), 'M/d')} {task.scheduledStart || ''}
            </span>
          )}
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-text mb-3">任务状态</h3>
        <div className="flex items-center gap-2">
          {STATUS_STEPS.map((step, i) => {
            const isCurrent = i === currentStepIndex
            const isDone = i < currentStepIndex
            const Icon = step.icon
            return (
              <button
                key={step.status}
                onClick={() => handleStatusChange(step.status)}
                disabled={task.status === 'completed'}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-colors',
                  isCurrent && 'bg-primary text-white',
                  isDone && 'bg-success/10 text-success',
                  !isCurrent && !isDone && 'bg-bg text-text-muted hover:bg-border',
                  task.status === 'completed' && 'opacity-60'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{step.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {!task.isAiDecomposed && (
        <Card className="mb-4 border-dashed border-primary/30 bg-primary/[0.02]">
          <button
            onClick={handleDecompose}
            className="w-full flex items-center justify-center gap-2 py-1"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 智能拆解</span>
          </button>
          <p className="text-center text-xs text-text-muted mt-1">
            使用AI将任务拆解为可执行的子步骤
          </p>
        </Card>
      )}

      {subtasks.length > 0 && (
        <Card className="mb-4">
          <h3 className="text-sm font-semibold text-text mb-3">
            子任务 ({subtasks.length})
            {task.isAiDecomposed && (
              <span className="ml-1 text-xs text-primary font-normal">AI生成</span>
            )}
          </h3>
          <div className="space-y-2">
            {subtasks.map(sub => (
              <div
                key={sub.id}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-xl bg-bg',
                  sub.status === 'completed' && 'opacity-60'
                )}
              >
                <button
                  onClick={async () => {
                    if (sub.status === 'completed') {
                      await updateTask(sub.id, { status: 'pending' })
                    } else {
                      await updateTask(sub.id, { status: 'completed' })
                    }
                  }}
                  className={cn(
                    'flex-shrink-0',
                    sub.status === 'completed' ? 'text-success' : 'text-text-muted hover:text-success'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <span className={cn(
                  'text-sm flex-1',
                  sub.status === 'completed' && 'line-through text-text-muted'
                )}>
                  {sub.title}
                </span>
                <span className="text-xs text-text-muted">{getTimeString(sub.estimatedMinutes)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="确认删除"
      >
        <div className="text-center mb-6">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-3" />
          <p className="text-sm text-text">确定要删除这个任务吗？</p>
          <p className="text-xs text-text-muted mt-1">删除后所有子任务也会被移除</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-medium"
          >
            删除
          </button>
        </div>
      </Modal>
    </div>
  )
}
