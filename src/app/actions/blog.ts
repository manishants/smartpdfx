
'use server';

import { revalidatePath } from 'next/cache';
import type { BlogPost, Faq } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

export async function getBlogs(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  // The data from Supabase might have a different structure for faqs.
  // We need to ensure it matches the BlogPost type.
  return data.map((post: any) => ({
    ...post,
    faqs: post.faqs || [],
  }));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
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

  const supabase = createClient();
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const imageName = `${finalSlug}-${Date.now()}`;
  
  // 1. Upload image to Supabase Storage
  const { data: imageData, error: imageError } = await supabase.storage
    .from('blogs')
    .upload(imageName, image);

  if (imageError) {
    console.error('Error uploading image:', imageError);
    return { error: 'Failed to upload image.' };
  }

  // 2. Get the public URL for the image
  const { data: imageUrlData } = supabase.storage
    .from('blogs')
    .getPublicUrl(imageData.path);
    
  const imageUrl = imageUrlData.publicUrl;

  // 3. Insert the new post into the database
  const newPost: Omit<BlogPost, 'id'> = {
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
    return { error: 'Failed to create blog post.' };
  }

  // Revalidate paths to show the new post
  revalidatePath('/admin/dashboard');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  return { success: 'Blog post created successfully!' };
}
