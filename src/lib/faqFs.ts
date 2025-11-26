import fs from 'fs'
import path from 'path'
import type { ToolFaqItem } from '@/lib/tool-faq'

type ToolFaqStore = Record<string, ToolFaqItem[]>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'toolFaqStore.json')

function ensureStore() {
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify({}, null, 2), 'utf-8')
    return
  }
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    if (!raw.trim()) {
      fs.writeFileSync(storeFile, JSON.stringify({}, null, 2), 'utf-8')
    }
  } catch {
    fs.writeFileSync(storeFile, JSON.stringify({}, null, 2), 'utf-8')
  }
}

function readStore(): ToolFaqStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ToolFaqStore
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: ToolFaqStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getFaqBySlug(slug: string): ToolFaqItem[] {
  const store = readStore()
  return store[slug] || []
}

export function setFaqForSlug(slug: string, items: ToolFaqItem[]): ToolFaqItem[] {
  const store = readStore()
  store[slug] = items.map(i => ({ ...i, updatedAt: new Date().toISOString() }))
  writeStore(store)
  return store[slug]
}