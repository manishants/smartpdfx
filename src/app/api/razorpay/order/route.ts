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

    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt,
      notes,
    })

    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    console.error('[razorpay/order] error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}