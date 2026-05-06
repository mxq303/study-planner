'use client'

import { useI18n } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'
import { usePreferenceStore } from '@/stores/preferenceStore'
import { Globe, Sun, Moon, Monitor, Palette, Layers, LayoutGrid, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCENT_COLORS = [
  { color: '#6366f1', name: '靛蓝' },
  { color: '#3b82f6', name: '蓝色' },
  { color: '#22c55e', name: '绿色' },
  { color: '#ec4899', name: '玫红' },
  { color: '#f59e0b', name: '琥珀' },
  { color: '#8b5cf6', name: '紫色' },
  { color: '#06b6d4', name: '青色' },
  { color: '#14b8a6', name: '青蓝' },
]

export function AppearanceSection() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const { preferences, updatePreferences } = usePreferenceStore()

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    updatePreferences({ theme: newTheme })
  }

  const handleSetLocale = (newLocale: 'zh-CN' | 'en-US') => {
    setLocale(newLocale)
    updatePreferences({ language: newLocale })
  }

  if (!preferences) return null

  const accentColor = preferences.accentColor || '#6366f1'
  const cardStyle = preferences.cardStyle || 'solid'
  const uiDensity = preferences.uiDensity || 'comfortable'
  const fontSizeScale = preferences.fontSizeScale || 'md'

  const sectionClass = 'mb-6'
  const btnBase = 'flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all'

  return (
    <div className="space-y-6">
      {/* Language */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">{t.settings.language}</h3>
        </div>
        <div className="flex gap-1 bg-hover rounded-full p-1">
          <button
            onClick={() => handleSetLocale('zh-CN')}
            className={cn(btnBase, locale === 'zh-CN' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
          >中文</button>
          <button
            onClick={() => handleSetLocale('en-US')}
            className={cn(btnBase, locale === 'en-US' ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
          >English</button>
        </div>
      </div>

      {/* Theme */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">{t.settings.theme}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handleSetTheme('light')} className={cn('flex flex-col items-center gap-1 py-3 rounded-xl border transition-all', theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-muted hover:text-text')}>
            <Sun className="w-5 h-5" />
            <span className="text-xs">{t.settings.lightMode}</span>
          </button>
          <button onClick={() => handleSetTheme('dark')} className={cn('flex flex-col items-center gap-1 py-3 rounded-xl border transition-all', theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-muted hover:text-text')}>
            <Moon className="w-5 h-5" />
            <span className="text-xs">{t.settings.darkMode}</span>
          </button>
          <button onClick={() => handleSetTheme('system')} className={cn('flex flex-col items-center gap-1 py-3 rounded-xl border transition-all', theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-muted hover:text-text')}>
            <Monitor className="w-5 h-5" />
            <span className="text-xs">{t.settings.systemMode}</span>
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">强调色</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.color}
              onClick={() => updatePreferences({ accentColor: c.color })}
              className="relative w-9 h-9 rounded-full transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: c.color }}
              title={c.name}
            >
              {accentColor === c.color && (
                <div className="absolute inset-0 rounded-full border-2 border-white dark:border-gray-800 ring-2 ring-offset-1 ring-offset-bg" style={{ '--tw-ring-color': c.color } as React.CSSProperties} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Card Style */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">卡片风格</h3>
        </div>
        <div className="flex gap-1 bg-hover rounded-full p-1">
          {(['solid', 'glass', 'outlined'] as const).map(style => (
            <button
              key={style}
              onClick={() => updatePreferences({ cardStyle: style })}
              className={cn(btnBase, cardStyle === style ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
            >{style === 'solid' ? '实心' : style === 'glass' ? '玻璃' : '描边'}</button>
          ))}
        </div>
      </div>

      {/* UI Density */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">布局密度</h3>
        </div>
        <div className="flex gap-1 bg-hover rounded-full p-1">
          {(['compact', 'comfortable', 'spacious'] as const).map(density => (
            <button
              key={density}
              onClick={() => updatePreferences({ uiDensity: density })}
              className={cn(btnBase, uiDensity === density ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
            >{density === 'compact' ? '紧凑' : density === 'comfortable' ? '舒适' : '宽松'}</button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">字体大小</h3>
        </div>
        <div className="flex gap-1 bg-hover rounded-full p-1">
          {(['sm', 'md', 'lg'] as const).map(size => (
            <button
              key={size}
              onClick={() => updatePreferences({ fontSizeScale: size })}
              className={cn(btnBase, fontSizeScale === size ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text')}
            >{size === 'sm' ? '小' : size === 'md' ? '中' : '大'}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
