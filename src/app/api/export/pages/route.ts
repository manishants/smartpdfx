import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Export stored editable pages (tool pages) from pageStore.json
export async function GET() {
  try {
    const file = path.join(process.cwd(), 'src', 'lib', 'pageStore.json')
    const raw = fs.readFileSync(file, 'utf-8')
    const store = raw ? JSON.parse(raw) : {}
    const filename = `pages_${new Date().toISOString().slice(0,10)}.json`
    return NextResponse.json(store, {
      headers: {
        'content-disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    return new NextResponse('Failed to read pages', { status: 500 })
  }
}