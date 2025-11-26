import { NextResponse } from 'next/server'
import { getAllSubscribers } from '@/lib/newsletterFs'

export async function GET() {
  const subscribers = getAllSubscribers()
  return NextResponse.json({ subscribers })
}