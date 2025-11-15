import { NextRequest, NextResponse } from 'next/server'
import { getDescriptionBySlug, setDescriptionForSlug } from '@/lib/toolDescriptionFs'
import { tools } from '@/lib/data'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const override = getDescriptionBySlug(slug)
    const href = `/${slug}`
    const fallback = tools.find(t => t.href === href)?.description || null
    const description = override || fallback || null
    return NextResponse.json({ description })
  } catch (e) {
    return NextResponse.json({ description: null }, { status: 200 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const description = String(body?.description || '').trim()
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    const updated = setDescriptionForSlug(slug, description)
    return NextResponse.json({ description: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update description' }, { status: 400 })
  }
}