
import { MetadataRoute } from 'next'
import { tools } from '@/lib/data';

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

  // Blog pages (omit during build to avoid dynamic APIs)
  const blogPosts: MetadataRoute.Sitemap = [];


  return [
    ...staticPages,
    ...toolPages,
    ...blogPosts
  ];
}
