import { NextResponse, type NextRequest } from 'next/server';

// No server-side cookie guard; client-side checks handle Supabase auth.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/superadmin')) return NextResponse.next();
  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*'],
};