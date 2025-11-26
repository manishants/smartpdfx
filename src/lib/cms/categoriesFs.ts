import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import type { Category } from '@/types/cms'

type CategoriesStore = { categories: Category[] }

const storeFile = path.join(process.cwd(), 'src', 'lib', 'categoriesStore.json')

function ensureStore() {
  try {
    const dir = path.dirname(storeFile)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(storeFile)) {
      const initial: CategoriesStore = { categories: [] }
      fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(storeFile, 'utf-8')
      if (!raw.trim()) {
        const initial: CategoriesStore = { categories: [] }
        fs.writeFileSync(storeFile, JSON.stringify(initial, null, 2), 'utf-8')
      }
    }
  } catch {}
}

export function readCategoriesStore(): CategoriesStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as CategoriesStore
    return parsed?.categories ? parsed : { categories: [] }
  } catch {
    return { categories: [] }
  }
}

export function writeCategoriesStore(store: CategoriesStore) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getAllCategories(): Category[] {
  const { categories } = readCategoriesStore()
  return categories
}

function genId() {
  return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function slugify(name: string) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function createCategory(data: { name: string; description?: string; slug?: string }): Category {
  const store = readCategoriesStore()
  const name = (data.name || '').trim()
  const slug = (data.slug || slugify(name))
  const newCat: Category = {
    id: genId(),
    name,
    slug,
    description: (data.description || '').trim(),
    postCount: 0,
  }
  store.categories.unshift(newCat)
  writeCategoriesStore(store)
  return newCat
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const store = readCategoriesStore()
  const idx = store.categories.findIndex(c => c.id === id)
  if (idx === -1) return null
  const current = store.categories[idx]
  const next: Category = {
    ...current,
    ...updates,
  }
  if (updates.name && !updates.slug) {
    next.slug = slugify(updates.name)
  }
  store.categories[idx] = next
  writeCategoriesStore(store)
  return next
}

export function deleteCategory(id: string): boolean {
  const store = readCategoriesStore()
  const before = store.categories.length
  store.categories = store.categories.filter(c => c.id !== id)
  writeCategoriesStore(store)
  return store.categories.length < before
}