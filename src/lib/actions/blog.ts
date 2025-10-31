
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
    // Return empty array but don't block the page from rendering
    return [];
  }

  return data.map((post: any) => ({
    ...post,
    faqs: post.faqs || [],
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
  return data as BlogPost;
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
  revalidatePath(`/blog/${slug}`);

  return { success: 'Blog post created successfully!' };
}

export async function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}
