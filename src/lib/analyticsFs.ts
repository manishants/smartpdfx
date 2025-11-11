import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export type AnalyticsStore = {
  totals: { views: number }
  uniqueVisitors: string[]
  day: Record<string, { views: number; uniqueVisitors: string[] }>
  month: Record<string, { views: number; uniqueVisitors: string[] }>
  year: Record<string, { views: number; uniqueVisitors: string[] }>
  pages: Record<string, { views: number; uniqueVisitors: string[] }>
}

type SessionsStore = Record<string, { page: string; lastSeen: number }>

const analyticsFile = path.join(process.cwd(), 'src', 'lib', 'analyticsStore.json')
const sessionsFile = path.join(process.cwd(), 'src', 'lib', 'activeSessions.json')

const defaultAnalytics: AnalyticsStore = {
  totals: { views: 0 },
  uniqueVisitors: [],
  day: {},
  month: {},
  year: {},
  pages: {},
}

function ensureAnalytics() {
  try {
    if (!fs.existsSync(analyticsFile)) {
      fs.writeFileSync(analyticsFile, JSON.stringify(defaultAnalytics, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(analyticsFile, 'utf-8')
      if (!raw.trim()) {
        fs.writeFileSync(analyticsFile, JSON.stringify(defaultAnalytics, null, 2), 'utf-8')
      }
    }
  } catch {}
}

function ensureSessions() {
  try {
    if (!fs.existsSync(sessionsFile)) {
      fs.writeFileSync(sessionsFile, JSON.stringify({}, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(sessionsFile, 'utf-8')
      if (!raw.trim()) {
        fs.writeFileSync(sessionsFile, JSON.stringify({}, null, 2), 'utf-8')
      }
    }
  } catch {}
}

export function readAnalyticsStore(): AnalyticsStore {
  ensureAnalytics()
  try {
    const raw = fs.readFileSync(analyticsFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as AnalyticsStore
    return parsed?.totals ? parsed : defaultAnalytics
  } catch {
    return defaultAnalytics
  }
}

export function writeAnalyticsStore(store: AnalyticsStore) {
  fs.writeFileSync(analyticsFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function readSessions(): SessionsStore {
  ensureSessions()
  try {
    const raw = fs.readFileSync(sessionsFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as SessionsStore
    return parsed || {}
  } catch {
    return {}
  }
}

export function writeSessions(store: SessionsStore) {
  fs.writeFileSync(sessionsFile, JSON.stringify(store, null, 2), 'utf-8')
}

// Removed IP hashing to comply with privacy-first policy

function pushUnique(arr: string[], value: string) {
  if (!value) return
  if (!arr.includes(value)) arr.push(value)
}

export function trackView({
  page,
  visitorId,
  timestamp,
}: {
  page: string
  visitorId: string
  timestamp?: number
}) {
  const store = readAnalyticsStore()
  const t = new Date(typeof timestamp === 'number' ? timestamp : Date.now())
  const dayKey = t.toISOString().slice(0, 10)
  const monthKey = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`
  const yearKey = String(t.getFullYear())

  store.totals.views = (store.totals.views || 0) + 1
  pushUnique(store.uniqueVisitors, visitorId)

  const d = (store.day[dayKey] = store.day[dayKey] || { views: 0, uniqueVisitors: [] })
  d.views += 1
  pushUnique(d.uniqueVisitors, visitorId)

  const m = (store.month[monthKey] = store.month[monthKey] || { views: 0, uniqueVisitors: [] })
  m.views += 1
  pushUnique(m.uniqueVisitors, visitorId)

  const y = (store.year[yearKey] = store.year[yearKey] || { views: 0, uniqueVisitors: [] })
  y.views += 1
  pushUnique(y.uniqueVisitors, visitorId)

  const p = (store.pages[page] = store.pages[page] || { views: 0, uniqueVisitors: [] })
  p.views += 1
  pushUnique(p.uniqueVisitors, visitorId)

  writeAnalyticsStore(store)
}

export function heartbeat({
  visitorId,
  page,
  now,
  ttlSeconds = 90,
}: {
  visitorId: string
  page: string
  now?: number
  ttlSeconds?: number
}) {
  const current = typeof now === 'number' ? now : Date.now()
  const sessions = readSessions()
  sessions[visitorId] = { page, lastSeen: current }

  // Prune stale
  const cutoff = current - ttlSeconds * 1000
  for (const [vid, info] of Object.entries(sessions)) {
    if ((info?.lastSeen || 0) < cutoff) {
      delete sessions[vid]
    }
  }

  writeSessions(sessions)
  return Object.keys(sessions).length
}

export function getLiveVisitors(ttlSeconds = 90): number {
  const sessions = readSessions()
  const now = Date.now()
  const cutoff = now - ttlSeconds * 1000
  let count = 0
  for (const info of Object.values(sessions)) {
    if ((info?.lastSeen || 0) >= cutoff) count += 1
  }
  return count
}