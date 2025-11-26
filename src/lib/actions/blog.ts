
'use server';

import { revalidatePath } from 'next/cache';
import type { BlogPost, Faq } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getBlogs(): Promise<BlogPost[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  return (data || []).map((post: any) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    imageUrl: post.imageurl ?? post.imageUrl,
    author: post.author,
    date: post.date,
    published: !!post.published,
    seoTitle: post.seotitle ?? post.seoTitle,
    metaDescription: post.metadescription ?? post.metaDescription,
    faqs: post.faqs || [],
    category: post.category,
    popular: !!post.popular,
    layoutSettings: post.layoutsettings ?? post.layoutSettings,
    upiId: post.upiid ?? post.upiId,
    supportQrUrl: post.supportqrurl ?? post.supportQrUrl,
    supportLabel: post.supportlabel ?? post.supportLabel,
  }));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    return null;
  }
  const p: any = data;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    imageUrl: p.imageurl ?? p.imageUrl,
    author: p.author,
    date: p.date,
    published: !!p.published,
    seoTitle: p.seotitle ?? p.seoTitle,
    metaDescription: p.metadescription ?? p.metaDescription,
    faqs: p.faqs || [],
    category: p.category,
    popular: !!p.popular,
    layoutSettings: p.layoutsettings ?? p.layoutSettings,
    upiId: p.upiid ?? p.upiId,
    supportQrUrl: p.supportqrurl ?? p.supportQrUrl,
    supportLabel: p.supportlabel ?? p.supportLabel,
  } as BlogPost;
}

export async function createPost(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a post.' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const author = formData.get('author') as string;
  const image = formData.get('image') as File;
  const slug = formData.get('slug') as string;
  const seoTitle = formData.get('seoTitle') as string;
  const metaDescription = formData.get('metaDescription') as string;
  const published = formData.get('published') === 'true';
  const upiId = formData.get('upiId') as string | null;
  const supportLabel = (formData.get('supportLabel') as string | null) || null;
  const supportQr = formData.get('supportQr') as File | null;

  const faqs: Faq[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith('faq-question-')) {
      const index = key.split('-').pop();
      const answer = formData.get(`faq-answer-${index}`) as string;
      if (value && answer) {
        faqs.push({ question: value as string, answer });
      }
    }
  });

  if (!title || !content || !author || !image) {
    return { error: 'Title, Content, Author, and Image are required.' };
  }

  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const imageName = `${finalSlug}-${Date.now()}`;
  
  const { data: imageData, error: imageError } = await supabase.storage
    .from('blogs')
    .upload(imageName, image);

  if (imageError) {
    console.error('Error uploading image:', imageError);
    return { error: 'Failed to upload image. Make sure you have a "blogs" bucket in your Supabase Storage.' };
  }

  const { data: imageUrlData } = supabase.storage
    .from('blogs')
    .getPublicUrl(imageData.path);
    
  const imageUrl = imageUrlData.publicUrl;

  // Optional support QR upload
  let supportQrUrl: string | undefined = undefined;
  if (supportQr && (supportQr as any).size > 0) {
    const supportName = `support-${finalSlug}-${Date.now()}`;
    const { data: supportData, error: supportErr } = await supabase.storage
      .from('blogs')
      .upload(supportName, supportQr);
    if (!supportErr && supportData) {
      const { data: supportUrlData } = supabase.storage
        .from('blogs')
        .getPublicUrl(supportData.path);
      supportQrUrl = supportUrlData.publicUrl;
    } else {
      console.error('Error uploading support QR:', supportErr);
    }
  }

  const payload: any = {
    slug: finalSlug,
    title,
    content,
    author,
    date: new Date().toISOString(),
    imageurl: imageUrl,
    published,
    seotitle: seoTitle || title,
    metadescription: metaDescription,
    faqs,
    upiid: upiId || undefined,
    supportqrurl: supportQrUrl,
    supportlabel: supportLabel || undefined,
  };
  
  const { error: insertError } = await supabase
    .from('blogs')
    .insert([payload]);

  if (insertError) {
    console.error('Error creating post:', insertError);
    if ((insertError as any).code === '42P01') { // '42P01' undefined_table
        return { error: 'The "blogs" table does not exist. Please create it in your Supabase project.' };
    }
    return { error: 'Failed to create blog post in the database.' };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/superadmin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${finalSlug}`);

  return { success: 'Blog post created successfully!' };
}

export async function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}
