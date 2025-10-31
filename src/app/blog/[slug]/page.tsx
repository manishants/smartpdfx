
import type { BlogPost } from "@/lib/types";
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from 'next';
import { getPost } from "@/app/actions/blog";

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

    if (!post || !post.published) {
        notFound();
    }

    return (
        <div className="max-w-4xl px-4 py-8 md:py-12 mx-auto">
            <article className="space-y-8">
                <div className="space-y-4">
                     <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to all posts
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span>By {post.author}</span>
                        <Badge variant="secondary">{new Date(post.date).toLocaleDateString()}</Badge>
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

                <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

            </article>
        </div>
    )
}
