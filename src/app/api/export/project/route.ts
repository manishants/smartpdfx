import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { PassThrough, Readable } from 'stream'
import { requireSuperadmin } from '@/lib/auth/guard'
import { addLog } from '@/lib/logsStore'

type FileEntry = { path: string; size: number; mtime: string }

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  '.cache',
  'coverage',
  'out',
  'dist',
  'build',
])

function collectFiles(root: string, rel = ''): string[] {
  const dir = path.join(root, rel)
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const name = e.name
    const nextRel = path.join(rel, name)
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(name)) continue
      files.push(...collectFiles(root, nextRel))
    } else if (e.isFile()) {
      files.push(nextRel.replace(/\\/g, '/'))
    }
  }
  return files
}

export async function GET(req: Request) {
  const deny = await requireSuperadmin(req)
  if (deny) return deny
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'
  const root = process.cwd()
  const files = collectFiles(root)

  if (format === 'zip') {
    const filename = `project_snapshot_${new Date().toISOString().slice(0,10)}.zip`
    const archive = archiver('zip', { zlib: { level: 9 } })
    const stream = new PassThrough()
    archive.on('error', (err) => {
      stream.destroy(err as any)
    })

    archive.pipe(stream)

    for (const rel of files) {
      try {
        const abs = path.join(root, rel)
        archive.file(abs, { name: rel })
      } catch {
        // skip if file cannot be added
      }
    }

    archive.finalize()

    // Log project ZIP export
    try { await addLog({ type: 'export_project', message: 'Project ZIP export', context: { format: 'zip', fileCount: files.length, filename } }) } catch {}
    return new Response(Readable.toWeb(stream), {
      headers: {
        'content-type': 'application/zip',
        'content-disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // Fallback to JSON payload
  const project: Record<string, { size: number; mtime: string; base64: string }> = {}
  for (const rel of files) {
    try {
      const abs = path.join(root, rel)
      const stat = fs.statSync(abs)
      const buf = fs.readFileSync(abs)
      project[rel] = {
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        base64: buf.toString('base64'),
      }
    } catch {
      // skip unreadable files
    }
  }

  const payload = {
    type: 'project_snapshot',
    generatedAt: new Date().toISOString(),
    root: path.basename(root),
    files: project,
    note: 'This JSON archive contains base64-encoded file contents excluding heavy build and dependency directories.',
    excludes: Array.from(IGNORE_DIRS),
  }

  const filename = `project_snapshot_${new Date().toISOString().slice(0,10)}.json`
  // Log project JSON export
  try { await addLog({ type: 'export_project', message: 'Project JSON export', context: { format: 'json', fileCount: files.length, filename } }) } catch {}
  return NextResponse.json(payload, {
    headers: {
      'content-disposition': `attachment; filename="${filename}"`,
    },
  })
}