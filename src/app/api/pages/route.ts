import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { StoredPage, mergeFilesystemPages } from '@/lib/pageStore'

const EXCLUDE_DIRS = new Set([
  'api',
  'admin',
  'superadmin',
  'dashboard',
  '_components'
])

function toTitle(slug: string) {
  const s = slug.replace(/^\//, '').replace(/-/g, ' ')
  if (!s) return 'Home Page'
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

function getAppPages(): StoredPage[] {
  const appDir = path.join(process.cwd(), 'src', 'app')
  const pages: StoredPage[] = []

  // Include root page.tsx as '/'
  const rootPagePath = path.join(appDir, 'page.tsx')
  if (fs.existsSync(rootPagePath)) {
    const stat = fs.statSync(rootPagePath)
    pages.push({
      id: 'root',
      title: 'Home Page',
      slug: '',
      status: 'published',
      lastModified: stat.mtime.toISOString(),
      sections: [],
    })
  }

  // Scan top-level directories in src/app for page.tsx
  const entries = fs.readdirSync(appDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name
    // Exclude dynamic and internal directories
    if (EXCLUDE_DIRS.has(name)) continue
    if (name.startsWith('(') || name.startsWith('[')) continue

    const pageFile = path.join(appDir, name, 'page.tsx')
    if (fs.existsSync(pageFile)) {
      const stat = fs.statSync(pageFile)
      const slug = `${name}` // store without leading slash
      pages.push({
        id: name,
        title: toTitle(slug),
        slug,
        status: 'published',
        lastModified: stat.mtime.toISOString(),
        sections: [],
      })
    }
  }

  return pages
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').toLowerCase()
    const status = searchParams.get('status') || 'all'

    const fsPages = getAppPages()
    console.log('Filesystem pages:', fsPages.map(p => ({ id: p.id, slug: p.slug, sections: p.sections?.length || 0 })))
    
    let pages = mergeFilesystemPages(fsPages)
    console.log('Final merged pages:', pages.map(p => ({ id: p.id, slug: p.slug, sections: p.sections?.length || 0 })))

    if (search) {
      pages = pages.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          (`/${p.slug}`).toLowerCase().includes(search)
      )
    }

    if (status !== 'all') {
      pages = pages.filter((p) => p.status === (status as 'published' | 'draft' | 'archived'))
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function PUT() {
  // Stub for future persistence; currently no-op
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function POST(request: NextRequest) {
  try {
    const pageData = await request.json();
    
    // Generate ID if not provided
    const id = pageData.id || `page-${Date.now()}`;
    
    // Convert CMS Page format to StoredPage format
    const storedPageData = {
      id,
      title: pageData.title,
      slug: pageData.slug,
      sections: pageData.sections || [],
      status: pageData.status || 'draft',
      description: pageData.metaDescription || '',
      lastModified: Date.now()
    };

    // Save to pageStore.json
    const { setStoredPage } = await import('@/lib/pageStore');
    const savedPage = setStoredPage(id, storedPageData);
    
    // Convert back to CMS Page format for response
    const cmsPage = {
      id: savedPage.id,
      title: savedPage.title,
      slug: savedPage.slug,
      sections: savedPage.sections || [],
      status: savedPage.status || 'published',
      createdAt: new Date(savedPage.lastModified || Date.now()),
      updatedAt: new Date(savedPage.lastModified || Date.now()),
      metaTitle: savedPage.title,
      metaDescription: savedPage.description || '',
      focusKeyword: pageData.focusKeyword || '',
      seoScore: pageData.seoScore || 50
    };

    return NextResponse.json(cmsPage);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}