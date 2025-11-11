import { NextResponse } from 'next/server'
import { getAllSubscribers } from '@/lib/newsletterFs'

function toCsv(rows: { email: string, category: string, unsubscribed: boolean, created_at: string }[]) {
  const header = 'email,category,unsubscribed,created_at\n'
  const body = rows.map(r => [r.email, r.category, r.unsubscribed ? 'true' : 'false', r.created_at].join(',')).join('\n')
  return header + body
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const all = getAllSubscribers()
  const rows = all
    .filter(s => !category || category === 'all' || s.category === category)
    .map(s => ({ email: s.email, category: s.category, unsubscribed: s.unsubscribed, created_at: s.created_at }))
  const csv = toCsv(rows)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"'
    }
  })
}