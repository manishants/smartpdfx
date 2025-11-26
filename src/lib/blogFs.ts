import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import type { BlogPost } from '@/lib/types'

type BlogStore = { posts: BlogPost[] }

const blogStoreFile = path.join(process.cwd(), 'src', 'lib', 'blogStore.json')
const blogsDir = path.join(process.cwd(), 'public', 'blogs')

function ensureBlogStore() {
  try {
    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true })
    }
    if (!fs.existsSync(blogStoreFile)) {
      const initial: BlogStore = { posts: [] }
      fs.writeFileSync(blogStoreFile, JSON.stringify(initial, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(blogStoreFile, 'utf-8')
      if (!raw.trim()) {
        const initial: BlogStore = { posts: [] }
        fs.writeFileSync(blogStoreFile, JSON.stringify(initial, null, 2), 'utf-8')
      }
    }
  } catch {}
}

export function readBlogStore(): BlogStore {
  ensureBlogStore()
  try {
    const raw = fs.readFileSync(blogStoreFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as BlogStore
    return parsed?.posts ? parsed : { posts: [] }
  } catch {
    return { posts: [] }
  }
}

export function writeBlogStore(store: BlogStore) {
  fs.writeFileSync(blogStoreFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getAllBlogs(): BlogPost[] {
  const { posts } = readBlogStore()
  return posts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const { posts } = readBlogStore()
  return posts.find(p => p.slug === slug) || null
}

export function upsertBlog(post: BlogPost): BlogPost {
  const store = readBlogStore()
  const idx = store.posts.findIndex(p => p.slug === post.slug)
  if (idx >= 0) {
    store.posts[idx] = post
  } else {
    store.posts.push(post)
  }
  writeBlogStore(store)
  return post
}

export function deleteBlogByIdOrSlug(idOrSlug: string): boolean {
  const store = readBlogStore()
  const before = store.posts.length
  store.posts = store.posts.filter(p => (p.id?.toString?.() !== idOrSlug) && (p.slug !== idOrSlug))
  writeBlogStore(store)
  return store.posts.length < before
}

// Save uploaded image File to public/blogs and return a web path like /blogs/filename.ext
export async function saveBlogImage(file: File, slug?: string): Promise<string> {
  // Preserve original filename for SEO; avoid renaming on upload
  ensureBlogStore()
  const arrayBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrayBuf)
  const originalName = (((file as any).name || '').split(/[\\/]/).pop() || 'image').trim()
  const ext = path.extname(originalName) || (file.type?.includes('png') ? '.png' : file.type?.includes('jpeg') ? '.jpg' : file.type?.includes('webp') ? '.webp' : '.img')
  const base = ext ? originalName.slice(0, -ext.length) : originalName
  let filename = `${base}${ext}`
  let fullPath = path.join(blogsDir, filename)
  let counter = 1
  // If a file with the same name exists, append a numeric suffix
  while (fs.existsSync(fullPath)) {
    filename = `${base}-${counter}${ext}`
    fullPath = path.join(blogsDir, filename)
    counter += 1
    if (counter > 1000) break
  }
  await fsp.writeFile(fullPath, buf)
  return `/blogs/${filename}`
}