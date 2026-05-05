'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { register } from '@/lib/sync'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const validate = () => {
    const errs: Record<string, string | undefined> = {}
    if (!email.trim()) errs.email = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '邮箱格式不正确'
    if (!password) errs.password = '请输入密码'
    else if (password.length < 6) errs.password = t.auth.passwordTooShort
    if (password !== confirmPassword) errs.confirmPassword = '两次密码不一致'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success(t.auth.registerSuccess)
      router.push('/settings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/settings" className="inline-flex items-center text-sm text-text-muted mb-8 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> {t.common.back}
        </Link>

        <Card className="p-6 md:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-1.5">{t.auth.registerTitle}</h2>
          <p className="text-sm text-text-muted mb-8">{t.auth.registerDesc}</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t.auth.nickname}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                  placeholder="name@example.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors',
                    'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
                    errors.email ? 'border-danger' : 'border-border'
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t.auth.passwordHint}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                  placeholder="••••••"
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm transition-colors',
                    'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
                    errors.password ? 'border-danger' : 'border-border'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })) }}
                  placeholder="••••••"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-colors',
                    'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20',
                    errors.confirmPassword ? 'border-danger' : 'border-border'
                  )}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold transition-all',
                'hover:bg-primary-dark active:scale-[0.98]',
                'disabled:opacity-60 flex items-center justify-center gap-2'
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t.auth.registering : t.auth.registerBtn}
            </button>
          </form>

          <p className="text-sm text-text-muted mt-6">
            {t.auth.hasAccount}{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:text-primary-dark">
              {t.auth.goLogin}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
