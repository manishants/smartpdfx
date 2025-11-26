import { NextResponse } from 'next/server';
import { deleteBlogByIdOrSlug } from '@/lib/blogFs';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteBlogByIdOrSlug(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}