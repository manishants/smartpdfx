import fs from 'fs'
import path from 'path'

type ToolRelatedBlogStore = Record<string, string>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'toolRelatedBlogStore.json')

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

function readStore(): ToolRelatedBlogStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ToolRelatedBlogStore
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: ToolRelatedBlogStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getRelatedBlogUrl(slug: string): string | null {
  const store = readStore()
  return store[slug] || null
}

export function setRelatedBlogUrl(slug: string, url: string): string {
  const store = readStore()
  store[slug] = url
  writeStore(store)
  return store[slug]
}