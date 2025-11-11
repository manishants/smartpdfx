import { NextResponse } from 'next/server'
import { deleteBlogByIdOrSlug } from '@/lib/blogFs'

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const ok = deleteBlogByIdOrSlug(id)
  if (!ok) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}