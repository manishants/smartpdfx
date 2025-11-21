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
        // Allow everything by default; only restrict sensitive dashboards
        disallow: [
          '/admin',
          '/admin/**',
          '/superadmin',
          '/superadmin/**',
          // Block private municipal voter tool from crawling
          '/maharastra-muncipal-voters',
          '/maharastra-muncipal-voters/**',
        ],
      },
    ],
    sitemap: [`${URL}/sitemap.xml`, `${URL}/blog/sitemap.xml`, `${URL}/image-sitemap.xml`],
    host: URL,
  }
}
