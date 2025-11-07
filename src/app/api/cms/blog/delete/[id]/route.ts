import { requireSuperadmin } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;

  const idNum = Number(params.id);
  if (!idNum || Number.isNaN(idNum)) {
    return new Response(JSON.stringify({ error: 'Invalid blog id' }), { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', idNum);

  if (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete blog post' }), { status: 500 });
  }
  return new Response(null, { status: 204 });
}