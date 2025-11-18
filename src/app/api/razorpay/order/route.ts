import { NextRequest, NextResponse } from 'next/server'
import { getRazorpayInstance } from '@/lib/razorpay'

type CreateOrderBody = {
  amount: number // in INR (rupees)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json()
    const amountInRupees = Number(body?.amount)
    if (!amountInRupees || amountInRupees <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    const currency = body.currency || 'INR'
    const receipt = body.receipt || `donation_${Date.now()}`
    const notes = body.notes || {}

    // Helpful check: ensure server key id matches public key id used on client
    const serverKeyId = process.env.RAZORPAY_KEY_ID
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!serverKeyId || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Server Razorpay keys missing' }, { status: 500 })
    }
    if (publicKeyId && publicKeyId !== serverKeyId) {
      console.warn('[razorpay/order] Mismatched key ids between server and client:', { serverKeyId: '***', publicKeyId: '***' })
    }

    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt,
      notes,
    })

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    const message = err?.error?.description || err?.message || 'Failed to create order'
    const isAuthError = /Authentication failed/i.test(message)
    const hint = isAuthError
      ? 'Authentication failed: ensure .env.local has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (server-only) and restart dev server.'
      : undefined
    console.error('[razorpay/order] error:', message)
    return NextResponse.json({ error: message, hint }, { status: 500 })
  }
}