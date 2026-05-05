'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { isLoggedIn, getStoredUser, logout, pushToCloud, pullFromCloud, getMe } from '@/lib/sync'
import { Database, User, Cloud, CloudOff, Upload, Download, Loader2, LogOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DataSection({
  onClearData,
}: {
  onClearData: () => void
}) {
  const { t, locale } = useI18n()
  const [syncLoading, setSyncLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return isLoggedIn()
    return false
  })
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(() => {
    if (typeof window !== 'undefined' && isLoggedIn()) return getStoredUser()
    return null
  })

  useState(() => {
    if (isLoggedIn()) {
      getMe().then(u => { if (u) setUser(u) }).catch(() => {})
    }
  })

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text">{t.settings.data}</h3>
      </div>

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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-hover transition disabled:opacity-50"
              >
                {syncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {t.settings.upload}
              </button>
              <button
                onClick={handlePull}
                disabled={syncLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-hover transition disabled:opacity-50"
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
              <span className="px-3 py-1 bg-hover text-text-muted text-xs rounded-lg font-medium flex items-center gap-1">
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium text-text hover:bg-hover transition"
              >
                {t.settings.register}
              </Link>
            </div>
          </>
        )}

        <div className="border-t border-border pt-3">
          <button
            onClick={onClearData}
            className="flex items-center gap-2 py-2 text-sm text-danger hover:text-danger/80 transition"
          >
            <Trash2 className="w-4 h-4" />
            {t.settings.clearData}
          </button>
        </div>
      </div>
    </div>
  )
}
