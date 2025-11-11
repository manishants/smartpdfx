import { NextResponse } from 'next/server'
import { heartbeat } from '@/lib/analyticsFs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const visitorId = typeof body?.visitorId === 'string' ? body.visitorId : 'unknown'
    const page = typeof body?.page === 'string' ? body.page : '/'
    const live = heartbeat({ visitorId, page, now: Date.now(), ttlSeconds: 90 })
    return NextResponse.json({ ok: true, live }, { status: 200 })
  } catch (err: any) {
    return new NextResponse('Failed to heartbeat', { status: 500 })
  }
}