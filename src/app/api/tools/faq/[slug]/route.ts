import { NextRequest, NextResponse } from 'next/server'
import { getFaqBySlug, setFaqForSlug } from '@/lib/faqFs'
import { toolFaqFallback } from '@/lib/tool-faq'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const stored = getFaqBySlug(slug)
    const fallback = toolFaqFallback[slug] || []
    const faqs = (stored && stored.length > 0) ? stored : (Array.isArray(fallback) ? fallback : [])
    return NextResponse.json({ faqs })
  } catch (e) {
    return NextResponse.json({ faqs: [] }, { status: 200 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await req.json()
    const items = Array.isArray(body?.faqs) ? body.faqs : []
    const updated = setFaqForSlug(slug, items)
    return NextResponse.json({ faqs: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update FAQs' }, { status: 400 })
  }
}