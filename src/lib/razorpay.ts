import Razorpay from 'razorpay'

export function getRazorpayInstance() {
  // Use server-only keys; do not fall back to NEXT_PUBLIC_* for server requests
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET')
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function getPublicKeyId() {
  // Client-only key id exposed in browser for checkout
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
}