import { NextResponse } from 'next/server';

function isSupabaseDisabled() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const flag = process.env.NEXT_PUBLIC_DISABLE_SUPABASE === 'true';
  return flag || !url || !key;
}

export async function POST(req: Request) {
  // Dev-only fallback: enable cookie login when Supabase is disabled or not configured
  if (!isSupabaseDisabled()) {
    return NextResponse.json(
      { ok: false, error: 'Endpoint disabled (Supabase enabled)' },
      { status: 410 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const superEmail = String(process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
    const superPass = String(process.env.SUPERADMIN_PASSWORD || '');
    const altEmail = String(process.env.SUPERADMIN_EMAIL_2 || '').trim().toLowerCase();
    const altPass = String(process.env.SUPERADMIN_PASSWORD_2 || '');

    let role: 'superadmin' | 'admin' | null = null;
    if (superEmail && superPass && email === superEmail && password === superPass) {
      role = 'superadmin';
    } else if (altEmail && altPass && email === altEmail && password === altPass) {
      role = 'admin';
    }

    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Invalid credentials or not configured' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true, role });
    res.cookies.set('spx_admin', role, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Login error' },
      { status: 500 }
    );
  }
}