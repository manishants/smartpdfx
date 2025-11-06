import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = body?.email || '';
    const password = body?.password || '';

    const allowedEmail = process.env.SUPERADMIN_EMAIL || '';
    const allowedPassword = process.env.SUPERADMIN_PASSWORD || '';

    if (!allowedEmail || !allowedPassword) {
      return NextResponse.json({ ok: false, error: 'Server credentials not configured' }, { status: 500 });
    }

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
    }

    if (email !== allowedEmail || password !== allowedPassword) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    const secure = process.env.NODE_ENV === 'production';
    res.cookies.set('spx_admin', '1', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}