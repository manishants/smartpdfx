import fs from 'fs'
import path from 'path'

export type Subscriber = {
  id: number
  email: string
  category: string
  unsubscribed: boolean
  created_at: string
  updated_at: string
}

type NewsletterStore = { subscribers: Subscriber[] }

const storeFile = path.join(process.cwd(), 'src', 'lib', 'newsletterStore.json')

function ensureStore() {
  try {
    if (!fs.existsSync(storeFile)) {
      const initial: NewsletterStore = { subscribers: [] }
      fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(storeFile, 'utf-8')
      if (!raw.trim()) {
        const initial: NewsletterStore = { subscribers: [] }
        fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), 'utf-8')
      }
    }
  } catch {}
}

export function readStore(): NewsletterStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as NewsletterStore
    return parsed?.subscribers ? parsed : { subscribers: [] }
  } catch {
    return { subscribers: [] }
  }
}

export function writeStore(store: NewsletterStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getAllSubscribers(): Subscriber[] {
  const { subscribers } = readStore()
  return subscribers.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function toggleSubscriber(id: number, unsubscribed: boolean): boolean {
  const store = readStore()
  const idx = store.subscribers.findIndex(s => s.id === id)
  if (idx < 0) return false
  store.subscribers[idx].unsubscribed = unsubscribed
  store.subscribers[idx].updated_at = new Date().toISOString()
  writeStore(store)
  return true
}

export function addSubscriber(email: string, category = 'general'): Subscriber {
  const store = readStore()
  const exists = store.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase() && s.category === category)
  if (exists) return exists
  const sub: Subscriber = {
    id: Date.now(),
    email,
    category,
    unsubscribed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  store.subscribers.unshift(sub)
  writeStore(store)
  return sub
}