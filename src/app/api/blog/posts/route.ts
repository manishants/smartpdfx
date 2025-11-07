import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { BlogPost } from '@/lib/types'

function toExcerpt(html: string, len = 160) {
  const text = html.replace(/<[^>]*>?/gm, '').trim()
  return text.length > len ? text.slice(0, len) + '…' : text
}

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from('blogs')
    .select('*')

  if (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ posts: [] })
  }

  const sorted = ((data as BlogPost[]) || []).sort((a, b) => {
    const ad = new Date(a.date || '').getTime()
    const bd = new Date(b.date || '').getTime()
    return bd - ad
  })

  // Shape tailored for CMS consumption: featuredImage, author string, category string
  const posts = sorted.map((p: any) => ({
    id: p?.id?.toString?.() || p.slug,
    title: p.title,
    slug: p.slug,
    excerpt: toExcerpt(p.content || ''),
    content: p.content,
    featuredImage: p.imageUrl ?? p.imageurl,
    author: p.author || 'Unknown',
    metaTitle: p.seoTitle ?? p.seotitle ?? p.title,
    metaDescription: p.metaDescription ?? p.metadescription ?? '',
    category: p.category || 'general',
    tags: [] as string[],
    status: p.published ? 'published' : 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    publishedAt: p.published ? p.date : null,
    createdAt: p.date,
    updatedAt: p.date,
  }))

  return NextResponse.json({ posts })
}