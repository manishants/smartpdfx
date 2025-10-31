import fs from 'fs'
import path from 'path'

export type PageSection = {
  id: string
  type: string
  title: string
  content: string
  order: number
  isVisible: boolean
  settings: Record<string, any>
}

export type StoredPage = {
  id: string
  slug: string
  title: string
  description?: string
  status: 'published' | 'draft' | 'archived'
  lastModified?: string
  sections: PageSection[]
}

type StoreShape = Record<string, StoredPage>

const storeFile = path.join(process.cwd(), 'src', 'lib', 'pageStore.json')

const defaultStore: StoreShape = {
  'compress-pdf': {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    status: 'published',
    sections: [
      {
        id: 's1',
        type: 'hero',
        title: 'Compress PDF Files Online',
        content: 'Reduce your PDF file size by up to 90% while maintaining quality. Fast, secure, and free.',
        order: 1,
        isVisible: true,
        settings: { backgroundColor: '#f8f9fa', textAlign: 'center' },
      },
      {
        id: 's2',
        type: 'features',
        title: 'Why Choose Our PDF Compressor',
        content: 'Fast compression, High quality, Secure processing, No file limits',
        order: 2,
        isVisible: true,
        settings: { columns: 2, showIcons: true },
      },
    ],
  },
  'merge-pdf': {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    status: 'published',
    sections: [
      {
        id: 's3',
        type: 'hero',
        title: 'Merge PDF Files Online',
        content: 'Combine multiple PDF documents into a single file quickly and easily.',
        order: 1,
        isVisible: true,
        settings: { backgroundColor: '#ffffff', textAlign: 'left' },
      },
    ],
  },
  'about': {
    id: 'about',
    slug: 'about',
    title: 'About Us',
    description: 'Learn more about SmartPDFx and our mission',
    status: 'published',
    sections: [
      {
        id: 's4',
        type: 'content',
        title: 'About SmartPDFx',
        content: 'SmartPDFx is a leading platform for PDF tools and document processing.',
        order: 1,
        isVisible: true,
        settings: { layout: 'single-column' },
      },
    ],
  },
}

function ensureStore() {
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify(defaultStore, null, 2), 'utf-8')
    return
  }
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as StoreShape
    if (!parsed || Object.keys(parsed).length === 0) {
      fs.writeFileSync(storeFile, JSON.stringify(defaultStore, null, 2), 'utf-8')
    }
  } catch {
    fs.writeFileSync(storeFile, JSON.stringify(defaultStore, null, 2), 'utf-8')
  }
}

function readStore(): StoreShape {
  ensureStore()
  try {
    const raw = fs.readFileSync(storeFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}')
    return parsed || {}
  } catch {
    return {}
  }
}

function writeStore(store: StoreShape) {
  fs.writeFileSync(storeFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getStoredPage(slug: string): StoredPage | null {
  const store = readStore()
  return store[slug] || null
}

export function setStoredPage(slug: string, data: Partial<StoredPage>): StoredPage {
  const store = readStore()
  const current: StoredPage = store[slug] || {
    id: slug,
    slug,
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    status: 'published',
    sections: [],
  }
  const next: StoredPage = {
    ...current,
    ...data,
    slug, // enforce key consistency
  }
  store[slug] = next
  writeStore(store)
  return next
}

export function mergeFilesystemPages(fsPages: StoredPage[]): StoredPage[] {
  const store = readStore()
  
  return fsPages.map((p) => {
    const stored = store[p.slug]
    
    if (!stored) {
      return { ...p, sections: p.sections || [] }
    }
    
    const merged = {
      ...p,
      title: stored.title || p.title,
      description: stored.description || p.description,
      status: stored.status || p.status,
      lastModified: p.lastModified || stored.lastModified || new Date().toISOString(),
      sections: Array.isArray(stored.sections) ? stored.sections : [],
    }
    
    return merged
  })
}