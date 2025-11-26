import { NextResponse } from 'next/server'
import { toggleSubscriber } from '@/lib/newsletterFs'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  let body: any = {}
  try {
    body = await req.json()
  } catch {}
  const nextUnsub = !!body?.unsubscribed
  const ok = toggleSubscriber(Number(id), nextUnsub)
  if (!ok) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}