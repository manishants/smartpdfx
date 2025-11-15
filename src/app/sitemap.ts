
import { MetadataRoute } from 'next'
import { tools } from '@/lib/data'
import fs from 'fs'
import path from 'path'
import { mergeFilesystemPages, type StoredPage } from '@/lib/pageStore'
import { getAllBlogs } from '@/lib/blogFs'
import { getAllCategories } from '@/lib/cms/categoriesFs'

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

function resolveScanContext(): { appDir: string; pageFileName: 'page.tsx' | 'page.js' } {
  const candidates: Array<{ dir: string; pageFileName: 'page.tsx' | 'page.js' }> = [
    { dir: path.join(process.cwd(), 'src', 'app'), pageFileName: 'page.tsx' },
    { dir: path.join(process.cwd(), 'app'), pageFileName: 'page.tsx' },
    { dir: path.join(process.cwd(), '.next', 'server', 'app'), pageFileName: 'page.js' },
  ]

  for (const c of candidates) {
    if (fs.existsSync(c.dir)) return { appDir: c.dir, pageFileName: c.pageFileName }
  }
  return { appDir: path.join(process.cwd(), 'src', 'app'), pageFileName: 'page.tsx' }
}

function getAppPages(): StoredPage[] {
  const { appDir, pageFileName } = resolveScanContext()
  const pages: StoredPage[] = []

  if (!fs.existsSync(appDir)) {
    return pages
  }

  const rootPagePath = path.join(appDir, pageFileName)
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

    const pageFile = path.join(appDir, name, pageFileName)
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
  // Include blog posts in sitemap
  const includeBlogInSitemap = true

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/tools',
    // '/blog' excluded for now
    '/contact',
    '/privacy-policy',
    '/terms-and-conditions',
    '/disclaimer',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }))

  // Tool pages
  const toolPages = tools.map((tool) => ({
    url: `${URL}${tool.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // App pages from filesystem + page store
  const fsPages = getAppPages()
  const appPagesMerged = mergeFilesystemPages(fsPages)
    .filter((p) => p.status === 'published')
    .map((p) => ({
      url: `${URL}/${p.slug}`.replace(/\/+$/, ''),
      lastModified: p.lastModified || new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.85,
    }))

  // Blog posts from local store (published only)
  let blogPages: MetadataRoute.Sitemap = []
  if (includeBlogInSitemap) {
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
  }

  // Blog category pages (from categories store)
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

  return [...staticPages, ...toolPages, ...appPagesMerged, ...categoryPages, ...blogPages]
}
