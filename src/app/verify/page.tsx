'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Loader2, Check, ArrowRight, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function VerifyPage() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendCode = async () => {
    if (!email) { toast.error('缺少邮箱地址'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setCountdown(60)
        toast.success(`验证码: ${data.code}`)
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('发送失败')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!code || code.length !== 6) { toast.error('请输入6位验证码'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (res.ok) {
        setVerified(true)
        toast.success('邮箱验证成功！')
        setTimeout(() => router.push('/'), 1500)
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('验证失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <Card className="w-full max-w-md p-8 text-center animate-scale-in">
        {verified ? (
          <div>
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">验证成功！</h2>
            <p className="text-sm text-text-muted">正在跳转到首页...</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">验证邮箱</h2>
            <p className="text-sm text-text-muted mb-6">
              我们向 <span className="font-medium text-text">{email}</span> 发送了验证码
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="输入6位验证码"
                maxLength={6}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className={cn(
                'w-full py-3 bg-primary text-white rounded-xl font-semibold mb-4 flex items-center justify-center gap-2',
                'hover:bg-primary-dark transition-colors disabled:opacity-50 active:scale-[0.98]'
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              验证
            </button>

            <button
              onClick={handleSendCode}
              disabled={loading || countdown > 0}
              className="w-full flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              {countdown > 0 ? `${countdown}秒后重新发送` : '重新发送验证码'}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
