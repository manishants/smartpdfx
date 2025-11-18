import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  return (envUrl?.replace(/\/$/, '') || 'https://www.smartpdfx.com')
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(full, files)
    } else {
      const ext = path.extname(e.name).toLowerCase()
      if (IMAGE_EXTS.has(ext)) files.push(full)
    }
  }
  return files
}

export async function GET() {
  try {
    const URL = getSiteUrl()
    const publicDir = path.join(process.cwd(), 'public')
    const files = walk(publicDir)

    const items = files.map((f) => {
      const rel = path.relative(publicDir, f).replace(/\\/g, '/')
      const imgUrl = `${URL}/${encodeURI(rel)}`
      const stat = fs.statSync(f)
      return { imgUrl, lastMod: stat.mtime.toISOString() }
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
      items.map(item => (
        `  <url>\n` +
        `    <loc>${URL}/</loc>\n` +
        `    <lastmod>${item.lastMod}</lastmod>\n` +
        `    <image:image>\n` +
        `      <image:loc>${item.imgUrl}</image:loc>\n` +
        `    </image:image>\n` +
        `  </url>`
      )).join('\n') +
      `\n</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, max-age=3600',
      },
    })
  } catch (e) {
    const fallback = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`
    return new NextResponse(fallback, { headers: { 'Content-Type': 'application/xml' } })
  }
}