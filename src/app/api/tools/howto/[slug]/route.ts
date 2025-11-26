import { NextRequest, NextResponse } from 'next/server'
import { getHowtoBySlug, setHowtoForSlug } from '@/lib/howtoFs'
import { toolHowtoFallback } from '@/lib/tool-howto'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const stored = getHowtoBySlug(slug)
    const fallback = toolHowtoFallback[slug] || null
    const howto = stored || (fallback || null)
    return NextResponse.json({ howto })
  } catch (e) {
    return NextResponse.json({ howto: null }, { status: 200 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const data = body?.howto
    if (!data || !Array.isArray(data?.steps)) {
      return NextResponse.json({ error: 'Invalid HowTo payload' }, { status: 400 })
    }
    const updated = setHowtoForSlug(slug, data)
    return NextResponse.json({ howto: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update HowTo' }, { status: 400 })
  }
}