import { db } from './storage'

const API_BASE = '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function clearToken() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

export function getStoredUser(): { id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setStoredUser(user: { id: string; name: string; email: string }) {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(url, { ...options, headers })
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '注册失败')
  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '登录失败')
  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function getMe() {
  const res = await authFetch(`${API_BASE}/auth/me`)
  if (!res.ok) return null
  const data = await res.json()
  return data.user
}

export async function pushToCloud() {
  const [subjects, tasks, pomodoroSessions, reviewReminders, userPreferences] = await Promise.all([
    db.subjects.toArray(),
    db.tasks.toArray(),
    db.pomodoroSessions.toArray(),
    db.reviewReminders.toArray(),
    db.userPreferences.toArray(),
  ])

  const body: Record<string, unknown> = {
    subjects,
    tasks,
    pomodoroSessions,
    reviewReminders,
  }
  if (userPreferences.length > 0) {
    body.preferences = userPreferences[0]
  }

  const res = await authFetch(`${API_BASE}/sync/push`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('同步上传失败')
  return res.json()
}

export async function pullFromCloud() {
  const res = await authFetch(`${API_BASE}/sync/pull`)
  if (!res.ok) throw new Error('同步下载失败')
  const data = await res.json()

  await db.transaction('rw', [
    db.subjects,
    db.tasks,
    db.pomodoroSessions,
    db.reviewReminders,
    db.userPreferences,
  ], async () => {
    if (data.subjects?.length) {
      await db.subjects.clear()
      await db.subjects.bulkAdd(data.subjects)
    }
    if (data.tasks?.length) {
      await db.tasks.clear()
      await db.tasks.bulkAdd(data.tasks)
    }
    if (data.pomodoroSessions?.length) {
      await db.pomodoroSessions.clear()
      await db.pomodoroSessions.bulkAdd(data.pomodoroSessions)
    }
    if (data.reviewReminders?.length) {
      await db.reviewReminders.clear()
      await db.reviewReminders.bulkAdd(data.reviewReminders)
    }
    if (data.preferences) {
      await db.userPreferences.clear()
      await db.userPreferences.add(data.preferences)
    }
  })

  return data
}

export function logout() {
  clearToken()
}
