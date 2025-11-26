import Link from 'next/link'
import { tools } from '@/lib/data'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModernSection } from '@/components/modern-section'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Sparkles, Shield, Zap, Star } from 'lucide-react'
import { getBlogs } from '@/app/actions/blog'
import ToolsDonateSubscribe from '@/components/tools-donate-subscribe'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const blogs = await getBlogs()
  const latestBlogs = blogs.filter(b => b.published).slice(0, 5)

  // Structured data for ItemList of tools
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All PDF Tools – Free, Fast & Secure',
    itemListElement: tools.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com'}${t.href}`
    }))
  }

  // Structured data for SoftwareApplication for each tool (Tools schema)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com').replace(/\/$/, '')
  const categoryToSubCategory: Record<string, string> = {
    pdf_tools: 'File Conversion',
    image_tools: 'GraphicsApplication',
    text_tools: 'Productivity',
    color_tools: 'GraphicsApplication'
  }

  const toolsSoftwareAppsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': tools.map((t) => ({
      '@type': 'SoftwareApplication',
      name: t.title,
      operatingSystem: 'Web',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: categoryToSubCategory[t.category] || 'UtilitiesApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: t.description,
      url: `${siteUrl}${t.href}`,
      image: `${siteUrl}/logo.png`,
      creator: {
        '@type': 'Organization',
        name: 'SmartPDFx'
      }
    }))
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are SmartPDFx tools free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Most tools are free to use. We focus on fast, secure, and privacy-friendly processing.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you store my files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Files are processed client-side or securely on our servers and are not retained.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are the tools mobile-friendly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The site is responsive and optimized for mobile and Google Discover.'
        }
      }
    ]
  }

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com'}/` },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com'}/tools` }
    ]
  }

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use SmartPDFx tools',
    description: 'Choose a tool, upload your file, configure options, process, and download.',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Select a tool', text: 'Pick any tool from the grid.' },
      { '@type': 'HowToStep', position: 2, name: 'Upload your file', text: 'Drag & drop or click to upload.' },
      { '@type': 'HowToStep', position: 3, name: 'Adjust options', text: 'Configure settings as needed.' },
      { '@type': 'HowToStep', position: 4, name: 'Process', text: 'Start processing and wait a moment.' },
      { '@type': 'HowToStep', position: 5, name: 'Download', text: 'Save your new file securely.' }
    ]
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-600/10 to-muted/30" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-primary font-medium inline-flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2" /> AI-Powered & Secure
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
                All PDF Tools – Free, Fast & Secure
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground dark:text-white max-w-3xl mx-auto">
              Convert, compress, edit, and protect PDFs with a clean, minimal design and strong privacy.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white"><Zap className="w-4 h-4 text-yellow-500" /> Lightning Fast</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white"><Shield className="w-4 h-4 text-blue-500" /> Secure by Design</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white"><Star className="w-4 h-4 text-purple-500" /> Premium Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content with grid and blog sidebar */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* SEO article replacing the tools grid */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <ModernSection
              title="SmartPDFx: Free, Fast PDF Tools for Everyday Work"
              subtitle="A practical guide to secure, minimal, and AI‑assisted PDF workflows"
              icon={<Sparkles className="h-6 w-6" />}
              variant="default"
            >
              <div className="prose prose-sm sm:prose base max-w-none dark:prose-invert dark:text-white">
                <p>
                  SmartPDFx offers a clean, privacy‑focused experience for working with PDFs and images. No sign‑ups, no tracking cookies without consent, and performance tuned for quick tasks on any device.
                </p>
                <h2 className="text-lg font-semibold text-foreground mt-6">Why professionals choose SmartPDFx</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Fast, reliable processing with client‑side and server‑side options.</li>
                  <li>Privacy by design — temporary processing, no file retention.</li>
                  <li>AI‑assisted tools that improve quality while keeping control.</li>
                </ul>
                <h2 className="text-lg font-semibold text-foreground mt-6">Popular workflows</h2>
                <p>Get started with these commonly used tools:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <Link href="/merge-pdf" className="hover:underline text-primary dark:text-white">Merge PDF — combine documents with quality control</Link>
                  <Link href="/word-to-pdf" className="hover:underline text-primary dark:text-white">Word to PDF — preserve layout with high fidelity</Link>
                  <Link href="/scan-pdf" className="hover:underline text-primary dark:text-white">PDF to Scanned PDF — create rasterized, scan‑like PDFs</Link>
                </div>
                <h2 className="text-lg font-semibold text-foreground mt-6">Tips for best results</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Use clear filenames and keep inputs under 50MB for speed.</li>
                  <li>Prefer client‑side processing when privacy is critical.</li>
                  <li>Enable analytics in cookie settings to help us improve, only if comfortable.</li>
                </ol>
                <p className="mt-6">Looking for something specific? Explore internal links below for the full catalog.</p>
              </div>
            </ModernSection>

            {/* Internal links for SEO */}
            <ModernSection
              title="All Tools Links"
              subtitle="Quick internal links to every tool for better discovery and navigation"
              variant="transparent"
              contentClassName="dark:text-white"
            >
              <ul className="columns-1 sm:columns-2 md:columns-3 gap-4">
                {tools.map((tool) => (
                  <li key={tool.href} className="mb-2">
                    <Link href={tool.href} className="text-sm text-primary dark:text-white hover:underline" title={tool.title}>{tool.title}</Link>
                  </li>
                ))}
              </ul>
            </ModernSection>

            {/* How-To section space */}
            <ModernSection
              title="How-To Steps"
              subtitle="A simple guide to using SmartPDFx tools"
              variant="default"
              icon={<Sparkles className="h-6 w-6" />}
            >
              <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                <li>Select a tool from the grid above.</li>
                <li>Upload your file via drag & drop or the upload button.</li>
                <li>Adjust any available options for best results.</li>
                <li>Process the file and wait for the result.</li>
                <li>Download your output securely.</li>
              </ol>
            </ModernSection>

            {/* FAQ section space */}
            <ModernSection title="Frequently Asked Questions" subtitle="Everything you need to know" variant="default">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>Is SmartPDFx really free?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Most of our tools are free. We focus on performance, privacy, and quality.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>Do you keep my files?</AccordionTrigger>
                  <AccordionContent>
                    No. Files are processed transiently or client-side. We do not retain your files.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>Will it work on my phone?</AccordionTrigger>
                  <AccordionContent>
                    Yes. The tools page is fully responsive and optimized for mobile and Google Discover.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ModernSection>
          </div>

          {/* Latest blogs sidebar with sticky Support & Subscribe below posts */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ModernSection title="Latest Blogs" subtitle="Guides and tips related to our tools" variant="default">
              <div className="space-y-4">
                {latestBlogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts yet. Check back soon.</p>
                ) : (
                  latestBlogs.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                      <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-colors">
                        {/* Use <img> for maximum compatibility and performance */}
                        <img src={post.imageUrl} alt={post.title} className="w-full h-32 object-cover" />
                        <CardContent className="p-4">
                          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{(post.content || '').replace(/<[^>]*>?/gm, '')}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </ModernSection>
            {/* Sticky donate + subscribe below posts */}
            <ToolsDonateSubscribe />
          </aside>
        </div>
      </div>

      {/* Schema blocks: Tools (SoftwareApplication) -> FAQ -> HowTo -> ItemList -> Breadcrumbs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsSoftwareAppsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
    </main>
  )
}