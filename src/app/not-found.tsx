import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-scale-in">
      <p className="text-6xl mb-4">📚</p>
      <h1 className="text-2xl font-bold mb-2">页面未找到</h1>
      <p className="text-text-muted mb-6">你访问的页面不存在或已被移除</p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition"
      >
        返回首页
      </Link>
    </div>
  )
}
