import { NextResponse } from 'next/server'
import { updateCategory, deleteCategory } from '@/lib/cms/categoriesFs'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const body = await req.json()
    const updates = body || {}
    const updated = updateCategory(id, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json(updated, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const ok = deleteCategory(id)
    if (!ok) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return new Response(null, { status: 204 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete category' }, { status: 500 })
  }
}