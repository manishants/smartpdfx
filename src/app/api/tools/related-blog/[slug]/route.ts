import { NextRequest, NextResponse } from 'next/server'
import { getRelatedBlogUrl, setRelatedBlogUrl } from '@/lib/toolRelatedBlogFs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const relatedBlogUrl = getRelatedBlogUrl(slug)
    return NextResponse.json({ relatedBlogUrl })
  } catch (e) {
    return NextResponse.json({ relatedBlogUrl: null }, { status: 200 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const url = String(body?.relatedBlogUrl || '').trim()
    if (!url) {
      return NextResponse.json({ error: 'relatedBlogUrl is required' }, { status: 400 })
    }
    const updated = setRelatedBlogUrl(slug, url)
    return NextResponse.json({ relatedBlogUrl: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update related blog URL' }, { status: 400 })
  }
}