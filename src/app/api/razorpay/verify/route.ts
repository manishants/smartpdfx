import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

type VerifyBody = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyBody = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {}
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing verification fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Server missing Razorpay secret' }, { status: 500 })
    }

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const expected = hmac.digest('hex')
    const verified = expected === razorpay_signature

    if (!verified) {
      return NextResponse.json({ success: false, verified }, { status: 400 })
    }

    // Optionally: persist donation record here

    return NextResponse.json({ success: true, verified })
  } catch (err: any) {
    console.error('[razorpay/verify] error:', err)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}