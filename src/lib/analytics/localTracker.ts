// Local-only page and event tracker using browser localStorage
// No external APIs or cookies are used.

export type TrackerStore = {
  pages: Record<string, number>
  totalVisits: number
  conversions: Record<string, number>
  downloads: Record<string, number>
}

const STORAGE_KEY = 'spx_tracker'

function readStore(): TrackerStore {
  if (typeof window === 'undefined') {
    return { pages: {}, totalVisits: 0, conversions: {}, downloads: {} }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { pages: {}, totalVisits: 0, conversions: {}, downloads: {} }
    const parsed: TrackerStore = JSON.parse(raw)
    return {
      pages: parsed.pages || {},
      totalVisits: Number(parsed.totalVisits || 0),
      conversions: parsed.conversions || {},
      downloads: parsed.downloads || {},
    }
  } catch {
    return { pages: {}, totalVisits: 0, conversions: {}, downloads: {} }
  }
}

function writeStore(store: TrackerStore) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

export function trackPageView(path: string) {
  const store = readStore()
  store.pages[path] = (store.pages[path] || 0) + 1
  store.totalVisits += 1
  writeStore(store)
  // Console output per request
  try {
    console.info('[Tracker] Page:', path, 'Visits:', store.pages[path], 'Total:', store.totalVisits)
  } catch {}

  // Best-effort server sync
  try {
    const visitorId = getVisitorId()
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: path, visitorId }),
    }).catch(() => {})
  } catch {}
}

export function recordConversion(key: string) {
  const store = readStore()
  store.conversions[key] = (store.conversions[key] || 0) + 1
  writeStore(store)
}

export function recordDownload(key: string) {
  const store = readStore()
  store.downloads[key] = (store.downloads[key] || 0) + 1
  writeStore(store)
}

export function getPageVisits(path: string): number {
  return readStore().pages[path] || 0
}

export function getTotalVisits(): number {
  return readStore().totalVisits || 0
}

export function getAllStats(): TrackerStore {
  return readStore()
}

// Optional global helper to make recording easy anywhere
declare global {
  interface Window {
    SPXTracker?: {
      trackPageView: (path: string) => void
      recordConversion: (key: string) => void
      recordDownload: (key: string) => void
    }
  }
}

// ---------- Server sync helpers ----------
function getVisitorId(): string {
  try {
    const KEY = 'spx_visitor_id'
    let id = window.localStorage.getItem(KEY) || ''
    if (!id) {
      id = generateId()
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

function generateId(): string {
  try {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return String(Date.now())
  }
}

let heartbeatTimer: any = null
export function startHeartbeat(currentPath: string) {
  try {
    if (heartbeatTimer) return
    const visitorId = getVisitorId()
    const send = () => {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, page: currentPath }),
      }).catch(() => {})
    }
    send()
    heartbeatTimer = setInterval(send, 15000)
  } catch {}
}

export function stopHeartbeat() {
  try {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  } catch {}
}

export function attachGlobalTracker() {
  if (typeof window === 'undefined') return
  window.SPXTracker = {
    trackPageView,
    recordConversion,
    recordDownload,
  }
}