import { NextRequest, NextResponse } from 'next/server'
import {
  getGeminiKeys,
  addGeminiKey,
  deleteGeminiKey,
  setGeminiKeyEnabled,
  getGeminiRotation,
  setGeminiRotationEnabled,
  setGeminiRotationStrategy,
  maskKey,
} from '@/lib/apiKeysStore'

export async function GET() {
  const keys = getGeminiKeys().map(k => ({
    id: k.id,
    label: k.label || '',
    maskedKey: maskKey(k.key),
    enabled: k.enabled,
    createdAt: k.createdAt,
  }))
  const rotation = getGeminiRotation()
  return NextResponse.json({ keys, rotation })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const key = String(body?.key || '')
    const label = body?.label ? String(body.label) : undefined
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    }
    const record = addGeminiKey(key, label)
    return NextResponse.json({ id: record.id })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deleteGeminiKey(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    if (typeof body?.rotationEnabled === 'boolean') {
      const rot = setGeminiRotationEnabled(Boolean(body.rotationEnabled))
      return NextResponse.json({ rotation: rot })
    }

    if (typeof body?.rotationStrategy === 'string') {
      const strategy = body.rotationStrategy === 'minute' ? 'minute' : 'hourly'
      const rot = setGeminiRotationStrategy(strategy)
      return NextResponse.json({ rotation: rot })
    }

    if (typeof body?.id === 'string' && typeof body?.enabled === 'boolean') {
      const updated = setGeminiKeyEnabled(body.id, Boolean(body.enabled))
      if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ id: updated.id, enabled: updated.enabled })
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
