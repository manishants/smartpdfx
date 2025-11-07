import { NextResponse } from 'next/server';

export async function POST() {
  // Disabled: SuperAdmin login is now Supabase-only.
  return NextResponse.json({ ok: false, error: 'Endpoint disabled' }, { status: 410 });
}