import fs from 'fs'
import path from 'path'
import type { ToolHowtoData } from '@/lib/tool-howto'

type ToolHowtoStore = Record<string, ToolHowtoData>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'toolHowtoStore.json')

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

function readStore(): ToolHowtoStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ToolHowtoStore
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: ToolHowtoStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getHowtoBySlug(slug: string): ToolHowtoData | null {
  const store = readStore()
  return store[slug] || null
}

export function setHowtoForSlug(slug: string, data: ToolHowtoData): ToolHowtoData {
  const store = readStore()
  const updated: ToolHowtoData = { ...data, updatedAt: new Date().toISOString() }
  store[slug] = updated
  writeStore(store)
  return updated
}