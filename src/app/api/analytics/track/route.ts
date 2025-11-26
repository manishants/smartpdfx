import { NextResponse } from 'next/server'
import { trackView } from '@/lib/analyticsFs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const page = typeof body?.page === 'string' ? body.page : '/'
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId : 'unknown'
    const ua = req.headers.get('user-agent') || ''
    // Privacy-first: do not read or store IPs
    trackView({ page, visitorId, timestamp: Date.now() })

    return NextResponse.json({ ok: true, page, visitorId, ua }, { status: 200 })
  } catch (err: any) {
    return new NextResponse('Failed to track', { status: 500 })
  }
}