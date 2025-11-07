'use server';

import { revalidatePath } from 'next/cache';
import type { BlogComment } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getApprovedComments(slug: string): Promise<BlogComment[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('blog_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching approved comments:', error);
    return [];
  }
  return (data || []) as BlogComment[];
}

export async function createComment(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const blogSlug = (formData.get('blogSlug') as string) || (formData.get('slug') as string);
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const content = formData.get('content') as string;
  const linkUrl = (formData.get('linkUrl') as string) || null;

  if (!blogSlug || !name || !email || !content) {
    return { error: 'Name, Email, and Comment are required.' };
  }

  const { error } = await supabase
    .from('blog_comments')
    .insert([{ blog_slug: blogSlug, name, email, content, link_url: linkUrl }]);

  if (error) {
    console.error('Error creating comment:', error);
    return { error: 'Failed to submit comment.' };
  }

  revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Thanks! Your comment has been submitted for review.' };
}

export async function getAllComments(): Promise<BlogComment[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
  return (data || []) as BlogComment[];
}

export async function moderateComment(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const id = Number(formData.get('id'));
  const status = (formData.get('status') as 'approved' | 'spam' | 'pending') || 'pending';
  const blogSlug = (formData.get('blogSlug') as string) || '';

  if (!id || !status) {
    return { error: 'Invalid moderation request.' };
  }

  const { error } = await supabase
    .from('blog_comments')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error moderating comment:', error);
    return { error: 'Failed to update comment status.' };
  }

  revalidatePath('/admin/blog/comments');
  if (blogSlug) revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Comment status updated.' };
}

export async function deleteComment(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const id = Number(formData.get('id'));
  const blogSlug = (formData.get('blogSlug') as string) || '';

  if (!id) {
    return { error: 'Invalid delete request.' };
  }

  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting comment:', error);
    return { error: 'Failed to delete comment.' };
  }

  revalidatePath('/admin/blog/comments');
  if (blogSlug) revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Comment deleted.' };
}