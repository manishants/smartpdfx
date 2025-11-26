import { NextResponse } from 'next/server';
import { UnlockPdfInputSchema, UnlockPdfOutputSchema } from '@/lib/types';
import { unlockPdf } from '@/lib/actions/unlock-pdf';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = UnlockPdfInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    const result = await unlockPdf(parsed.data);
    const out = UnlockPdfOutputSchema.safeParse(result);
    if (!out.success) {
      return NextResponse.json({ error: 'Unlocking failed' }, { status: 500 });
    }
    return NextResponse.json(out.data, { status: 200 });
  } catch (e: any) {
    const msg = String(e?.message || e || 'Unknown error');
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}