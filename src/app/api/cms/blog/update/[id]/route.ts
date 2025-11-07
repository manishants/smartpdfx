import { requireSuperadmin } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;

  const idNum = Number(params.id);
  if (!idNum || Number.isNaN(idNum)) {
    return new Response(JSON.stringify({ error: 'Invalid blog id' }), { status: 400 });
  }

  try {
    const body = await req.json();
    const supabase = createClient();

    const payload: any = {};
    const map = (srcKey: string, destKey?: string) => {
      if (body[srcKey] !== undefined) payload[destKey || srcKey] = body[srcKey];
    };

    // Map known fields
    // Base fields (already lowercase in DB)
    map('title');
    map('content');
    map('author');
    map('slug');
    // Map camelCase to lowercase column keys per Postgres normalization
    if (body.featuredImage !== undefined || body.imageUrl !== undefined) {
      payload.imageurl = body.featuredImage ?? body.imageUrl;
    }
    if (body.status !== undefined) payload.status = body.status;
    if (body.published !== undefined) payload.published = !!body.published;
    payload.seotitle = body.metaTitle ?? body.seoTitle;
    payload.metadescription = body.metaDescription;
    payload.category = (Array.isArray(body.categories) && body.categories[0]) || body.category;
    if (body.popular !== undefined) payload.popular = !!body.popular;
    if (body.layoutSettings !== undefined) payload.layoutsettings = body.layoutSettings;
    if (Array.isArray(body.faqs)) payload.faqs = body.faqs;
    payload.upiid = body.upiId;
    payload.paypalid = body.paypalId;
    payload.supportqrurl = body.supportQrUrl;
    payload.supportlabel = body.supportLabel;

    const { data, error } = await supabase
      .from('blogs')
      .update(payload)
      .eq('id', idNum)
      .select('*')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message || 'Failed to update blog post' }), { status: 500 });
    }
    return Response.json(data);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Invalid request' }), { status: 400 });
  }
}