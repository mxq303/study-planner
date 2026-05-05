'use client'

import { useI18n } from '@/lib/i18n'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { Clock, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function StudySection() {
  const { t } = useI18n()
  const { preferences, updatePreferences } = usePreferenceStore()

  const handlePomodoroMode = (mode: 'fixed' | 'adaptive') => {
    updatePreferences({ pomodoroMode: mode })
    const label = mode === 'fixed' ? t.settings.fixedMode : t.settings.adaptiveMode
    toast.success(`${t.settings.pomodoroSettings}：${label}`)
  }

  if (!preferences) return null

  const sectionLabel = 'text-xs font-medium text-text-muted mb-2'
  const sectionBlock = 'mb-6'

  return (
    <div className="space-y-6">
      {/* Pomodoro Settings */}
      <div className={sectionBlock}>
        <div className="flex items-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">{t.settings.pomodoroSettings}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className={sectionLabel}>{t.settings.pomodoroSettings}</p>
            <div className="flex gap-1 bg-hover rounded-full p-1">
              <button
                onClick={() => handlePomodoroMode('fixed')}
                className={cn(
                  'flex-1 py-2 rounded-full text-sm font-medium transition',
                  preferences.pomodoroMode === 'fixed'
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {t.settings.fixedMode}
              </button>
              <button
                onClick={() => handlePomodoroMode('adaptive')}
                className={cn(
                  'flex-1 py-2 rounded-full text-sm font-medium transition',
                  preferences.pomodoroMode === 'adaptive'
                    ? 'bg-surface text-text shadow-sm'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {t.settings.adaptiveMode}
              </button>
            </div>
          </div>

          {/* Focus duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-text-muted">⏱ {t.settings.focusDuration}</p>
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
              <p className="text-xs text-text-muted">⏸ {t.settings.breakDuration}</p>
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
              <p className="text-xs text-text-muted">☕ {t.settings.longBreakDuration}</p>
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
              <p className="text-xs text-text-muted">🔄 {t.settings.longBreakInterval}</p>
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
      </div>

      {/* Study Time */}
      <div className={sectionBlock}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">{t.settings.studyTime}</h3>
        </div>

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
              {t.settings.daysOfWeek.map((label: string, idx: number) => {
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
      </div>
    </div>
  )
}
