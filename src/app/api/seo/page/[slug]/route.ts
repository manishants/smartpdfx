import { NextResponse } from 'next/server'
import { getPageSEO, setPageSEO } from '@/lib/seoStore'

type Body = {
  title?: string
  description?: string
  keywords?: string[]
}

export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const seo = getPageSEO(`/${slug}`)
  return NextResponse.json({ seo })
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  const body = (await req.json()) as Body
  const updated = setPageSEO(`/${slug}`, {
    title: body.title,
    description: body.description,
    keywords: Array.isArray(body.keywords) ? body.keywords : [],
  })
  return NextResponse.json({ seo: updated })
}