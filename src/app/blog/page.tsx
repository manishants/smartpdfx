
import type { BlogPost } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from 'next';
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBlogs } from "@/app/actions/blog";

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Insights, updates, and stories from the SmartPDFx team. Learn more about our PDF and image tools.',
};

const PopularPostItem = ({ post }: { post: BlogPost }) => (
    <div className="flex items-start gap-4">
        <Image 
            src={post.imageUrl}
            alt={post.title}
            width={100}
            height={60}
            className="rounded-md object-cover aspect-[4/3]"
        />
        <div className="flex-1">
            <p className="text-xs font-semibold uppercase text-primary tracking-wider">{post.category}</p>
            <h3 className="font-semibold text-sm leading-tight hover:underline">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content.replace(/<[^>]*>?/gm, '')}</p>
        </div>
    </div>
);


export default async function BlogListPage() {
    const posts = await getBlogs();
    const publishedPosts = posts.filter(p => p.published);
    const popularPosts = publishedPosts.filter(p => p.popular);

    return (
        <div className="px-4 py-8 md:py-12">
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
                <header className="text-center my-8 md:my-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">The SmartPDFx Blog</h1>
                    <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                        The best tips and tricks on managing digital documents
                    </p>
                </header>

                {publishedPosts.length > 0 ? (
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-12">
                            {publishedPosts.map((post) => (
                                <article key={post.slug}>
                                    <Link href={`/blog/${post.slug}`} className="block mb-4 overflow-hidden rounded-lg">
                                        <Image
                                            src={post.imageUrl}
                                            alt={post.title}
                                            width={800}
                                            height={450}
                                            className="w-full object-cover aspect-video transition-transform duration-300 hover:scale-105"
                                        />
                                    </Link>
                                    <p className="text-sm font-semibold uppercase text-primary tracking-wider">{post.category}</p>
                                    <h2 className="text-3xl font-bold tracking-tight mt-2 mb-3">
                                        <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                                    </h2>
                                    <p className="text-muted-foreground line-clamp-3">
                                        {post.content.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                </article>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-8">
                             <div>
                                <h3 className="text-xl font-bold mb-4">Most Popular</h3>
                                <div className="space-y-6">
                                    {popularPosts.map(post => (
                                        <PopularPostItem key={post.slug} post={post} />
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-bold mb-4">News</h3>
                                <div className="space-y-6">
                                    {/* You can filter for 'news' category here if needed */}
                                    {publishedPosts.slice(0,2).map(post => (
                                        <PopularPostItem key={post.slug} post={post} />
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold">No posts yet</h2>
                        <p className="text-muted-foreground mt-2">Check back soon for updates!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
