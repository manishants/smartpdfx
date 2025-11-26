import { NextResponse } from 'next/server';
import { LOCAL_AUTH_DEFAULTS } from '@/config/local-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '').trim();

    const envEmail1 = process.env.SUPERADMIN_EMAIL ?? LOCAL_AUTH_DEFAULTS.SUPERADMIN_EMAIL;
    const envPass1 = process.env.SUPERADMIN_PASSWORD ?? LOCAL_AUTH_DEFAULTS.SUPERADMIN_PASSWORD;
    const envEmail2 = process.env.SUPERADMIN_EMAIL_2 ?? LOCAL_AUTH_DEFAULTS.SUPERADMIN_EMAIL_2;
    const envPass2 = process.env.SUPERADMIN_PASSWORD_2 ?? LOCAL_AUTH_DEFAULTS.SUPERADMIN_PASSWORD_2;

    const pairs: Array<[string | undefined, string | undefined]> = [
      [envEmail1 || undefined, envPass1 || undefined],
      [envEmail2 || undefined, envPass2 || undefined],
    ];

    const valid = pairs.some(([e, p]) => {
      if (!p) return false;
      // Email optional: if provided, must match
      if (e && email && e.toLowerCase() !== email) return false;
      return password === p;
    });

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, role: 'superadmin' });
    res.cookies.set('smartpdfx_superadmin', 'true', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Login failed' }, { status: 400 });
  }
}