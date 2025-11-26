
import type { BlogPost } from "@/lib/types";
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from 'next';
import { getPost, getBlogs } from "@/app/actions/blog";
// Comments UI removed per request; keeping backend actions intact but not imported
import { BlogTOC, TOCHeading } from '@/components/blog/BlogTOC';
import { BlogRightSidebar } from '@/components/blog/BlogRightSidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { GoogleAd } from '@/components/google-ad';

// Ensure this page renders dynamically so build doesn't call cookies() in static scope
export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.content.substring(0, 155).trim() + '...';

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [post.imageUrl],
    },
    alternates: {
        canonical: `/blog/${post.slug}`,
    },
    ...(faqSchema && {
        other: {
            "application/ld+json": JSON.stringify(faqSchema)
        }
    })
  }
}

// Removed generateStaticParams to avoid calling cookies() during build

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);
    const allPosts = await getBlogs();
    // Comments removed from UI; no need to fetch approved comments

    if (!post || !post.published) {
        notFound();
    }

    // Derive layout settings with sensible defaults
    const layout = {
      showBreadcrumbs: post.layoutSettings?.showBreadcrumbs ?? true,
      leftSidebarEnabled: post.layoutSettings?.leftSidebarEnabled ?? true,
      rightSidebarEnabled: post.layoutSettings?.rightSidebarEnabled ?? true,
      leftSticky: post.layoutSettings?.leftSticky ?? false,
      tocFontSize: post.layoutSettings?.tocFontSize ?? 'text-sm',
      tocH3Indent: post.layoutSettings?.tocH3Indent ?? 12,
      tocHoverColor: post.layoutSettings?.tocHoverColor ?? 'hover:text-primary',
    };

  // Extract H2/H3 headings and add ids to content
  const slugify = (str: string) => str
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const headings: TOCHeading[] = [];
  let contentWithIds = post.content;

    const processTag = (tag: 'h2' | 'h3') => {
      const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gi');
      contentWithIds = contentWithIds.replace(regex, (full, inner) => {
        const text = String(inner).replace(/<[^>]*>/g, '').trim();
        const id = slugify(text);
        headings.push({ id, text, level: tag === 'h2' ? 2 : 3 });
        // If tag already has id, keep it; otherwise add one
        if (full.includes(' id=')) return full;
        return full.replace(`<${tag}`, `<${tag} id="${id}"`);
      });
    };

  processTag('h2');
  processTag('h3');

  // If manual TOC is present, override headings while keeping ids in content
  const finalHeadings: TOCHeading[] = Array.isArray((post as any).manualToc) && (post as any).manualToc.length > 0
    ? (post as any).manualToc.map((h: any) => ({ id: h.id || slugify(h.text), text: h.text, level: h.level }))
    : headings;

    // Breadcrumb items
    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      ...(post.category ? [{ label: post.category, href: `/blog/category/${slugify(post.category)}` }] : []),
      { label: post.title },
    ];

    // Latest posts (exclude current)
    const latestPosts = allPosts
      .filter(p => p.slug !== post.slug && p.published)
      .slice(0, 4);

    // Calculate estimated reading time (words per minute ~200)
    const plainText = post.content.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));

  return (
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="grid lg:grid-cols-12 gap-10">
          {/* Left TOC Sidebar (desktop) */}
          {layout.leftSidebarEnabled && (
            <aside className="hidden lg:block lg:col-span-3">
              <BlogTOC
                headings={finalHeadings}
                sticky={layout.leftSticky}
                fontSizeClass={layout.tocFontSize}
                h3Indent={layout.tocH3Indent}
                hoverClass={layout.tocHoverColor}
              />
              {layout.rightSidebarEnabled && (
                <div className="mt-6">
                  <BlogRightSidebar post={post as BlogPost} />
                </div>
              )}
            </aside>
          )}

          {/* Main Article */}
          <div className="lg:col-span-9">
            <article className="space-y-8">
              <div className="space-y-4">
                {/* Breadcrumbs above Back to all posts within main column */}
                <Breadcrumbs items={breadcrumbItems} />
                <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to all posts
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>By {post.author}</span>
                  <Badge variant="secondary">{new Date(post.date).toLocaleDateString()}</Badge>
                  <span aria-label="Reading time">{readMinutes} min read</span>
                </div>
              </div>

              <Image
                src={post.imageUrl}
                alt={post.title}
                width={1200}
                height={675}
                className="w-full rounded-lg border object-cover aspect-video"
                priority
              />

              {/* Mobile TOC toggle */}
              {layout.leftSidebarEnabled && (
                <details className="lg:hidden border rounded-md p-3 bg-muted/30">
                  <summary className="cursor-pointer select-none font-medium">Table of Contents</summary>
                  <div className="mt-3 space-y-4">
                    {/* TOC first */}
                    <BlogTOC
                      headings={finalHeadings}
                      sticky={false}
                      fontSizeClass={layout.tocFontSize}
                      h3Indent={layout.tocH3Indent}
                      hoverClass={layout.tocHoverColor}
                    />
                    {/* Sticky Subscribe/Support directly below TOC (mobile only) */}
                    {layout.rightSidebarEnabled && (
                      <div className="sticky top-20 z-10">
                        <BlogRightSidebar post={post as BlogPost} />
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Mid-post Advertisement */}
              <GoogleAd />

              <div
                id="article-body"
                className="prose prose-lg dark:prose-invert max-w-none prose-h2:mt-6 prose-h3:mt-4 prose-h2:scroll-mt-24 prose-h3:scroll-mt-24 prose-img:rounded-lg prose-img:border"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />
          </article>
        </div>

          {/* Right Sidebar (only on right when TOC disabled) */}
          {layout.rightSidebarEnabled && !layout.leftSidebarEnabled && (
            <aside className="lg:col-span-2 lg:sticky lg:top-24">
              <BlogRightSidebar post={post as BlogPost} />
            </aside>
          )}
          </div>

          {/* Bottom section: Latest posts */}
          {latestPosts.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Latest Posts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestPosts.map(latest => (
                  <Card key={latest.slug}>
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">
                        <Link href={`/blog/${latest.slug}`} className="hover:underline">
                          {latest.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {new Date(latest.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: latest.content }} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section removed per request */}
        </div>
      </div>
    )
}
