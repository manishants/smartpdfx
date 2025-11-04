
import { MetadataRoute } from 'next'
import { tools } from '@/lib/data'
import fs from 'fs'
import path from 'path'
import { mergeFilesystemPages, type StoredPage } from '@/lib/pageStore'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  return envUrl?.replace(/\/$/, '') || 'https://smartpdfx.com'
}

const EXCLUDE_DIRS = new Set([
  'api',
  'admin',
  'superadmin',
  'dashboard',
  '_components',
])

function getAppPages(): StoredPage[] {
  const appDir = path.join(process.cwd(), 'src', 'app')
  const pages: StoredPage[] = []

  const rootPagePath = path.join(appDir, 'page.tsx')
  if (fs.existsSync(rootPagePath)) {
    const stat = fs.statSync(rootPagePath)
    pages.push({
      id: 'root',
      title: 'Home Page',
      slug: '',
      status: 'published',
      lastModified: stat.mtime.toISOString(),
      sections: [],
    })
  }

  const entries = fs.readdirSync(appDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name
    if (EXCLUDE_DIRS.has(name)) continue
    if (name.startsWith('(') || name.startsWith('[')) continue

    const pageFile = path.join(appDir, name, 'page.tsx')
    if (fs.existsSync(pageFile)) {
      const stat = fs.statSync(pageFile)
      const slug = `${name}`
      pages.push({
        id: name,
        title: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug,
        status: 'published',
        lastModified: stat.mtime.toISOString(),
        sections: [],
      })
    }
  }

  return pages
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const URL = getSiteUrl()

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  // Tool pages
  const toolPages = tools.map((tool) => ({
    url: `${URL}${tool.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  // App pages from filesystem + page store
  const fsPages = getAppPages()
  const appPagesMerged = mergeFilesystemPages(fsPages)
    .filter((p) => p.status === 'published')
    .map((p) => ({
      url: `${URL}/${p.slug}`.replace(/\/+$/, ''),
      lastModified: p.lastModified || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }))

  // Blog posts from Supabase (published only)
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    // Graceful handling if supabase not configured
    const { data, error } = await supabase
      .from('blogs')
      .select('slug, date, published')
      .eq('published', true)

    if (!error && Array.isArray(data)) {
      blogPages = data.map((post: any) => ({
        url: `${URL}/blog/${post.slug}`,
        lastModified: new Date(post.date || Date.now()).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch {
    blogPages = []
  }

  return [...staticPages, ...toolPages, ...appPagesMerged, ...blogPages]
}
