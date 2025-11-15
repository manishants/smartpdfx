import { NextRequest, NextResponse } from 'next/server'
import { getHeadingBySlug, setHeadingForSlug } from '@/lib/toolHeadingFs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const heading = getHeadingBySlug(slug)
    return NextResponse.json({ heading: heading || null })
  } catch (e) {
    return NextResponse.json({ heading: null }, { status: 200 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const heading = String(body?.heading || '').trim()
    if (!heading) {
      return NextResponse.json({ error: 'Heading is required' }, { status: 400 })
    }
    const updated = setHeadingForSlug(slug, heading)
    return NextResponse.json({ heading: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update heading' }, { status: 400 })
  }
}