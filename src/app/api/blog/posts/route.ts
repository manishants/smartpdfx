import { NextResponse } from 'next/server'
import { getAllBlogs } from '@/lib/blogFs'

function toExcerpt(html: string, len = 160) {
  const text = html.replace(/<[^>]*>?/gm, '').trim()
  return text.length > len ? text.slice(0, len) + '…' : text
}

export async function GET() {
  const data = getAllBlogs()

  const posts = (data || []).map((p: any) => {
    const status = p.status || (p.published ? 'published' : 'draft')
    return {
      id: p?.id?.toString?.() || p.slug,
      title: p.title,
      slug: p.slug,
      excerpt: toExcerpt(p.content || ''),
      content: p.content,
      featuredImage: p.imageUrl,
      author: p.author || 'Unknown',
      metaTitle: p.seoTitle ?? p.title,
      metaDescription: p.metaDescription ?? '',
      category: p.category || 'general',
      tags: Array.isArray(p.tags) ? p.tags : [],
      status: status === 'review' ? 'draft' : status,
      views: Number(p.views || 0),
      likes: Number(p.likes || 0),
      comments: Number(p.comments || 0),
      publishedAt: p.published ? p.date : null,
      createdAt: p.date,
      updatedAt: p.date,
      layoutSettings: p.layoutSettings,
    }
  })

  return NextResponse.json({ posts })
}