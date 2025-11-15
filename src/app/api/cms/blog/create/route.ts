import { NextResponse } from 'next/server';
import type { BlogPost } from '@/lib/types';
import { readBlogStore, upsertBlog } from '@/lib/blogFs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title: string = (body.title || '').trim();
    const slug: string = (body.slug || '').trim();
    const content: string = (body.content || '').trim();
    const author: string = (body.author || 'Admin').trim();
    const status: string = body.status || 'draft';
    const imageUrl: string = (body.featuredImage || body.imageUrl || '').trim();
    const published: boolean = status === 'published' || body.published === true;
    const seoTitle: string | undefined = body.metaTitle || body.seoTitle || title;
    const metaDescription: string | undefined = body.metaDescription || body.excerpt || '';
    const category: string | undefined = (Array.isArray(body.categories) && body.categories[0]) || body.category || 'general';
    const popular: boolean = !!body.popular;
    const layoutSettings: any = body.layoutSettings || null;
    const manualToc: any[] = Array.isArray(body.manualToc) ? body.manualToc : [];
    const faqs: any[] = Array.isArray(body.faqs) ? body.faqs : [];
    const upiId: string | undefined = body.upiId || undefined;
    const supportQrUrl: string | undefined = body.supportQrUrl || undefined;
    const supportLabel: string | undefined = body.supportLabel || undefined;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, content' }, { status: 400 });
    }

    // Duplicate slug check in local JSON store
    const store = readBlogStore();
    if (store.posts.some(p => p.slug === slug)) {
      return NextResponse.json({ error: 'Slug already exists. Please choose a different slug.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const post: BlogPost = {
      id: Date.now(),
      slug,
      title,
      content,
      imageUrl: imageUrl || '',
      author,
      date: now,
      published,
      seoTitle,
      metaDescription,
      faqs,
      category,
      popular,
      layoutSettings,
      manualToc,
      upiId,
      supportQrUrl,
      supportLabel,
    };

    const saved = upsertBlog(post);
    return NextResponse.json(saved, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid request' }, { status: 400 });
  }
}