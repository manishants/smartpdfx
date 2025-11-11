import { NextResponse, type NextRequest } from 'next/server';

// Server-side guard: require superadmin cookie for all /superadmin routes except login
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/superadmin')) return NextResponse.next();

  const isLoginPath = pathname === '/superadmin/login';
  if (isLoginPath) return NextResponse.next();

  const cookie = req.cookies.get('smartpdfx_superadmin');
  const hasCookie = cookie?.value === 'true';

  if (hasCookie) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/superadmin/login';
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/superadmin/:path*'],
};