
'use server';

import { revalidatePath } from 'next/cache';
import type { BlogPost, Faq } from '@/lib/types';
import { getAllBlogs as fsGetAllBlogs, getBlogBySlug as fsGetBlogBySlug, upsertBlog as fsUpsertBlog, saveBlogImage as fsSaveBlogImage } from '@/lib/blogFs';

// Local fallback sample when store is empty

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
  const local = fsGetAllBlogs();
  return local.length > 0 ? local : fallbackPosts;
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const local = fsGetBlogBySlug(slug);
  if (local) return local;
  return fallbackPosts.find(p => p.slug === slug) || null;
}

export async function createPost(formData: FormData) {

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
  const imageUrl = await fsSaveBlogImage(image, finalSlug);

  // Optional support QR upload to local filesystem
  let supportQrUrl: string | undefined = undefined;
  if (supportQr && supportQr.size > 0) {
    try {
      supportQrUrl = await fsSaveBlogImage(supportQr, `support-${finalSlug}`);
    } catch (e) {
      console.error('Error saving support QR locally:', e);
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
  
  // Write to local JSON store
  const post: BlogPost = {
    id: Date.now().toString(),
    ...newPost,
  } as BlogPost;
  fsUpsertBlog(post);

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
  const src = fsGetAllBlogs();
  const source = onlyPublished ? src.filter(p => p.published) : src;
  return {
    posts: source.slice(from, to + 1),
    total: source.length,
    page: currentPage,
    perPage: pageSize,
  };
}
