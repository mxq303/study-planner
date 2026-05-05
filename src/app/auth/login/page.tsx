'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Cloud, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { login } from '@/lib/sync'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('登录成功')
      router.push('/settings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Link href="/settings" className="inline-flex items-center text-sm text-text-muted mb-6 hover:text-text">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </Link>
        <Card className="text-center">
          <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">云端同步</h2>
          <p className="text-sm text-text-muted mb-6">
            登录后，学习数据将自动同步到云端，支持跨设备访问
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="邮箱地址"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4">
            还没有账号？<Link href="/auth/register" className="text-primary">立即注册</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
