import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  let res
  const numericId = Number(id)
  if (!Number.isNaN(numericId)) {
    res = await supabase.from('blogs').delete().eq('id', numericId)
  } else {
    res = await supabase.from('blogs').delete().eq('slug', id)
  }

  if (res.error) {
    console.error('Error deleting blog post:', res.error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}