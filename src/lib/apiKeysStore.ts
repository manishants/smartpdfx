import fs from 'fs'
import path from 'path'

type Provider = 'gemini'

export type ApiKeyRecord = {
  id: string
  provider: Provider
  key: string
  label?: string
  createdAt: string
  enabled: boolean
}

type RotationConfig = {
  enabled: boolean
  strategy: 'hourly' | 'minute'
}

type ApiKeysStoreShape = {
  providers: Record<Provider, ApiKeyRecord[]>
  rotation: Record<Provider, RotationConfig>
}

const STORE_FILE = path.join(process.cwd(), 'src', 'lib', 'api-keys.json')

const defaultStore: ApiKeysStoreShape = {
  providers: {
    gemini: [],
  },
  rotation: {
    gemini: { enabled: true, strategy: 'hourly' },
  },
}

function ensureStore() {
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), 'utf-8')
    return
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as Partial<ApiKeysStoreShape>
    const merged: ApiKeysStoreShape = {
      providers: {
        gemini: Array.isArray(parsed?.providers?.gemini) ? parsed!.providers!.gemini! : [],
      },
      rotation: {
        gemini: (() => {
          const r = parsed?.rotation?.gemini || { enabled: true, strategy: 'hourly' }
          const strategy = r.strategy === 'minute' ? 'minute' : 'hourly'
          return { enabled: !!r.enabled, strategy }
        })(),
      },
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(merged, null, 2), 'utf-8')
  } catch {
    fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), 'utf-8')
  }
}

function readStore(): ApiKeysStoreShape {
  ensureStore()
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as ApiKeysStoreShape
    return parsed
  } catch {
    return defaultStore
  }
}

function writeStore(store: ApiKeysStoreShape) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

function generateId(): string {
  return 'key_' + Math.random().toString(36).slice(2, 10)
}

export function getGeminiKeys(): ApiKeyRecord[] {
  const store = readStore()
  return store.providers.gemini
}

export function addGeminiKey(key: string, label?: string): ApiKeyRecord {
  const store = readStore()
  const record: ApiKeyRecord = {
    id: generateId(),
    provider: 'gemini',
    key,
    label,
    createdAt: new Date().toISOString(),
    enabled: true,
  }
  store.providers.gemini.push(record)
  writeStore(store)
  return record
}

export function deleteGeminiKey(id: string): boolean {
  const store = readStore()
  const before = store.providers.gemini.length
  store.providers.gemini = store.providers.gemini.filter(k => k.id !== id)
  writeStore(store)
  return store.providers.gemini.length < before
}

export function setGeminiKeyEnabled(id: string, enabled: boolean): ApiKeyRecord | null {
  const store = readStore()
  const found = store.providers.gemini.find(k => k.id === id)
  if (!found) return null
  found.enabled = enabled
  writeStore(store)
  return found
}

export function getGeminiRotation(): RotationConfig {
  const store = readStore()
  return store.rotation.gemini
}

export function setGeminiRotationEnabled(enabled: boolean): RotationConfig {
  const store = readStore()
  store.rotation.gemini.enabled = enabled
  writeStore(store)
  return store.rotation.gemini
}

export function setGeminiRotationStrategy(strategy: 'hourly' | 'minute'): RotationConfig {
  const store = readStore()
  store.rotation.gemini.strategy = strategy
  writeStore(store)
  return store.rotation.gemini
}

export function getRotatingGeminiKey(date: Date = new Date()): string | null {
  const store = readStore()
  const keys = store.providers.gemini.filter(k => k.enabled)
  if (keys.length === 0) return null
  if (!store.rotation.gemini.enabled) {
    return keys[0].key
  }
  const strategy = store.rotation.gemini.strategy
  const baseIndex = strategy === 'minute'
    ? Math.floor(date.getTime() / 60000) // minute-wise rotation
    : Math.floor(date.getTime() / 3600000) // hourly rotation
  const idx = baseIndex % keys.length
  return keys[idx].key
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return key.slice(0, 4) + '****'
  return key.slice(0, 6) + '...' + key.slice(-4)
}