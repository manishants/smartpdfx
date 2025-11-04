import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  return envUrl?.replace(/\/$/, '') || 'https://smartpdfx.com'
}

export default function robots(): MetadataRoute.Robots {
  const URL = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/superadmin', '/superadmin/', '/admin', '/admin/'],
      },
    ],
    sitemap: `${URL}/sitemap.xml`,
    host: URL,
  }
}
