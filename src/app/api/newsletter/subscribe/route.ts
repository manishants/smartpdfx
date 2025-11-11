import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/newsletterFs';

export async function POST(req: Request) {
  try {
    const { email, category } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    addSubscriber(email, category || 'general');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}