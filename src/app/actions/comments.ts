'use server';

import { revalidatePath } from 'next/cache';
import type { BlogComment } from '@/lib/types';
import { getApprovedCommentsFs, getAllCommentsFs, addCommentFs, updateCommentStatusFs, deleteCommentByIdFs } from '@/lib/commentsFs'

export async function getApprovedComments(slug: string): Promise<BlogComment[]> {
  return getApprovedCommentsFs(slug)
}

export async function createComment(formData: FormData) {
  const blogSlug = (formData.get('blogSlug') as string) || (formData.get('slug') as string);
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const content = formData.get('content') as string;
  const linkUrl = (formData.get('linkUrl') as string) || null;

  if (!blogSlug || !name || !email || !content) {
    return { error: 'Name, Email, and Comment are required.' };
  }

  addCommentFs({ blog_slug: blogSlug, name, email, content, link_url: linkUrl });
  revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Thanks! Your comment has been submitted for review.' };
}

export async function getAllComments(): Promise<BlogComment[]> {
  return getAllCommentsFs()
}

export async function moderateComment(formData: FormData) {
  const id = Number(formData.get('id'));
  const status = (formData.get('status') as 'approved' | 'spam' | 'pending') || 'pending';
  const blogSlug = (formData.get('blogSlug') as string) || '';

  if (!id || !status) {
    return { error: 'Invalid moderation request.' };
  }

  const ok = updateCommentStatusFs(id, status)
  if (!ok) {
    return { error: 'Comment not found.' }
  }

  revalidatePath('/admin/blog/comments');
  if (blogSlug) revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Comment status updated.' };
}

export async function deleteComment(formData: FormData) {
  const id = Number(formData.get('id'));
  const blogSlug = (formData.get('blogSlug') as string) || '';

  if (!id) {
    return { error: 'Invalid delete request.' };
  }

  const ok = deleteCommentByIdFs(id)
  if (!ok) {
    return { error: 'Failed to delete comment.' }
  }

  revalidatePath('/admin/blog/comments');
  if (blogSlug) revalidatePath(`/blog/${blogSlug}`);
  return { success: 'Comment deleted.' };
}