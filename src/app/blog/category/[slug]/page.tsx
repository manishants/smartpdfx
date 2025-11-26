import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { getBlogs } from '@/app/actions/blog'
import { getAllCategories } from '@/lib/cms/categoriesFs'

export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

function slugify(name: string) {
  return (name || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function humanize(slug: string) {
  return (slug || '')
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const categories = getAllCategories()
  const cat = categories.find(c => c.slug === params.slug)
  const name = cat?.name || humanize(params.slug)

  const title = `${name} – SmartPDFx Blog`
  const description = `Articles in the ${name} category from the SmartPDFx blog.`

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/category/${params.slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = params
  const categories = getAllCategories()
  const cat = categories.find(c => c.slug === slug)
  const categoryName = cat?.name || humanize(slug)

  const all = await getBlogs()
  const posts = all.filter(p => p.published && slugify(p.category || '') === slug)

  return (
    <div className="px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: categoryName }]} />
        <header className="text-center my-8 md:my-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{categoryName}</h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Browse posts in the {categoryName} category
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {posts.map(post => (
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
            <aside className="lg:col-span-4">
              {/* Optional: category sidebar listing or popular posts */}
            </aside>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">No posts in {categoryName} yet</h2>
            <p className="text-muted-foreground mt-2">Check back soon for updates!</p>
          </div>
        )}
      </div>
    </div>
  )
}