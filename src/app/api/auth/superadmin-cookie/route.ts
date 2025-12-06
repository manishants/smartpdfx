import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const allow = process.env.ALLOW_SUPERADMIN_COOKIE === 'true';
  if (!allow || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('smartpdfx_superadmin', 'true', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('smartpdfx_superadmin', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
  return res;
}
