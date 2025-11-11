import { NextResponse } from 'next/server'
import { getAllBlogs, getBlogBySlug } from '@/lib/blogFs'
import { getAllCommentsFs } from '@/lib/commentsFs'

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v)
    const needsQuotes = /[,\n"]/ .test(s)
    const escaped = s.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }
  const headerLine = headers.join(',')
  const lines = rows.map(row => headers.map(h => escape(row[h])).join(','))
  return [headerLine, ...lines].join('\n')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') || 'json').toLowerCase()
  const withComments = url.searchParams.get('withComments') === '1' || url.searchParams.get('withComments') === 'true'
  const slugsParam = url.searchParams.get('slugs') || ''
  const slugs = slugsParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const all = getAllBlogs()
  const posts = slugs.length ? all.filter(p => slugs.includes(p.slug)) : all

  if (format === 'csv') {
    const rows = posts.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      author: p.author,
      date: p.date,
      published: p.published ? 'true' : 'false',
      category: p.category ?? '',
      seoTitle: p.seoTitle ?? '',
      metaDescription: p.metaDescription ?? '',
      imageUrl: p.imageUrl ?? '',
      popular: p.popular ? 'true' : 'false',
    }))
    const csv = toCSV(rows)
    const filename = `blogs_${new Date().toISOString().slice(0,10)}.csv`
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  if (!withComments) {
    const filename = `blogs_${new Date().toISOString().slice(0,10)}.json`
    return NextResponse.json(
      { posts },
      {
        headers: {
          'content-disposition': `attachment; filename="${filename}"`,
        },
      }
    )
  }

  const comments = getAllCommentsFs()
  const bySlug: Record<string, any[]> = {}
  for (const c of comments) {
    const key = c.blog_slug
    if (!key) continue
    ;(bySlug[key] = bySlug[key] || []).push(c)
  }

  const result = posts.map(p => ({ ...p, comments: bySlug[p.slug] || [] }))
  const filename = `blogs_with_comments_${new Date().toISOString().slice(0,10)}.json`
  return NextResponse.json(
    { posts: result },
    {
      headers: {
        'content-disposition': `attachment; filename="${filename}"`,
      },
    }
  )
}