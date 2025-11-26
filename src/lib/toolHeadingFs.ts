import fs from 'fs'
import path from 'path'

type ToolHeadingStore = Record<string, string>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'toolHeadingStore.json')

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

function readStore(): ToolHeadingStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ToolHeadingStore
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: ToolHeadingStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getHeadingBySlug(slug: string): string | null {
  const store = readStore()
  return store[slug] || null
}

export function setHeadingForSlug(slug: string, heading: string): string {
  const store = readStore()
  store[slug] = heading
  writeStore(store)
  return store[slug]
}