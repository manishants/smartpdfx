import { NextRequest, NextResponse } from 'next/server'
import { getHeadingBySlug, setHeadingForSlug } from '@/lib/toolHeadingFs'
import { tools } from '@/lib/data'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const override = getHeadingBySlug(slug)
    const href = `/${slug}`
    const fallback = tools.find(t => t.href === href)?.title || null
    const heading = override || fallback || null
    return NextResponse.json({ heading })
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