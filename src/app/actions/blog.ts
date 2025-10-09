
'use server';

import {promises as fs} from 'fs';
import path from 'path';
import {revalidatePath} from 'next/cache';
import type { BlogPost, Faq } from '@/lib/types';

const blogsFilePath = path.join(process.cwd(), 'blogs.json');

async function getBlogs(): Promise<BlogPost[]> {
  try {
    const data = await fs.readFile(blogsFilePath, 'utf-8');
    return JSON.parse(data) as BlogPost[];
  } catch (error) {
    // If the file doesn't exist, return an empty array
    return [];
  }
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
    return {error: 'Title, Content, Author, and Image are required.'};
  }

  const imageBuffer = await image.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const imageUri = `data:${image.type};base64,${imageBase64}`;

  const blogs = await getBlogs();
  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const newPost: BlogPost = {
    slug: finalSlug,
    title,
    content,
    author,
    date: new Date().toISOString(),
    imageUrl: imageUri,
    published,
    seoTitle: seoTitle || title,
    metaDescription,
    faqs
  };

  blogs.unshift(newPost); // Add new post to the beginning

  await fs.writeFile(blogsFilePath, JSON.stringify(blogs, null, 2));

  // Revalidate paths to show the new post
  revalidatePath('/admin/dashboard');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);

  return {success: 'Blog post created successfully!'};
}
