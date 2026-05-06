'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTaskStore } from '@/stores/taskStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

export default function NewTaskPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { addTask } = useTaskStore()
  const { subjects } = useSubjectStore()

  const PRIORITY_LEVELS = t.tasks.priorityLevels.map((label, i) => ({ value: i + 1, label }))

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [priority, setPriority] = useState(3)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(true)

  const [quickTitle, setQuickTitle] = useState('')
  const [quickSubject, setQuickSubject] = useState('')
  const [quickMinutes, setQuickMinutes] = useState(30)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(locale === 'zh-CN' ? '请输入任务标题' : 'Please enter a task title')
      return
    }
    setSaving(true)
    try {
      const id = await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        priority,
        estimatedMinutes,
        deadline: deadline || undefined,
      })
      toast.success(locale === 'zh-CN' ? '任务已创建' : 'Task created', {
        action: { label: locale === 'zh-CN' ? '查看' : 'View', onClick: () => router.push(`/tasks/${id}`) },
      })
      router.push('/tasks')
    } catch {
      toast.error(locale === 'zh-CN' ? '创建失败，请重试' : 'Creation failed, please retry')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) {
      toast.error(locale === 'zh-CN' ? '请输入任务标题' : 'Please enter a task title')
      return
    }
    setSaving(true)
    try {
      const id = await addTask({
        title: quickTitle.trim(),
        subjectId: quickSubject || undefined,
        priority: 3,
        estimatedMinutes: quickMinutes,
      })
      toast.success(locale === 'zh-CN' ? '快速添加成功' : 'Quick add successful', {
        action: { label: locale === 'zh-CN' ? '查看' : 'View', onClick: () => router.push(`/tasks/${id}`) },
      })
      setQuickTitle('')
      setQuickMinutes(30)
    } catch {
      toast.error(locale === 'zh-CN' ? '添加失败' : 'Add failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-6 animate-slide-up">
      <PageHeader title={t.tasks.edit} backHref="/tasks" />

      {showQuickAdd && (
        <Card className="mb-4 border-primary/20 bg-primary/[0.02] animate-fade-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-text">{t.tasks.quickAdd}</span>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="ml-auto text-xs text-text-muted hover:text-text"
            >
              {locale === 'zh-CN' ? '收起' : 'Collapse'}
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              placeholder={t.tasks.taskTitle}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <select
              value={quickSubject}
              onChange={e => setQuickSubject(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text outline-none focus:border-primary appearance-none"
            >
              <option value="">{locale === 'zh-CN' ? '选择科目' : 'Select subject'}</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={quickMinutes}
              onChange={e => setQuickMinutes(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text outline-none focus:border-primary appearance-none"
            >
              {[15, 25, 30, 45, 60, 90, 120].map(m => (
                <option key={m} value={m}>{m} {t.tasks.minutes}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={saving}
            className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {t.tasks.quickAdd}
          </button>
        </Card>
      )}

      {!showQuickAdd && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="w-full mb-4 py-2 rounded-xl border border-dashed border-border text-text-muted text-xs hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3.5 h-3.5" /> {locale === 'zh-CN' ? '展开快速添加' : 'Expand quick add'}
        </button>
      )}

      <Card className="animate-fade-in stagger-2">
        <h3 className="text-sm font-semibold text-text mb-4">{locale === 'zh-CN' ? '完整信息' : 'Full details'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.taskTitle} *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={locale === 'zh-CN' ? '例如：复习第三章数学公式' : 'e.g. Review Chapter 3 math formulas'}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.description}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={locale === 'zh-CN' ? '详细描述任务内容和目标...' : 'Describe the task content and goals...'}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.subject}</label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="">{locale === 'zh-CN' ? '不指定科目' : 'No subject'}</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.priority}</label>
            <div className="flex gap-2">
              {PRIORITY_LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPriority(level.value)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-colors',
                    priority === level.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface text-text-muted hover:bg-hover'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.estimatedTime} ({t.tasks.minutes})</label>
            <div className="flex gap-2 flex-wrap">
              {[15, 25, 30, 45, 60, 90, 120, 180].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEstimatedMinutes(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    estimatedMinutes === m
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-muted hover:bg-hover'
                  )}
                >
                  {m} {t.tasks.minutes}
                </button>
              ))}
              <input
                type="number"
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value) || 30)}
                min={5}
                max={480}
                className="w-20 px-2 py-1.5 rounded-lg border border-border bg-surface text-sm text-text text-center outline-none focus:border-primary"
                placeholder={locale === 'zh-CN' ? '自定义' : 'Custom'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t.tasks.deadline}</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 animate-bounce-gentle"
          >
            <Save className="w-4 h-4" />
            {saving ? (locale === 'zh-CN' ? '保存中...' : 'Saving...') : t.tasks.saveChanges}
          </button>
        </div>
      </Card>
    </div>
  )
}
