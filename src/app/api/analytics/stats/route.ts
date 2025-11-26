import { NextResponse } from 'next/server'
import { readAnalyticsStore, getLiveVisitors } from '@/lib/analyticsFs'

export async function GET() {
  try {
    const store = readAnalyticsStore()
    const live = getLiveVisitors(90)

    const byDay = Object.entries(store.day).map(([day, d]) => ({ day, views: d.views, unique: (d.uniqueVisitors || []).length }))
    const byMonth = Object.entries(store.month).map(([month, m]) => ({ month, views: m.views, unique: (m.uniqueVisitors || []).length }))
    const byYear = Object.entries(store.year).map(([year, y]) => ({ year, views: y.views, unique: (y.uniqueVisitors || []).length }))
    const pages = Object.entries(store.pages).map(([page, p]) => ({ page, views: p.views, unique: (p.uniqueVisitors || []).length }))

    return NextResponse.json({
      totals: { views: store.totals.views },
      uniqueVisitors: (store.uniqueVisitors || []).length,
      byDay,
      byMonth,
      byYear,
      pages,
      liveVisitors: live,
    })
  } catch (err: any) {
    return new NextResponse('Failed to read stats', { status: 500 })
  }
}