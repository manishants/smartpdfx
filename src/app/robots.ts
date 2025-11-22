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
          // Block v2 municipal voter tool from crawling
          '/maharastra-muncipal-voters-v2',
          '/maharastra-muncipal-voters-v2/**',
          // Block free OCR municipal voter tool from crawling
          '/maharastra-muncipal-voters-free',
          '/maharastra-muncipal-voters-free/**',
        ],
      },
    ],
    sitemap: [`${URL}/sitemap.xml`, `${URL}/blog/sitemap.xml`, `${URL}/image-sitemap.xml`],
    host: URL,
  }
}
