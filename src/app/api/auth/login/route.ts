import { NextResponse } from 'next/server';
import { requireAdminApiKey } from '@/lib/api/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = body?.email || '';
    const password = body?.password || '';

    // Allow access via admin API key header as an alternative to credentials
    const keyError = requireAdminApiKey(req);
    if (!keyError) {
      const res = NextResponse.json({ ok: true, via: 'admin-key' });
      const secure = process.env.NODE_ENV === 'production';
      res.cookies.set('spx_admin', '1', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    // Support multiple credential pairs via *_2 envs
    const pairs = [
      { email: process.env.SUPERADMIN_EMAIL || '', password: process.env.SUPERADMIN_PASSWORD || '' },
      { email: process.env.SUPERADMIN_EMAIL_2 || '', password: process.env.SUPERADMIN_PASSWORD_2 || '' },
    ].filter(p => p.email && p.password);

    if (pairs.length === 0) {
      return NextResponse.json({ ok: false, error: 'Server credentials not configured' }, { status: 500 });
    }

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Missing credentials' }, { status: 400 });
    }

    const match = pairs.some(p => email === p.email && password === p.password);
    if (!match) {
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