import { requireSuperadmin } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const unauthorized = await requireSuperadmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const supabase = createClient();

    const title: string = body.title || '';
    const slug: string = body.slug || '';
    const content: string = body.content || '';
    const author: string = body.author || 'Admin';
    const status: string = body.status || 'draft';
    const imageUrl: string = body.featuredImage || body.imageUrl || '';
    const published: boolean = body.status === 'published' || body.published === true;
    const seoTitle: string | undefined = body.metaTitle || body.seoTitle || title;
    const metaDescription: string | undefined = body.metaDescription || '';
    const category: string | undefined = (Array.isArray(body.categories) && body.categories[0]) || body.category || 'general';
    const popular: boolean = !!body.popular;
    const layoutSettings: any = body.layoutSettings || null;
    const faqs: any[] = Array.isArray(body.faqs) ? body.faqs : [];
    const upiId: string | undefined = body.upiId || undefined;
    const paypalId: string | undefined = body.paypalId || undefined;
    const supportQrUrl: string | undefined = body.supportQrUrl || undefined;
    const supportLabel: string | undefined = body.supportLabel || undefined;

    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, slug, content' }), { status: 400 });
    }
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'featuredImage/imageUrl is required' }), { status: 400 });
    }

    // Pre-check for duplicate slug for clearer error message
    const { data: existing, error: existingErr } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .limit(1);
    if (!existingErr && Array.isArray(existing) && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Slug already exists. Please choose a different slug.' }), { status: 409 });
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          // Use lowercase keys to match Postgres normalized column names
          slug,
          title,
          content,
          author,
          imageurl: imageUrl,
          published,
          status,
          seotitle: seoTitle,
          metadescription: metaDescription,
          faqs,
          category,
          popular,
          layoutsettings: layoutSettings,
          upiid: upiId,
          paypalid: paypalId,
          supportqrurl: supportQrUrl,
          supportlabel: supportLabel,
        },
      ])
      .select('*')
      .single();

    if (error) {
      // Map common PG errors to clearer HTTP statuses
      const msg = error.message || 'Failed to create blog post';
      const isDuplicate = /duplicate key value/i.test(msg);
      return new Response(JSON.stringify({ error: msg }), { status: isDuplicate ? 409 : 500 });
    }
    return Response.json(data);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Invalid request' }), { status: 400 });
  }
}