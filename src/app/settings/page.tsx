'use client'

import { useEffect, useState } from 'react'
import { Trash2, Clock, BookOpen, Database, Info, Link as LinkIcon, Cloud } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { db } from '@/lib/storage'

const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
]

const ICONS = [
  'book-open', 'sigma', 'languages', 'atom', 'flask-conical',
  'leaf', 'landmark', 'scroll', 'globe', 'brain',
]

export default function SettingsPage() {
  const { preferences, loadPreferences, updatePreferences } = usePreferenceStore()
  const { subjects, loadSubjects, initPresetSubjects, addSubject, updateSubject, deleteSubject } = useSubjectStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [newIcon, setNewIcon] = useState('book-open')
  const [clearModalOpen, setClearModalOpen] = useState(false)

  useEffect(() => {
    loadPreferences()
    loadSubjects()
  }, [loadPreferences, loadSubjects])

  useEffect(() => {
    if (!preferences) return
    initPresetSubjects()
  }, [preferences, initPresetSubjects])

  const handlePomodoroMode = (mode: 'fixed' | 'adaptive') => {
    updatePreferences({ pomodoroMode: mode })
    toast.success(mode === 'fixed' ? '已切换为固定时长模式' : '已切换为自适应模式')
  }

  const handleClearData = async () => {
    await db.pomodoroSessions.clear()
    await db.tasks.clear()
    await db.reviewReminders.clear()
    await db.subjects.clear()
    await db.userPreferences.clear()
    toast.success('所有数据已清除')
    setClearModalOpen(false)
    window.location.reload()
  }

  const handleAddSubject = async () => {
    if (!newName.trim()) return
    await addSubject({
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
      sortOrder: subjects.length,
      isPreset: false,
    })
    toast.success(`已添加科目：${newName.trim()}`)
    setNewName('')
    setAddModalOpen(false)
  }

  const handleEditSubject = async () => {
    if (!editSubjectId || !newName.trim()) return
    await updateSubject(editSubjectId, {
      name: newName.trim(),
      color: newColor,
      icon: newIcon,
    })
    toast.success('科目已更新')
    setEditSubjectId(null)
    setAddModalOpen(false)
  }

  const openEditModal = (id: string) => {
    const s = subjects.find(sub => sub.id === id)
    if (!s) return
    setEditSubjectId(id)
    setNewName(s.name)
    setNewColor(s.color)
    setNewIcon(s.icon)
    setAddModalOpen(true)
  }

  const openAddModal = () => {
    setEditSubjectId(null)
    setNewName('')
    setNewColor('#6366f1')
    setNewIcon('book-open')
    setAddModalOpen(true)
  }

  if (!preferences) {
    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-lg font-bold">设置</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">设置</h1>

      {/* 番茄钟设置 */}
      <Card>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          番茄钟设置
        </h2>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div>
            <p className="text-xs text-text-muted mb-1.5">时长模式</p>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => handlePomodoroMode('fixed')}
                className={cn(
                  'flex-1 py-1.5 rounded-full text-xs font-medium transition',
                  preferences.pomodoroMode === 'fixed'
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-muted'
                )}
              >
                固定时长
              </button>
              <button
                onClick={() => handlePomodoroMode('adaptive')}
                className={cn(
                  'flex-1 py-1.5 rounded-full text-xs font-medium transition',
                  preferences.pomodoroMode === 'adaptive'
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-muted'
                )}
              >
                自适应
              </button>
            </div>
          </div>

          {/* Focus duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">专注时长 (分钟)</p>
              <span className="text-xs font-medium text-primary">{preferences.pomodoroFocusMinutes}分钟</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={preferences.pomodoroFocusMinutes}
              onChange={e => updatePreferences({ pomodoroFocusMinutes: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>5</span>
              <span>60</span>
            </div>
          </div>

          {/* Break duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">短休息时长 (分钟)</p>
              <span className="text-xs font-medium text-success">{preferences.pomodoroBreakMinutes}分钟</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={preferences.pomodoroBreakMinutes}
              onChange={e => updatePreferences({ pomodoroBreakMinutes: Number(e.target.value) })}
              className="w-full accent-success"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1</span>
              <span>30</span>
            </div>
          </div>

          {/* Long break duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">长休息时长 (分钟)</p>
              <span className="text-xs font-medium text-warning">{preferences.pomodoroLongBreakMinutes}分钟</span>
            </div>
            <input
              type="range"
              min={10}
              max={45}
              value={preferences.pomodoroLongBreakMinutes}
              onChange={e => updatePreferences({ pomodoroLongBreakMinutes: Number(e.target.value) })}
              className="w-full accent-warning"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>10</span>
              <span>45</span>
            </div>
          </div>

          {/* Long break interval */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">长休息间隔 (轮)</p>
              <span className="text-xs font-medium text-danger">{preferences.pomodoroLongBreakInterval}轮</span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              value={preferences.pomodoroLongBreakInterval}
              onChange={e => updatePreferences({ pomodoroLongBreakInterval: Number(e.target.value) })}
              className="w-full accent-danger"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>2</span>
              <span>8</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 学习时间 */}
      <Card>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          学习时间
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">每日开始时间</p>
            <input
              type="time"
              value={preferences.dailyStudyStart}
              onChange={e => updatePreferences({ dailyStudyStart: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">每日结束时间</p>
            <input
              type="time"
              value={preferences.dailyStudyEnd}
              onChange={e => updatePreferences({ dailyStudyEnd: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <p className="text-sm text-text-muted mb-2">每周休息日</p>
            <div className="flex gap-1.5 flex-wrap">
              {DAY_LABELS.map((label, idx) => {
                const selected = preferences.weeklyOffDays.includes(idx)
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = selected
                        ? preferences.weeklyOffDays.filter(d => d !== idx)
                        : [...preferences.weeklyOffDays, idx]
                      updatePreferences({ weeklyOffDays: next })
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition',
                      selected
                        ? 'bg-danger/10 border-danger text-danger'
                        : 'border-border text-text-muted hover:border-primary'
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 科目管理 */}
      <Card>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          科目管理
        </h2>

        <div className="space-y-2">
          {subjects.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-3 py-2"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm"
                style={{ backgroundColor: s.color }}
              >
                {s.name[0]}
              </div>
              <p className="flex-1 text-sm font-medium">{s.name}</p>
              {s.isPreset ? (
                <span className="text-[10px] text-text-muted bg-gray-100 px-2 py-0.5 rounded">预置</span>
              ) : (
                <button
                  onClick={() => openEditModal(s.id)}
                  className="text-xs text-primary font-medium"
                >
                  编辑
                </button>
              )}
              {!s.isPreset && (
                <button
                  onClick={() => deleteSubject(s.id)}
                  className="p-1 text-text-muted hover:text-danger transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={openAddModal}
          className="mt-3 w-full py-2 border border-dashed border-primary/40 rounded-xl text-sm text-primary font-medium hover:bg-primary/5 transition"
        >
          + 添加自定义科目
        </button>
      </Card>

      {/* 数据 */}
      <Card>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          数据
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">存储模式</p>
              <p className="text-xs text-text-muted">本地存储</p>
            </div>
            <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-lg font-medium">
              活跃
            </span>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 py-2 text-sm text-text-muted hover:text-primary transition"
          >
            <Cloud className="w-4 h-4" />
            切换到云端同步
          </Link>
          <button
            onClick={() => setClearModalOpen(true)}
            className="flex items-center gap-2 py-2 text-sm text-danger hover:text-danger/80 transition"
          >
            <Trash2 className="w-4 h-4" />
            清除所有数据
          </button>
        </div>
      </Card>

      {/* 关于 */}
      <Card>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          关于
        </h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">版本</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">技术栈</span>
            <span className="font-medium">Next.js 16 + Tailwind v4</span>
          </div>
          <Link
            href="#feedback"
            onClick={e => { e.preventDefault(); toast.info('反馈功能即将上线') }}
            className="flex items-center gap-1 text-primary text-sm mt-2"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            意见反馈
          </Link>
        </div>
      </Card>

      {/* Add/Edit Subject Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditSubjectId(null) }}
        title={editSubjectId ? '编辑科目' : '添加科目'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">科目名称</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="例如：编程"
              className="w-full px-3 py-2 border border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">颜色</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? '#1e293b' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">图标</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewIcon(icon)}
                  className={`px-2 py-1 rounded-lg text-xs border transition ${
                    newIcon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={editSubjectId ? handleEditSubject : handleAddSubject}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
          >
            {editSubjectId ? '保存修改' : '添加'}
          </button>
        </div>
      </Modal>

      {/* Clear data confirmation modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="确认清除数据"
      >
        <p className="text-sm text-text-muted mb-4">
          此操作将清除所有本地学习数据，包括任务、番茄钟记录、复习提醒和设置。此操作不可恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setClearModalOpen(false)}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleClearData}
            className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-danger/90 transition"
          >
            确认清除
          </button>
        </div>
      </Modal>
    </div>
  )
}
