import { MetadataRoute } from 'next'

function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  // Prefer the www host if no env is set to match public domain
  return envUrl?.replace(/\/$/, '') || 'https://www.smartpdfx.com'
}

export default function robots(): MetadataRoute.Robots {
  const URL = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/**', '/blog', '/blog/**', '/blog/category', '/blog/category/**'],
        disallow: ['/superadmin', '/superadmin/', '/admin', '/admin/'],
      },
    ],
    sitemap: [`${URL}/sitemap.xml`, `${URL}/blog/sitemap.xml`],
    host: URL,
  }
}
