import { NextResponse } from 'next/server'
import { saveBlogImage } from '@/lib/blogFs'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const slug = String(form.get('slug') || '').trim()

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    // Preserve the original filename; slug is ignored for naming
    const url = await saveBlogImage(file, slug || undefined)
    const name = decodeURIComponent(url.split('/').pop() || '')
    const alt = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
    return NextResponse.json({ url, name, alt })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}