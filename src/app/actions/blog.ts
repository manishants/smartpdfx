
'use server';

import { revalidatePath } from 'next/cache';
import type { BlogPost, Faq } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// When Supabase is disabled or credentials are missing, serve local fallback data
const isSupabaseDisabled = () =>
  process.env.NEXT_PUBLIC_DISABLE_SUPABASE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fallbackPosts: BlogPost[] = [
  {
    id: 'local-1',
    slug: 'sample-post',
    title: 'Sample Post (Offline)',
    content: `
      <p>This is an offline sample post used when Supabase is disabled.</p>
      <h2>Getting Started</h2>
      <p>Use the admin editor to add headings, lists, and links.</p>
      <h3>Features</h3>
      <ul><li>Breadcrumbs at top</li><li>Sticky right sidebar</li><li>Support popup</li></ul>
    `,
    imageUrl: '/hero_section_smartpdfx.webp',
    author: 'Admin',
    date: new Date().toISOString(),
    published: true,
    seoTitle: 'Sample Post (Offline)',
    metaDescription: 'Offline sample post for development without Supabase.',
    faqs: [],
    category: 'general',
    popular: false,
    layoutSettings: {
      showBreadcrumbs: true,
      leftSidebarEnabled: true,
      rightSidebarEnabled: true,
      leftSticky: true,
      tocFontSize: 'text-sm',
      tocH3Indent: 12,
      tocHoverColor: 'hover:text-primary',
    },
    upiId: 'manishants@ybl',
    paypalId: 'manishants@gmail.com',
    supportQrUrl: '/qr.jpg',
    supportLabel: 'Support The Author',
  }
];

export async function getBlogs(): Promise<BlogPost[]> {
  if (isSupabaseDisabled()) {
    // Offline fallback
    return fallbackPosts;
  }

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      return fallbackPosts;
    }

    return (data || []).map((post: any) => ({
      ...post,
      faqs: post.faqs || [],
    }));
  } catch (e) {
    console.error('Supabase unavailable, using fallback posts:', e);
    return fallbackPosts;
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  if (isSupabaseDisabled()) {
    return fallbackPosts.find(p => p.slug === slug) || null;
  }

  try {
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
    return data as BlogPost;
  } catch (e) {
    console.error('Supabase error when fetching post:', e);
    // Do not default to a sample post; only return a matching fallback when available
    return fallbackPosts.find(p => p.slug === slug) || null;
  }
}

export async function createPost(formData: FormData) {
  if (isSupabaseDisabled()) {
    // Simulate success when offline
    return { success: 'Supabase disabled: post not persisted (development mode).' };
  }

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
  const paypalId = formData.get('paypalId') as string | null;
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
  if (supportQr && supportQr.size > 0) {
    const qrName = `support-${finalSlug}-${Date.now()}`;
    const { data: qrData, error: qrError } = await supabase.storage
      .from('blogs')
      .upload(qrName, supportQr);
    if (!qrError && qrData) {
      const { data: qrPublic } = supabase.storage
        .from('blogs')
        .getPublicUrl(qrData.path);
      supportQrUrl = qrPublic.publicUrl;
    } else {
      console.error('Error uploading support QR:', qrError);
    }
  }

  const newPost: Omit<BlogPost, 'id' | 'created_at'> = {
    slug: finalSlug,
    title,
    content,
    author,
    date: new Date().toISOString(),
    imageUrl: imageUrl,
    published,
    seoTitle: seoTitle || title,
    metaDescription,
    faqs,
    upiId: upiId || undefined,
    paypalId: paypalId || undefined,
    supportQrUrl,
    supportLabel: supportLabel || undefined,
  };
  
  const { error: insertError } = await supabase
    .from('blogs')
    .insert([newPost]);

  if (insertError) {
    console.error('Error creating post:', insertError);
    if (insertError.code === '42P01') { // '42P01' is the code for 'undefined_table'
        return { error: 'The "blogs" table does not exist. Please create it in your Supabase project.' };
    }
    return { error: 'Failed to create blog post in the database.' };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/blog');
  revalidatePath(`/blog/${finalSlug}`);

  return { success: 'Blog post created successfully!' };
}

// Paginated blogs fetch
export async function getBlogsPaginated(page = 1, perPage = 6, onlyPublished = true): Promise<{
  posts: BlogPost[];
  total: number;
  page: number;
  perPage: number;
}> {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(perPage) || 6);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  if (isSupabaseDisabled()) {
    const source = onlyPublished ? fallbackPosts.filter(p => p.published) : fallbackPosts;
    return {
      posts: source.slice(from, to + 1),
      total: source.length,
      page: currentPage,
      perPage: pageSize,
    };
  }

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });

    if (onlyPublished) {
      query = query.eq('published', true);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching paginated blogs:', error);
      const source = onlyPublished ? fallbackPosts.filter(p => p.published) : fallbackPosts;
      return {
        posts: source.slice(from, to + 1),
        total: source.length,
        page: currentPage,
        perPage: pageSize,
      };
    }

    const posts: BlogPost[] = (data || []).map((post: any) => ({
      ...post,
      faqs: post.faqs || [],
    }));

    return {
      posts,
      total: typeof count === 'number' ? count : posts.length,
      page: currentPage,
      perPage: pageSize,
    };
  } catch (e) {
    console.error('Supabase unavailable, using fallback posts (paginated):', e);
    const source = onlyPublished ? fallbackPosts.filter(p => p.published) : fallbackPosts;
    return {
      posts: source.slice(from, to + 1),
      total: source.length,
      page: currentPage,
      perPage: pageSize,
    };
  }
}
