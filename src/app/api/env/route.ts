import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const disableRaw = process.env.NEXT_PUBLIC_DISABLE_SUPABASE || undefined;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;

  const isDisabled = (disableRaw === 'true') || !url || !anon;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    disableFlagRaw: disableRaw ?? null,
    isSupabaseDisabled: isDisabled,
    supabaseConfigured: Boolean(url && anon),
    supabaseUrlPresent: Boolean(url),
    anonKeyPresent: Boolean(anon),
    notes: [
      'disableFlagRaw must be the string "true" to disable.',
      'If URL or ANON key are missing, Supabase is treated as disabled.',
    ],
  }, { status: 200 });
}