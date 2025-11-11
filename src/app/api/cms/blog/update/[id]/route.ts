import { NextResponse } from 'next/server';
import type { BlogPost } from '@/lib/types';
import { readBlogStore, writeBlogStore, upsertBlog } from '@/lib/blogFs';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const idParam = params.id;

  try {
    const body = await req.json();
    const store = readBlogStore();
    const existing = store.posts.find(
      (p) => p.id?.toString() === idParam || p.slug === idParam
    );
    if (!existing) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const newTitle = body.title !== undefined ? String(body.title) : existing.title;
    const newExcerpt = body.excerpt !== undefined ? String(body.excerpt) : (existing as any).excerpt || '';
    const newSeoTitle = (body.metaTitle !== undefined ? body.metaTitle : body.seoTitle);
    const newMetaDescription = body.metaDescription !== undefined ? String(body.metaDescription) : (existing.metaDescription || newExcerpt);

    const updated: BlogPost = {
      ...existing,
      title: newTitle,
      content: body.content !== undefined ? String(body.content) : existing.content,
      author: body.author !== undefined ? String(body.author) : existing.author,
      slug: body.slug !== undefined ? String(body.slug) : existing.slug,
      imageUrl:
        body.featuredImage !== undefined || body.imageUrl !== undefined
          ? (String(body.featuredImage ?? body.imageUrl || '')).trim()
          : existing.imageUrl || '',
      published:
        body.published !== undefined
          ? !!body.published
          : existing.published,
      seoTitle: newSeoTitle !== undefined ? newSeoTitle : (existing.seoTitle || newTitle),
      metaDescription: newMetaDescription,
      category:
        (Array.isArray(body.categories) && body.categories[0]) || body.category !== undefined
          ? ((Array.isArray(body.categories) && body.categories[0]) || body.category)
          : existing.category,
      popular:
        body.popular !== undefined ? !!body.popular : existing.popular,
      layoutSettings:
        body.layoutSettings !== undefined ? body.layoutSettings : existing.layoutSettings,
      faqs: Array.isArray(body.faqs) ? body.faqs : existing.faqs,
      upiId: body.upiId !== undefined ? body.upiId : existing.upiId,
      paypalId: body.paypalId !== undefined ? body.paypalId : existing.paypalId,
      supportQrUrl: body.supportQrUrl !== undefined ? body.supportQrUrl : existing.supportQrUrl,
      supportLabel: body.supportLabel !== undefined ? body.supportLabel : existing.supportLabel,
      date: existing.date, // preserve original date
    };

    const saved = upsertBlog(updated);
    return NextResponse.json(saved, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}