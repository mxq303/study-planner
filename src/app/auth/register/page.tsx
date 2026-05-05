'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { register } from '@/lib/sync'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('密码至少需要6位')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('注册成功，已自动登录')
      router.push('/settings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '注册失败')
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
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold mb-2">注册账号</h2>
          <p className="text-sm text-text-muted mb-6">
            注册后可在多设备间同步学习数据
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="昵称（选填）"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
            />
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
              placeholder="密码（至少6位）"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4">
            已有账号？<Link href="/auth/login" className="text-primary">立即登录</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
