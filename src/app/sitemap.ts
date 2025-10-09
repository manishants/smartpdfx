import { MetadataRoute } from 'next'
import { tools } from '@/lib/data';
import { promises as fs } from 'fs';
import path from 'path';
import type { BlogPost } from '@/lib/types';

const URL = 'https://REPLACE-WITH-YOUR-DOMAIN.com'; // IMPORTANT: Replace with your actual domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    '', 
    '/about', 
    '/blog', 
    '/contact', 
    '/privacy-policy', 
    '/terms-and-conditions'
  ].map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Tool pages
  const toolPages = tools.map(tool => ({
    url: `${URL}${tool.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Blog pages
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
      const filePath = path.join(process.cwd(), 'blogs.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const posts = JSON.parse(data) as BlogPost[];
      blogPosts = posts.map(post => ({
        url: `${URL}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
        changeFrequency: 'yearly',
        priority: 0.7,
      }));
  } catch (error) {
    console.error("Could not read blogs.json for sitemap", error);
  }


  return [
    ...staticPages,
    ...toolPages,
    ...blogPosts
  ];
}
