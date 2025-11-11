import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim();
    const password = String(body?.password ?? '').trim();

    const pairs: Array<[string | undefined, string | undefined]> = [
      [process.env.SUPERADMIN_EMAIL, process.env.SUPERADMIN_PASSWORD],
      [process.env.SUPERADMIN_EMAIL_2, process.env.SUPERADMIN_PASSWORD_2],
    ];

    const valid = pairs.some(([e, p]) => {
      if (!p) return false;
      // Email optional: if provided, must match
      if (e && email && e !== email) return false;
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