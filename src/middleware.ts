import { NextResponse } from 'next/server'

const LOCALE_REGEX = /^(en|hi|es|fr|de)$/

export function middleware(req: Request) {
  const url = new URL(req.url)
  const { pathname } = url
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return NextResponse.next()

  const maybeLocale = parts[0]
  if (!LOCALE_REGEX.test(maybeLocale)) return NextResponse.next()

  // Keep localized Tools route; rewrite other localized paths to root equivalents
  if (parts[1] === 'tools') {
    return NextResponse.next()
  }

  // Rewrite /{locale}/x/y -> /x/y (URL remains localized)
  const rest = parts.slice(1).join('/')
  const target = `/${rest}`
  url.pathname = target
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next|assets|api).*)'],
}