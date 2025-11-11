import { NextResponse } from 'next/server'
import { getAllSubscribers } from '@/lib/newsletterFs'

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v)
    const needsQuotes = /[,\n\"]/.test(s)
    const escaped = s.replace(/\"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }
  const headerLine = headers.join(',')
  const lines = rows.map(row => headers.map(h => escape(row[h])).join(','))
  return [headerLine, ...lines].join('\n')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') || 'json').toLowerCase()
  const subscribers = getAllSubscribers()

  if (format === 'csv') {
    const rows = subscribers.map(s => ({
      id: s.id,
      email: s.email,
      subscribed: s.subscribed ? 'true' : 'false',
      created_at: s.created_at ?? '',
      updated_at: s.updated_at ?? '',
    }))
    const csv = toCSV(rows)
    const filename = `newsletter_${new Date().toISOString().slice(0,10)}.csv`
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  const filename = `newsletter_${new Date().toISOString().slice(0,10)}.json`
  return NextResponse.json(
    { subscribers },
    {
      headers: {
        'content-disposition': `attachment; filename="${filename}"`,
      },
    }
  )
}