import type { BlogPost } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogTOC, TOCHeading } from "@/components/blog/BlogTOC";
import { BlogRightSidebar } from "@/components/blog/BlogRightSidebar";

export const dynamic = 'force-dynamic';

const samplePost: BlogPost = {
  slug: "sample-post",
  title: "Sample Post: Exploring the SmartPDFx Blog Layout",
  content: `
    <p>Welcome to the sample article. This demonstrates the single post layout with a table of contents and sidebars.</p>
    <h2>Introduction</h2>
    <p>The introduction explains what this page shows and how headings are extracted.</p>
    <h3>Background</h3>
    <p>Background details and context about the blog layout.</p>
    <h2>Features</h2>
    <p>Key features include a left-side TOC and a right utility sidebar.</p>
    <h3>Editor</h3>
    <p>The content editor supports Paragraph, H1, H2, and H3.</p>
    <h2>Conclusion</h2>
    <p>That’s it — you’re viewing the structure for single posts.</p>
  `,
  imageUrl: "/smartpdf_logo.png",
  author: "SmartPDFx Team",
  date: new Date().toISOString(),
  published: true,
  seoTitle: "Sample SmartPDFx Blog Post",
  metaDescription: "A sample blog post to preview the single post layout and structure.",
  faqs: [
    { question: "How is the TOC generated?", answer: "H2/H3 headings are parsed and anchor IDs added automatically." },
    { question: "Can I customize sidebars?", answer: "Yes, see layout settings in the post object." }
  ],
  category: "Demo",
  popular: true,
  layoutSettings: {
    showBreadcrumbs: true,
    leftSidebarEnabled: true,
    rightSidebarEnabled: true,
    leftSticky: true,
    tocFontSize: 'text-sm',
    tocH3Indent: 12,
    tocHoverColor: 'hover:text-primary',
  }
};

export default function SampleBlogPostPage() {
  const slugify = (str: string) => str
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const headings: TOCHeading[] = [];
  let contentWithIds = samplePost.content;

  const processTag = (tag: 'h2' | 'h3') => {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gi');
    contentWithIds = contentWithIds.replace(regex, (full, inner) => {
      const text = String(inner).replace(/<[^>]*>/g, '').trim();
      const id = slugify(text);
      headings.push({ id, text, level: tag === 'h2' ? 2 : 3 });
      if (full.includes(' id=')) return full;
      return full.replace(`<${tag}`, `<${tag} id="${id}"`);
    });
  };

  processTag('h2');
  processTag('h3');

  const layout = samplePost.layoutSettings!;

  return (
    <div className="py-8 md:py-12">
      <div className="w-full grid lg:grid-cols-12 gap-10">
        {layout.leftSidebarEnabled && (
          <aside className="hidden lg:block lg:col-span-2">
            <BlogTOC
              headings={headings}
              sticky={layout.leftSticky}
              fontSizeClass={layout.tocFontSize}
              h3Indent={layout.tocH3Indent}
              hoverClass={layout.tocHoverColor}
            />
          </aside>
        )}

        <div className="lg:col-span-8">
          <article className="space-y-8">
            <div className="space-y-4">
              <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to all posts
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{samplePost.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>By {samplePost.author}</span>
                <Badge variant="secondary">{new Date(samplePost.date).toLocaleDateString()}</Badge>
              </div>
            </div>

            <Image
              src={samplePost.imageUrl}
              alt={samplePost.title}
              width={1200}
              height={675}
              className="w-full rounded-lg border object-cover aspect-video"
              priority
            />

            {layout.leftSidebarEnabled && (
              <details className="lg:hidden border rounded-md p-3 bg-muted/30">
                <summary className="cursor-pointer select-none font-medium">Table of Contents</summary>
                <div className="mt-3">
                  <BlogTOC
                    headings={headings}
                    sticky={false}
                    fontSizeClass={layout.tocFontSize}
                    h3Indent={layout.tocH3Indent}
                    hoverClass={layout.tocHoverColor}
                  />
                </div>
              </details>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentWithIds }} />
          </article>
        </div>

        {layout.rightSidebarEnabled && (
          <aside className="lg:col-span-2">
            <BlogRightSidebar post={samplePost} />
          </aside>
        )}
      </div>
    </div>
  );
}