import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import type { BlogComment } from '@/lib/types'

type CommentsStore = { comments: BlogComment[] }

const commentsStoreFile = path.join(process.cwd(), 'src', 'lib', 'commentsStore.json')

function ensureStore() {
  try {
    if (!fs.existsSync(commentsStoreFile)) {
      const initial: CommentsStore = { comments: [] }
      fs.writeFileSync(commentsStoreFile, JSON.stringify(initial, null, 2), 'utf-8')
    } else {
      const raw = fs.readFileSync(commentsStoreFile, 'utf-8')
      if (!raw.trim()) {
        const initial: CommentsStore = { comments: [] }
        fs.writeFileSync(commentsStoreFile, JSON.stringify(initial, null, 2), 'utf-8')
      }
    }
  } catch {}
}

export function readCommentsStore(): CommentsStore {
  ensureStore()
  try {
    const raw = fs.readFileSync(commentsStoreFile, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as CommentsStore
    return parsed?.comments ? parsed : { comments: [] }
  } catch {
    return { comments: [] }
  }
}

export function writeCommentsStore(store: CommentsStore) {
  fs.writeFileSync(commentsStoreFile, JSON.stringify(store, null, 2), 'utf-8')
}

export function getAllCommentsFs(): BlogComment[] {
  const { comments } = readCommentsStore()
  return comments.slice().sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
}

export function getApprovedCommentsFs(slug: string): BlogComment[] {
  const { comments } = readCommentsStore()
  return comments
    .filter(c => c.blog_slug === slug && c.status === 'approved')
    .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
}

export function addCommentFs(comment: Omit<BlogComment, 'id' | 'created_at' | 'updated_at' | 'status'> & Partial<Pick<BlogComment,'status'>>): BlogComment {
  const store = readCommentsStore()
  const newComment: BlogComment = {
    id: Date.now(),
    status: comment.status || 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blog_slug: comment.blog_slug,
    name: comment.name,
    email: comment.email,
    content: comment.content,
    link_url: comment.link_url ?? null,
  }
  store.comments.unshift(newComment)
  writeCommentsStore(store)
  return newComment
}

export function updateCommentStatusFs(id: number, status: 'approved' | 'spam' | 'pending'): boolean {
  const store = readCommentsStore()
  const idx = store.comments.findIndex(c => c.id === id)
  if (idx < 0) return false
  store.comments[idx].status = status
  store.comments[idx].updated_at = new Date().toISOString()
  writeCommentsStore(store)
  return true
}

export function deleteCommentByIdFs(id: number): boolean {
  const store = readCommentsStore()
  const before = store.comments.length
  store.comments = store.comments.filter(c => c.id !== id)
  writeCommentsStore(store)
  return store.comments.length < before
}