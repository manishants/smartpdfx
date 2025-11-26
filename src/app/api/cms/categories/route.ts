import { NextResponse } from 'next/server'
import { getAllCategories, createCategory } from '@/lib/cms/categoriesFs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = getAllCategories()
    return NextResponse.json({ categories }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name: string = (body.name || '').trim()
    const description: string = (body.description || '').trim()
    const slug: string | undefined = (body.slug || '').trim() || undefined
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const created = createCategory({ name, description, slug })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create category' }, { status: 500 })
  }
}