import { NextResponse, type NextRequest } from 'next/server';

// Guard all /superadmin routes with a simple cookie-based session
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to superadmin routes
  if (!pathname.startsWith('/superadmin')) {
    return NextResponse.next();
  }

  // Allow the login page and its stylesheet to load without a session
  if (pathname === '/superadmin/login' || pathname === '/superadmin/superadmin.css') {
    return NextResponse.next();
  }

  // Allow open mode if explicitly enabled via public env (default is closed)
  const open = process.env.NEXT_PUBLIC_SUPERADMIN_OPEN && process.env.NEXT_PUBLIC_SUPERADMIN_OPEN !== 'false';
  if (open) {
    return NextResponse.next();
  }

  const session = req.cookies.get('spx_admin');
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/superadmin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*'],
};