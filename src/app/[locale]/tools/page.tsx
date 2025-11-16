import Link from 'next/link'
import { tools } from '@/lib/data'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModernSection } from '@/components/modern-section'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Sparkles, Shield, Zap, Star } from 'lucide-react'
import { getBlogs } from '@/app/actions/blog'
import type { Metadata } from 'next'
import { getDictionary, t } from '@/lib/i18n'
import { locales, hreflangMap, type Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

function siteUrl() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://smartpdfx.com').replace(/\/$/, '')
  return base
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const locale = params.locale
  const base = siteUrl()
  const path = `${base}/${locale}/tools`
  const languages = Object.fromEntries(locales.map((l) => [hreflangMap[l], `${base}/${l}/tools`]))
  return {
    title: t(await getDictionary(locale), 'hero.title', 'All PDF Tools – Free, Fast & Secure'),
    description: t(await getDictionary(locale), 'hero.subtitle', 'Convert, compress, edit, and protect PDFs with a clean, minimal design and strong privacy.'),
    alternates: {
      canonical: path,
      languages,
    },
  }
}

export default async function ToolsPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale
  const dict = await getDictionary(locale)
  const blogs = await getBlogs()
  const latestBlogs = blogs.filter(b => b.published).slice(0, 5)

  const base = siteUrl()
  const pref = `/${locale}`

  // Structured data for ItemList of tools (localized)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t(dict, 'jsonld.itemListName', 'All PDF Tools – Free, Fast & Secure'),
    itemListElement: tools.map((tItem, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tItem.title,
      url: `${base}${pref}${tItem.href}`,
    })),
  }

  // SoftwareApplication for each tool (localized URLs)
  const categoryToSubCategory: Record<string, string> = {
    pdf_tools: 'File Conversion',
    image_tools: 'GraphicsApplication',
    text_tools: 'Productivity',
    color_tools: 'GraphicsApplication',
  }

  const toolsSoftwareAppsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': tools.map((tItem) => ({
      '@type': 'SoftwareApplication',
      name: tItem.title,
      operatingSystem: 'Web',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: categoryToSubCategory[tItem.category] || 'UtilitiesApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: tItem.description,
      url: `${base}${pref}${tItem.href}`,
      image: `${base}/logo.png`,
      creator: { '@type': 'Organization', name: 'SmartPDFx' },
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: t(dict, 'jsonld.faqName', 'Are SmartPDFx tools free to use?'),
        acceptedAnswer: { '@type': 'Answer', text: t(dict, 'jsonld.faqA', 'Yes. Most tools are free to use. We focus on fast, secure, and privacy-friendly processing.') },
      },
      {
        '@type': 'Question',
        name: t(dict, 'faq.q2', 'Do you keep my files?'),
        acceptedAnswer: { '@type': 'Answer', text: t(dict, 'faq.a2', 'No. Files are processed transiently or client-side. We do not retain your files.') },
      },
      {
        '@type': 'Question',
        name: t(dict, 'faq.q3', 'Will it work on my phone?'),
        acceptedAnswer: { '@type': 'Answer', text: t(dict, 'faq.a3', 'Yes. The tools page is fully responsive and optimized for mobile and Google Discover.') },
      },
    ],
  }

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/${locale}/` },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${base}/${locale}/tools` },
    ],
  }

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t(dict, 'jsonld.howtoName', 'How to use SmartPDFx tools'),
    description: t(dict, 'jsonld.howtoDesc', 'Choose a tool, upload your file, configure options, process, and download.'),
    step: [
      { '@type': 'HowToStep', position: 1, name: t(dict, 'sections.howto.title', 'How-To Steps'), text: t(dict, 'howto.step1', 'Select a tool from the grid above.') },
      { '@type': 'HowToStep', position: 2, name: t(dict, 'sections.howto.title', 'How-To Steps'), text: t(dict, 'howto.step2', 'Upload your file via drag & drop or the upload button.') },
      { '@type': 'HowToStep', position: 3, name: t(dict, 'sections.howto.title', 'How-To Steps'), text: t(dict, 'howto.step3', 'Adjust any available options for best results.') },
      { '@type': 'HowToStep', position: 4, name: t(dict, 'sections.howto.title', 'How-To Steps'), text: t(dict, 'howto.step4', 'Process the file and wait for the result.') },
      { '@type': 'HowToStep', position: 5, name: t(dict, 'sections.howto.title', 'How-To Steps'), text: t(dict, 'howto.step5', 'Download your output securely.') },
    ],
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-600/10 to-muted/30" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-primary font-medium inline-flex items-center justify-center">
              <Sparkles className="w-4 h-4 mr-2" /> {t(dict, 'hero.badge', 'AI-Powered & Secure')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
                {t(dict, 'hero.title', 'All PDF Tools – Free, Fast & Secure')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t(dict, 'hero.subtitle', 'Convert, compress, edit, and protect PDFs with a clean, minimal design and strong privacy.')}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Zap className="w-4 h-4 text-yellow-500" /> {t(dict, 'features.fast', 'Lightning Fast')}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="w-4 h-4 text-blue-500" /> {t(dict, 'features.secure', 'Secure by Design')}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Star className="w-4 h-4 text-purple-500" /> {t(dict, 'features.quality', 'Premium Quality')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content with grid and blog sidebar */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Tools grid */}
          <div className="lg:col-span-8 xl:col-span-9">
            <ModernSection
              title={t(dict, 'sections.explore.title', 'Explore Tools')}
              subtitle={t(dict, 'sections.explore.subtitle', 'Click any tool to start. Icons and short descriptions help you choose.')}
              icon={<Sparkles className="h-6 w-6" />}
              variant="default"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <Link key={tool.href} href={`${pref}${tool.href}`} className="group">
                    <Card className="border border-primary/10 hover:border-primary/30 transition-colors duration-200">
                      <CardHeader className="flex flex-row items-start gap-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-600/10">
                          <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">{tool.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </ModernSection>

            {/* Internal links for SEO */}
            <ModernSection
              title={t(dict, 'sections.links.title', 'All Tools Links')}
              subtitle={t(dict, 'sections.links.subtitle', 'Quick internal links to every tool for better discovery and navigation')}
              variant="glass"
            >
              <ul className="columns-1 sm:columns-2 md:columns-3 gap-4">
                {tools.map((tool) => (
                  <li key={tool.href} className="mb-2">
                    <Link href={`${pref}${tool.href}`} className="text-sm text-primary hover:underline" title={tool.title}>{tool.title}</Link>
                  </li>
                ))}
              </ul>
            </ModernSection>

            {/* FAQ above How-To (per requested order) */}
            <ModernSection title={t(dict, 'sections.faq.title', 'Frequently Asked Questions')} subtitle={t(dict, 'sections.faq.subtitle', 'Everything you need to know')} variant="default">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>{t(dict, 'faq.q1', 'Is SmartPDFx really free?')}</AccordionTrigger>
                  <AccordionContent>
                    {t(dict, 'faq.a1', 'Yes. Most of our tools are free. We focus on performance, privacy, and quality.')}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>{t(dict, 'faq.q2', 'Do you keep my files?')}</AccordionTrigger>
                  <AccordionContent>
                    {t(dict, 'faq.a2', 'No. Files are processed transiently or client-side. We do not retain your files.')}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>{t(dict, 'faq.q3', 'Will it work on my phone?')}</AccordionTrigger>
                  <AccordionContent>
                    {t(dict, 'faq.a3', 'Yes. The tools page is fully responsive and optimized for mobile and Google Discover.')}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ModernSection>

            {/* How-To section */}
            <ModernSection
              title={t(dict, 'sections.howto.title', 'How-To Steps')}
              subtitle={t(dict, 'sections.howto.subtitle', 'A simple guide to using SmartPDFx tools')}
              variant="default"
              icon={<Sparkles className="h-6 w-6" />}
            >
              <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                <li>{t(dict, 'howto.step1', 'Select a tool from the grid above.')}</li>
                <li>{t(dict, 'howto.step2', 'Upload your file via drag & drop or the upload button.')}</li>
                <li>{t(dict, 'howto.step3', 'Adjust any available options for best results.')}</li>
                <li>{t(dict, 'howto.step4', 'Process the file and wait for the result.')}</li>
                <li>{t(dict, 'howto.step5', 'Download your output securely.')}</li>
              </ol>
            </ModernSection>
          </div>

          {/* Latest blogs sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <ModernSection title={t(dict, 'sidebar.blogs.title', 'Latest Blogs')} subtitle={t(dict, 'sidebar.blogs.subtitle', 'Guides and tips related to our tools')} variant="default">
              <div className="space-y-4">
                {latestBlogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t(dict, 'sidebar.blogs.empty', 'No posts yet. Check back soon.')}</p>
                ) : (
                  latestBlogs.map((post) => (
                    <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="block group">
                      <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-colors">
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