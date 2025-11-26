import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

function getImageType(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif': return 'image/gif'
    case '.svg': return 'image/svg+xml'
    case '.ico': return 'image/x-icon'
    default: return 'application/octet-stream'
  }
}

function toWebUrl(rootPublic: string, fullPath: string): string {
  const rel = path.relative(rootPublic, fullPath).replace(/\\/g, '/')
  // Encode each segment to handle spaces and special chars
  return '/' + rel.split('/').map(encodeURIComponent).join('/')
}

function toAlt(name: string): string {
  const base = name.replace(/\.[^.]+$/, '')
  return base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function listImagesRecursively(dir: string, rootPublic: string, acc: any[] = []): any[] {
  if (!fs.existsSync(dir)) return acc
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      listImagesRecursively(full, rootPublic, acc)
      continue
    }
    const ext = path.extname(entry.name)
    if (!ext) continue
    const type = getImageType(ext)
    if (!type.startsWith('image/')) continue
    const stat = fs.statSync(full)
    acc.push({
      id: `fs-${toWebUrl(rootPublic, full)}`,
      name: entry.name,
      url: toWebUrl(rootPublic, full),
      size: stat.size,
      type,
      uploadedAt: stat.mtime,
      alt: toAlt(entry.name)
    })
  }
  return acc
}

export async function GET() {
  try {
    const root = path.join(process.cwd(), 'public')
    const files = listImagesRecursively(root, root)
    return NextResponse.json({ files }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list media' }, { status: 500 })
  }
}