import { MetadataRoute } from 'next'
 
const URL = 'https://REPLACE-WITH-YOUR-DOMAIN.com'; // IMPORTANT: Replace with your actual domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${URL}/sitemap.xml`,
  }
}
