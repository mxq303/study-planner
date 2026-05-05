'use client'

import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useI18n } from '@/lib/i18n'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { useSubjectStore } from '@/stores/subjectStore'
import { Modal } from '@/components/ui/Modal'
import { db } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { Palette, Clock, BookOpen, Cloud, Info } from 'lucide-react'
import { AppearanceSection } from '@/components/settings/AppearanceSection'
import { StudySection } from '@/components/settings/StudySection'
import { SubjectsSection } from '@/components/settings/SubjectsSection'
import { DataSection } from '@/components/settings/DataSection'
import { AboutSection } from '@/components/settings/AboutSection'
import { toast } from 'sonner'

const TABS = [
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'study', label: '学习', icon: Clock },
  { id: 'subjects', label: '科目', icon: BookOpen },
  { id: 'data', label: '数据', icon: Cloud },
  { id: 'about', label: '关于', icon: Info },
]

export default function SettingsPage() {
  const { t, locale } = useI18n()
  const { preferences, loadPreferences } = usePreferenceStore()
  const { loadSubjects, initPresetSubjects } = useSubjectStore()
  const [activeTab, setActiveTab] = useState('appearance')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [tabsRef] = useAutoAnimate()

  useEffect(() => {
    loadPreferences()
    loadSubjects()
  }, [loadPreferences, loadSubjects])

  useEffect(() => {
    if (!preferences) return
    initPresetSubjects()
  }, [preferences, initPresetSubjects])

  useEffect(() => {
    if (!preferences) return
    document.documentElement.style.setProperty('--accent', preferences.accentColor || '#6366f1')
    document.documentElement.className = document.documentElement.className
      .replace(/text-scale-\w+/g, `text-scale-${preferences.fontSizeScale || 'md'}`)
      .replace(/density-\w+/g, `density-${preferences.uiDensity || 'comfortable'}`)
  }, [preferences])

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

  if (!preferences) {
    return (
      <div className="space-y-4 pb-4 animate-fade-in">
        <h1 className="text-xl font-bold text-text">{t.settings.title}</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-hover" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-text mb-5">{t.settings.title}</h1>

      <div className="flex gap-6">
        {/* Desktop: Sidebar */}{/* */}
        <div className="hidden md:block w-48 flex-shrink-0">
          <nav className="space-y-0.5 sticky top-6" ref={tabsRef}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text hover:bg-hover'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile: Horizontal scroll tabs */}{/* */}
        <div className="md:hidden flex gap-1 p-1 bg-hover rounded-xl mb-5 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                activeTab === tab.id
                  ? 'bg-surface text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}{/* */}
        <div className="flex-1 min-w-0 md:ml-4">
          <div className="card-bg rounded-2xl p-5 border border-border">
            {activeTab === 'appearance' && <AppearanceSection />}
            {activeTab === 'study' && <StudySection />}
            {activeTab === 'subjects' && <SubjectsSection />}
            {activeTab === 'data' && <DataSection onClearData={() => setClearModalOpen(true)} />}
            {activeTab === 'about' && <AboutSection />}
          </div>
        </div>
      </div>

      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)} title={t.settings.clearDataTitle}>
        <p className="text-sm text-text-muted mb-4">{t.settings.clearDataConfirm}</p>
        <div className="flex gap-3">
          <button onClick={() => setClearModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-hover transition">{t.common.cancel}</button>
          <button onClick={handleClearData} className="flex-1 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-danger/80 transition">{t.settings.clearData}</button>
        </div>
      </Modal>
    </div>
  )
}
