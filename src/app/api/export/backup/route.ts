import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { requireSuperadmin } from '@/lib/auth/guard'
import { addLog } from '@/lib/logsStore'

function readJsonSafe(file: string): any {
  try {
    if (!fs.existsSync(file)) return null
    const raw = fs.readFileSync(file, 'utf-8')
    if (!raw.trim()) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function listPublicFiles(rel: string): { path: string; size: number; mtime: string; hash: string }[] {
  const root = path.join(process.cwd(), 'public', rel)
  const walk = (dir: string, baseRel: string): { path: string; size: number; mtime: string; hash: string }[] => {
    if (!fs.existsSync(dir)) return []
    const out: { path: string; size: number; mtime: string; hash: string }[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(dir, e.name)
      const relPath = path.join(baseRel, e.name).replace(/\\/g, '/')
      if (e.isDirectory()) {
        out.push(...walk(p, relPath))
      } else if (e.isFile()) {
        const s = fs.statSync(p)
        const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
        out.push({ path: relPath, size: s.size, mtime: s.mtime.toISOString(), hash: h })
      }
    }
    return out
  }
  return walk(root, rel || '')
}

export async function GET(req: Request) {
  const deny = await requireSuperadmin(req)
  if (deny) return deny
  const url = new URL(req.url)
  const includeAssets = url.searchParams.get('includeAssets') === '1' || url.searchParams.get('includeAssets') === 'true'

  const libDir = path.join(process.cwd(), 'src', 'lib')
  const stores = {
    pageStore: readJsonSafe(path.join(libDir, 'pageStore.json')),
    blogStore: readJsonSafe(path.join(libDir, 'blogStore.json')),
    commentsStore: readJsonSafe(path.join(libDir, 'commentsStore.json')),
    newsletterStore: readJsonSafe(path.join(libDir, 'newsletterStore.json')),
    categoriesStore: readJsonSafe(path.join(libDir, 'categoriesStore.json')),
    analyticsStore: readJsonSafe(path.join(libDir, 'analyticsStore.json')),
    activeSessions: readJsonSafe(path.join(libDir, 'activeSessions.json')),
    seo: readJsonSafe(path.join(libDir, 'seo.json')),
  }

  const publicSummary = {
    files: [
      ...listPublicFiles(''),
    ],
  } as any

  if (includeAssets) {
    const assets: Record<string, string> = {}
    for (const f of publicSummary.files) {
      try {
        const abs = path.join(process.cwd(), 'public', f.path)
        assets[f.path] = fs.readFileSync(abs).toString('base64')
      } catch {}
    }
    publicSummary.assets = assets
  }

  const payload = {
    type: 'website_backup',
    generatedAt: new Date().toISOString(),
    version: 1,
    stores,
    public: publicSummary,
    note: 'Use includeAssets=1 to embed base64 contents of public files for a self-contained backup.'
  }

  const filename = `website_backup_${new Date().toISOString().slice(0,10)}.json`
  // Log website backup export
  try { await addLog({ type: 'export_backup', message: 'Website backup export', context: { includeAssets, filename } }) } catch {}
  return NextResponse.json(payload, {
    headers: {
      'content-disposition': `attachment; filename="${filename}"`,
    },
  })
}