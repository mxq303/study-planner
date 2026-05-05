'use client'

import { useEffect, useState } from 'react'
import { Trash2, Clock, BookOpen, Database, Info, Link as LinkIcon, Cloud, CloudOff, Upload, Download, Loader2, LogOut, User, Globe, Sun } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { db } from '@/lib/storage'
import { isLoggedIn, getStoredUser, logout, pushToCloud, pullFromCloud, getMe } from '@/lib/sync'
import { useI18n } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
]

const ICONS = [
  'book-open', 'sigma', 'languages', 'atom', 'flask-conical',
  'leaf', 'landmark', 'scroll', 'globe', 'brain',
]

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const { preferences, loadPreferences, updatePreferences } = usePreferenceStore()
  const { subjects, loadSubjects, initPresetSubjects, addSubject, updateSubject, deleteSubject } = useSubjectStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [newIcon, setNewIcon] = useState('book-open')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return isLoggedIn()
    return false
  })
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(() => {
    if (typeof window !== 'undefined' && isLoggedIn()) return getStoredUser()
    return null
  })

  useEffect(() => {
    loadPreferences()
    loadSubjects()
    if (isLoggedIn()) {
      getMe().then(u => { if (u) setUser(u) }).catch(() => {})
    }
  }, [loadPreferences, loadSubjects])

  useEffect(() => {
    if (!preferences) return
    initPresetSubjects()
  }, [preferences, initPresetSubjects])

  const handlePomodoroMode = (mode: 'fixed' | 'adaptive') => {
    updatePreferences({ pomodoroMode: mode })
    const label = mode === 'fixed' ? t.settings.fixedMode : t.settings.adaptiveMode
    toast.success(`${t.settings.pomodoroSettings}：${label}`)
  }

  const handlePush = async () => {
    setSyncLoading(true)
    try {
      await pushToCloud()
      toast.success(locale === 'zh-CN' ? '数据已上传到云端' : 'Data uploaded to cloud')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上传失败')
    } finally {
      setSyncLoading(false)
    }
  }

  const handlePull = async () => {
    setSyncLoading(true)
    try {
      await pullFromCloud()
      toast.success(locale === 'zh-CN' ? '数据已从云端同步' : 'Data synced from cloud')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '下载失败')
    } finally {
      setSyncLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
    setUser(null)
    toast.success(t.auth.logoutSuccess)
  }

  const handleClearData = async () => {
    await db.pomodoroSessions.clear()
    await db.tasks.clear()
    await db.reviewReminders.clear()
    await db.subjects.clear()
    await db.userPreferences.clear()
    toast.success(locale === 'zh-CN' ? '所有数据已清除' : 'All data cleared')
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
    toast.success(locale === 'zh-CN' ? `已添加科目：${newName.trim()}` : `Subject added: ${newName.trim()}`)
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
    toast.success(locale === 'zh-CN' ? '科目已更新' : 'Subject updated')
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
        <h1 className="text-lg font-bold text-text">{t.settings.title}</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-bg rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold text-text">{t.settings.title}</h1>

      {/* Language */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Globe className="w-4 h-4 text-primary" />
          {t.settings.language}
        </h2>
        <div className="flex gap-1 bg-bg rounded-full p-1">
          <button
            onClick={() => setLocale('zh-CN')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-medium transition',
              locale === 'zh-CN'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            )}
          >
            中文
          </button>
          <button
            onClick={() => setLocale('en-US')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-medium transition',
              locale === 'en-US'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            )}
          >
            English
          </button>
        </div>
      </Card>

      {/* Theme */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Sun className="w-4 h-4 text-primary" />
          {t.settings.theme}
        </h2>
        <div className="flex gap-1 bg-bg rounded-full p-1">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-medium transition',
              theme === 'light'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            )}
          >
            {t.settings.lightMode}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-medium transition',
              theme === 'dark'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            )}
          >
            {t.settings.darkMode}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-medium transition',
              theme === 'system'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted'
            )}
          >
            {t.settings.systemMode}
          </button>
        </div>
      </Card>

      {/* Pomodoro Settings */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Clock className="w-4 h-4 text-primary" />
          {t.settings.pomodoroSettings}
        </h2>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div>
            <p className="text-xs text-text-muted mb-1.5">{t.settings.pomodoroSettings}</p>
            <div className="flex gap-1 bg-bg rounded-full p-1">
              <button
                onClick={() => handlePomodoroMode('fixed')}
                className={cn(
                  'flex-1 py-1.5 rounded-full text-xs font-medium transition',
                  preferences.pomodoroMode === 'fixed'
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted'
                )}
              >
                {t.settings.fixedMode}
              </button>
              <button
                onClick={() => handlePomodoroMode('adaptive')}
                className={cn(
                  'flex-1 py-1.5 rounded-full text-xs font-medium transition',
                  preferences.pomodoroMode === 'adaptive'
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted'
                )}
              >
                {t.settings.adaptiveMode}
              </button>
            </div>
          </div>

          {/* Focus duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">{t.settings.focusDuration}</p>
              <span className="text-xs font-medium text-primary">{preferences.pomodoroFocusMinutes}{t.tasks.minutes}</span>
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
              <p className="text-xs text-text-muted">{t.settings.breakDuration}</p>
              <span className="text-xs font-medium text-success">{preferences.pomodoroBreakMinutes}{t.tasks.minutes}</span>
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
              <p className="text-xs text-text-muted">{t.settings.longBreakDuration}</p>
              <span className="text-xs font-medium text-warning">{preferences.pomodoroLongBreakMinutes}{t.tasks.minutes}</span>
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
              <p className="text-xs text-text-muted">{t.settings.longBreakInterval}</p>
              <span className="text-xs font-medium text-danger">{preferences.pomodoroLongBreakInterval}{t.settings.rounds}</span>
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

      {/* Study Time */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Clock className="w-4 h-4 text-primary" />
          {t.settings.studyTime}
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{t.settings.dailyStart}</p>
            <input
              type="time"
              value={preferences.dailyStudyStart}
              onChange={e => updatePreferences({ dailyStudyStart: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm text-text bg-surface"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">{t.settings.dailyEnd}</p>
            <input
              type="time"
              value={preferences.dailyStudyEnd}
              onChange={e => updatePreferences({ dailyStudyEnd: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-lg text-sm text-text bg-surface"
            />
          </div>
          <div>
            <p className="text-sm text-text-muted mb-2">{t.settings.offDays}</p>
            <div className="flex gap-1.5 flex-wrap">
              {t.settings.daysOfWeek.map((label, idx) => {
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

      {/* Subject Management */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <BookOpen className="w-4 h-4 text-primary" />
          {t.settings.subjectManagement}
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
              <p className="flex-1 text-sm font-medium text-text">{s.name}</p>
              {s.isPreset ? (
                <span className="text-[10px] text-text-muted bg-bg px-2 py-0.5 rounded">
                  {locale === 'zh-CN' ? '预置' : 'Preset'}
                </span>
              ) : (
                <button
                  onClick={() => openEditModal(s.id)}
                  className="text-xs text-primary font-medium"
                >
                  {locale === 'zh-CN' ? '编辑' : 'Edit'}
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
          + {t.settings.addSubject}
        </button>
      </Card>

      {/* Data & Sync */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Database className="w-4 h-4 text-primary" />
          {t.settings.data}
        </h2>

        <div className="space-y-3">
          {loggedIn && user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{user.name}</p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">
                  {t.settings.connected}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePush}
                  disabled={syncLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-bg transition disabled:opacity-50"
                >
                  {syncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {t.settings.upload}
                </button>
                <button
                  onClick={handlePull}
                  disabled={syncLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-bg transition disabled:opacity-50"
                >
                  {syncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {t.settings.download}
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-sm text-danger hover:text-danger/80 transition w-full"
              >
                <LogOut className="w-4 h-4" />
                {t.settings.logout}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">{t.settings.storageMode}</p>
                  <p className="text-xs text-text-muted">{t.settings.local}</p>
                </div>
                <span className="px-3 py-1 bg-bg text-text-muted text-xs rounded-lg font-medium flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  {t.settings.offline}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {t.settings.loggedIn}
              </p>
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition"
                >
                  <Cloud className="w-4 h-4" />
                  {t.settings.login}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-bg transition"
                >
                  {t.settings.register}
                </Link>
              </div>
            </>
          )}

          <div className="border-t border-border pt-3">
            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center gap-2 py-2 text-sm text-danger hover:text-danger/80 transition"
            >
              <Trash2 className="w-4 h-4" />
              {t.settings.clearData}
            </button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="card-bg">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-text">
          <Info className="w-4 h-4 text-primary" />
          {t.settings.about}
        </h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">{t.settings.version}</span>
            <span className="font-medium text-text">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">{t.settings.techStack}</span>
            <span className="font-medium text-text">Next.js 16 + Tailwind v4</span>
          </div>
          <Link
            href="#feedback"
            onClick={e => { e.preventDefault(); toast.info(locale === 'zh-CN' ? '反馈功能即将上线' : 'Feedback coming soon') }}
            className="flex items-center gap-1 text-primary text-sm mt-2"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            {t.settings.feedback}
          </Link>
        </div>
      </Card>

      {/* Add/Edit Subject Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditSubjectId(null) }}
        title={editSubjectId ? t.settings.editSubject : t.settings.addSubject}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.settings.subjectName}</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={locale === 'zh-CN' ? '例如：编程' : 'e.g. Programming'}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm text-text bg-surface"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t.settings.color}</label>
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
            <label className="block text-sm font-medium text-text mb-1">{t.settings.icon}</label>
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
            {editSubjectId ? (locale === 'zh-CN' ? '保存修改' : 'Save Changes') : (locale === 'zh-CN' ? '添加' : 'Add')}
          </button>
        </div>
      </Modal>

      {/* Clear data confirmation modal */}
      <Modal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title={t.settings.clearDataTitle}
      >
        <p className="text-sm text-text-muted mb-4">
          {t.settings.clearDataConfirm}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setClearModalOpen(false)}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-text"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleClearData}
            className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-danger/90 transition"
          >
            {t.common.confirm}
          </button>
        </div>
      </Modal>
    </div>
  )
}
