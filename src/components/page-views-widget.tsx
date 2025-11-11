"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { attachGlobalTracker, getAllStats, getPageVisits, getTotalVisits, trackPageView, startHeartbeat } from '@/lib/analytics/localTracker'

export function PageViewsWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [convCount, setConvCount] = useState(0)
  const [dlCount, setDlCount] = useState(0)
  const [liveCount, setLiveCount] = useState<number | null>(null)

  useEffect(() => {
    // Ensure global helper exists
    attachGlobalTracker()
    // Track current page view and start heartbeat
    const current = pathname || '/'
    trackPageView(current)
    startHeartbeat(current)
    // Update counts
    const stats = getAllStats()
    setPageCount(stats.pages[pathname || '/'] || 0)
    setTotalCount(stats.totalVisits || 0)
    setConvCount(Object.values(stats.conversions).reduce((a, b) => a + b, 0))
    setDlCount(Object.values(stats.downloads).reduce((a, b) => a + b, 0))
  }, [pathname])

  useEffect(() => {
    const id = setInterval(() => {
      const stats = getAllStats()
      setPageCount(stats.pages[pathname || '/'] || 0)
      setTotalCount(stats.totalVisits || 0)
      setConvCount(Object.values(stats.conversions).reduce((a, b) => a + b, 0))
      setDlCount(Object.values(stats.downloads).reduce((a, b) => a + b, 0))
    }, 2000)
    return () => clearInterval(id)
  }, [pathname])

  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fetch('/api/analytics/stats', { cache: 'no-store' })
        if (resp.ok) {
          const json = await resp.json()
          setLiveCount(typeof json?.liveVisitors === 'number' ? json.liveVisitors : null)
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => clearInterval(id)
  }, [pathname])

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 50 }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          Stats
        </button>
      )}
      {open && (
        <div
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            minWidth: 220,
            padding: 12,
            borderRadius: 10,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>Local Stats</strong>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close tracker"
              style={{
                background: 'transparent',
                color: '#fff',
                border: 'none',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >×</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6 }}>
            <div><span style={{ opacity: 0.8 }}>Page:</span> <code>{pathname || '/'}</code></div>
            <div><span style={{ opacity: 0.8 }}>Page visits:</span> {pageCount}</div>
            <div><span style={{ opacity: 0.8 }}>Total visits:</span> {totalCount}</div>
            <div><span style={{ opacity: 0.8 }}>Conversions:</span> {convCount}</div>
            <div><span style={{ opacity: 0.8 }}>Downloads:</span> {dlCount}</div>
            {liveCount !== null && (
              <div><span style={{ opacity: 0.8 }}>Live visitors:</span> {liveCount}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function useRecordConversion(key: string) {
  useEffect(() => {
    // Expose as simple hook for tools to call
    if (typeof window !== 'undefined') {
      window.SPXTracker?.recordConversion(key)
    }
  }, [key])
}

export function useRecordDownload(key: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.SPXTracker?.recordDownload(key)
    }
  }, [key])
}