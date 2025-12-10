import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getClientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for') || ''
  const xr = req.headers.get('x-real-ip') || ''
  return (xf.split(',')[0].trim() || xr || 'unknown')
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin') || ''
  const host = req.headers.get('host') || ''
  try {
    if (!origin) return true
    const u = new URL(origin)
    return u.host === host
  } catch { return false }
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  if (/AhrefsBot|SemrushBot/i.test(ua)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const url = req.nextUrl
  const pathname = url.pathname
  const method = req.method

  // Simple rate limiting per IP (burst control)
  try {
    const ip = getClientIp(req)
    const now = Date.now()
    const key = String(now - (now % 60000)) // minute bucket
    const g: any = globalThis as any
    g.__rate ||= {}
    g.__rate[key] ||= {}
    const bucket = g.__rate[key]
    bucket[ip] = (bucket[ip] || 0) + 1
    if (bucket[ip] > 300) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  } catch {}

  // Enforce same-origin on sensitive POST endpoints
  if (method === 'POST' && (/^\/api\/auth\//.test(pathname) || /^\/api\/keys\//.test(pathname))) {
    if (!isSameOrigin(req)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Server-side guard for admin/superadmin routes
  if ((pathname.startsWith('/superadmin') || pathname.startsWith('/admin')) && !pathname.startsWith('/superadmin/login')) {
    const cookie = req.cookies.get('smartpdfx_superadmin')?.value
    if (cookie !== 'true') {
      const loginUrl = new URL('/superadmin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|public).*)'],
}
