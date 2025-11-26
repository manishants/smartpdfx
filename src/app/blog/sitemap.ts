import { MetadataRoute } from 'next'
import { getAllBlogs } from '@/lib/blogFs'
import { getAllCategories } from '@/lib/cms/categoriesFs'

export const dynamic = 'force-dynamic'

function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  return envUrl?.replace(/\/$/, '') || 'https://smartpdfx.com'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const URL = getSiteUrl()

  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = getAllBlogs().filter(p => p.published)
    blogPages = posts.map(post => ({
      url: `${URL}/blog/${post.slug}`,
      lastModified: new Date(post.date || Date.now()).toISOString(),
      changeFrequency: 'daily',
      priority: 0.8,
    }))
  } catch {
    blogPages = []
  }

  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = getAllCategories()
    categoryPages = categories.map(c => ({
      url: `${URL}/blog/category/${c.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    }))
  } catch {
    categoryPages = []
  }

  // Include the blog home page for completeness
  const root = [{
    url: `${URL}/blog`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.7,
  }]

  return [...root, ...categoryPages, ...blogPages]
}