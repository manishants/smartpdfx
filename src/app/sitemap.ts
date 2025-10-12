
import { MetadataRoute } from 'next'
import { tools } from '@/lib/data';
import { getBlogs } from '@/app/actions/blog';

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
      const posts = await getBlogs();
      blogPosts = posts.map(post => ({
        url: `${URL}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
        changeFrequency: 'yearly',
        priority: 0.7,
      }));
  } catch (error) {
    console.error("Could not fetch blogs for sitemap", error);
  }


  return [
    ...staticPages,
    ...toolPages,
    ...blogPosts
  ];
}
