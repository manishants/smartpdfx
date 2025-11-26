import fs from 'fs'
import path from 'path'

type ToolDescriptionStore = Record<string, string>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'toolDescriptionStore.json')

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

function readStore(): ToolDescriptionStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ToolDescriptionStore
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: ToolDescriptionStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getDescriptionBySlug(slug: string): string | null {
  const store = readStore()
  return store[slug] || null
}

export function setDescriptionForSlug(slug: string, description: string): string {
  const store = readStore()
  store[slug] = description
  writeStore(store)
  return store[slug]
}