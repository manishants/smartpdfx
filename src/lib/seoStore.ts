import fs from 'fs'
import path from 'path'

export type PageSEO = {
  title?: string
  description?: string
  keywords?: string[]
}

type SEOMap = Record<string, PageSEO>

const SEO_FILE = path.join(process.cwd(), 'src', 'lib', 'seo.json')

function ensureFile() {
  if (!fs.existsSync(SEO_FILE)) {
    fs.writeFileSync(SEO_FILE, JSON.stringify({}, null, 2), 'utf-8')
  }
}

export function getAllSEO(): SEOMap {
  ensureFile()
  const raw = fs.readFileSync(SEO_FILE, 'utf-8')
  try {
    const data = JSON.parse(raw)
    return data || {}
  } catch {
    return {}
  }
}

export function getPageSEO(slug: string): PageSEO {
  const map = getAllSEO()
  return map[slug] || {}
}

export function setPageSEO(slug: string, seo: PageSEO): PageSEO {
  const map = getAllSEO()
  map[slug] = {
    title: seo.title || '',
    description: seo.description || '',
    keywords: seo.keywords || [],
  }
  fs.writeFileSync(SEO_FILE, JSON.stringify(map, null, 2), 'utf-8')
  return map[slug]
}