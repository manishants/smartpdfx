import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-static'

export default function ShippingPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://smartpdfx.com').replace(/\/$/, '')

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Shipping & Delivery Policy – SmartPDFx.com',
    url: `${siteUrl}/shipping-policy`,
    description:
      'SmartPDFx.com is a free online tool platform providing instant digital services like PDF conversion, compression, editing, and AI utilities. No physical products are shipped; delivery is instant on-site.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SmartPDFx',
      url: siteUrl,
    },
  }

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Shipping & Delivery Policy', item: `${siteUrl}/shipping-policy` },
    ],
  }

  return (
    <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Shipping & Delivery Policy – SmartPDFx.com</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            SmartPDFx.com is a free online tool platform that provides digital services such as PDF conversion, compression,
            editing, and other AI-based utilities. We do not sell any physical products, and therefore, we do not offer
            traditional shipping or home delivery.
          </p>

          <h2>1. Digital Delivery</h2>
          <ul>
            <li>All tools on SmartPDFx.com are instant and online.</li>
            <li>Users receive results immediately on the website after uploading or processing a file.</li>
            <li>No email or physical delivery is involved.</li>
          </ul>

          <h2>2. No Shipping Required</h2>
          <p>
            Since SmartPDFx.com provides digital, automated, and online services, no shipping charges, courier services, or
            physical delivery timelines apply.
          </p>

          <h2>3. Service Availability</h2>
          <ul>
            <li>Our tools are available 24/7.</li>
            <li>Processing time may vary based on file size, but most results are delivered instantly.</li>
          </ul>

          <h2>4. Paid Features (If Applicable in Future)</h2>
          <ul>
            <li>If SmartPDFx.com introduces premium or paid digital services:</li>
            <li>Delivery of digital files or premium access will continue to be instant.</li>
            <li>Users will receive immediate access to the service after a successful payment.</li>
          </ul>

          <h2>5. Contact Us</h2>
          <p>
            If you experience any issues in receiving your processed digital files, you can contact us at:
          </p>
          <p>
            Support Page: <a href="https://smartpdfx.com/contact" className="text-primary underline" target="_blank" rel="noopener noreferrer">https://smartpdfx.com/contact</a>
            <br />
            Response Time: Within 24–48 hours
          </p>
        </CardContent>
      </Card>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
    </main>
  )
}