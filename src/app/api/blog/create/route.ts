import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { BlogPost, Faq } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'You must be logged in to create a post.' }, { status: 401 })
  }

  const formData = await req.formData()
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const author = formData.get('author') as string
  const image = formData.get('image') as File
  const slug = (formData.get('slug') as string) || ''
  const seoTitle = (formData.get('seoTitle') as string) || ''
  const metaDescription = (formData.get('metaDescription') as string) || ''
  const published = (formData.get('published') as string) === 'true'

  const faqs: Faq[] = []
  formData.forEach((value, key) => {
    if (key.startsWith('faq-question-')) {
      const index = key.split('-').pop()
      const answer = formData.get(`faq-answer-${index}`) as string
      if (value && answer) {
        faqs.push({ question: value as string, answer })
      }
    }
  })

  if (!title || !content || !author || !image) {
    return NextResponse.json({ error: 'Title, Content, Author, and Image are required.' }, { status: 400 })
  }

  const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
  const imageName = `${finalSlug}-${Date.now()}`

  const { data: imageData, error: imageError } = await supabase.storage
    .from('blogs')
    .upload(imageName, image)

  if (imageError) {
    console.error('Error uploading image:', imageError)
    return NextResponse.json({ error: 'Failed to upload image. Ensure a "blogs" bucket exists in Supabase Storage.' }, { status: 500 })
  }

  const { data: imageUrlData } = supabase.storage
    .from('blogs')
    .getPublicUrl(imageData.path)

  const imageUrl = imageUrlData.publicUrl

  const newPost: Omit<BlogPost, 'id' | 'created_at'> = {
    slug: finalSlug,
    title,
    content,
    author,
    date: new Date().toISOString(),
    imageUrl,
    published,
    seoTitle: seoTitle || title,
    metaDescription,
    faqs,
  }

  const { error: insertError } = await supabase
    .from('blogs')
    .insert([newPost])

  if (insertError) {
    console.error('Error creating post:', insertError)
    if ((insertError as any).code === '42P01') {
      return NextResponse.json({ error: 'The "blogs" table does not exist. Please create it in your Supabase project.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create blog post in the database.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, slug: finalSlug })
}