import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString()

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com').replace(/\/$/, '')

  const merchantReturnPolicyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MerchantReturnPolicy',
    name: 'Refund Policy',
    url: `${siteUrl}/refund-policy`,
    returnPolicyCategory: 'https://schema.org/NoReturn',
    refundType: 'https://schema.org/NoRefund',
    returnFees: 'https://schema.org/NoReturnFees',
    applicableCountry: 'IN',
    merchantReturnDays: 0,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Support-the-creator contributions',
        value: 'Final sale; non-refundable.'
      }
    ],
    seller: {
      '@type': 'Organization',
      name: 'SmartPDFx',
      url: siteUrl
    }
  }

  return (
    <main className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Refund Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Thank you for supporting SmartPDFx. Some offerings on our site may allow you to <strong>support the creator</strong> through voluntary contributions or access to premium features. These contributions help keep our tools fast, secure, and privacy‑friendly.
          </p>

          <h2>1. No Refunds for Support‑The‑Creator Contributions</h2>
          <p>
            All support‑the‑creator contributions, tips, donations, or similar payments are <strong>final and non‑refundable</strong>. By completing a contribution, you acknowledge that you are not entitled to a refund or reimbursement, except as required by applicable law.
          </p>

          <h2>2. Statutory Rights</h2>
          <p>
            This Refund Policy does not affect any rights you may have under applicable consumer protection laws. In certain jurisdictions, you may have statutory rights relating to defective paid services or unauthorized transactions. We will comply with all such legal obligations.
          </p>

          <h2>3. Unauthorized or Duplicate Charges</h2>
          <p>
            If you believe a payment was made in error, duplicated, or without authorization, please contact us promptly with transaction details. We will investigate and, where appropriate and required by law, assist in reversing or refunding the erroneous charge.
          </p>

          <h2>4. Chargebacks</h2>
          <p>
            If you are considering a chargeback, we encourage you to contact us first so we can address your concern. Unauthorized chargebacks may result in limited access to features or future support offerings.
          </p>

          <h2>5. Digital Services</h2>
          <p>
            Our tools and features are provided as digital services. Once access is granted or a feature is used, the service is considered delivered. As such, <strong>refunds are not offered</strong> for used or activated features, except where mandated by law.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about this policy? Please reach us via the contact page. We aim to respond in a timely manner and resolve issues in good faith.
          </p>
        </CardContent>
      </Card>

      {/* Structured Data for Merchant Return Policy */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(merchantReturnPolicyJsonLd) }} />
    </main>
  )
}