import { NextResponse } from 'next/server'
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
  const slug = url.searchParams.get('slug') || ''
  const status = url.searchParams.get('status') || ''

  let comments = getAllCommentsFs()
  if (slug) comments = comments.filter(c => c.blog_slug === slug)
  if (status) comments = comments.filter(c => (c.status || '').toLowerCase() === status.toLowerCase())

  if (format === 'csv') {
    const rows = comments.map(c => ({
      id: c.id,
      blog_slug: c.blog_slug,
      name: c.name,
      email: c.email,
      content: c.content,
      link_url: c.link_url ?? '',
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
    const csv = toCSV(rows)
    const filename = `comments_${new Date().toISOString().slice(0,10)}.csv`
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  const filename = `comments_${new Date().toISOString().slice(0,10)}.json`
  return NextResponse.json(
    { comments },
    {
      headers: {
        'content-disposition': `attachment; filename="${filename}"`,
      },
    }
  )
}