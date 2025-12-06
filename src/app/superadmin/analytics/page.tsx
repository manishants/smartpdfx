"use client"

import { useEffect, useState } from 'react'

type DayStat = { day: string; views: number; unique: number; dwellSeconds?: number }
type MonthStat = { month: string; views: number; unique: number; dwellSeconds?: number }
type YearStat = { year: string; views: number; unique: number }
type PageStat = { page: string; views: number; unique: number; dwellSeconds?: number }

type Stats = {
  totals: { views: number }
  uniqueVisitors: number
  byDay: DayStat[]
  byMonth: MonthStat[]
  byYear: YearStat[]
  pages: PageStat[]
  liveVisitors: number
}

export default function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch('/api/analytics/stats', { cache: 'no-store' })
        if (!resp.ok) throw new Error('Failed to load stats')
        const json = await resp.json()
        setStats(json as Stats)
      } catch (e: any) {
        setError(e?.message || 'Error')
      }
    }
    fetchStats()
    const id = setInterval(fetchStats, 15000)
    return () => clearInterval(id)
  }, [])

  if (error) {
    return <div style={{ padding: 20 }}><h2>Analytics</h2><p style={{ color: 'red' }}>{error}</p></div>
  }

  if (!stats) {
    return <div style={{ padding: 20 }}><h2>Analytics</h2><p>Loading…</p></div>
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600 }}>Site Analytics (Superadmin)</h2>
      <p style={{ opacity: 0.7, marginTop: 4 }}>Privacy-first: no IP collection or storage.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 16 }}>
        <MetricCard label="Total views" value={String(stats.totals.views || 0)} />
        <MetricCard label="Unique visitors" value={String(stats.uniqueVisitors || 0)} />
        <MetricCard label="Live visitors" value={String(stats.liveVisitors || 0)} />
        <MetricCard label="Tracked pages" value={String(stats.pages.length || 0)} />
      </div>

      <Section title="By Day">
        <SimpleTable headers={["Day", "Views", "Unique"]} rows={stats.byDay.map(d => [d.day, d.views, d.unique])} />
      </Section>

      <Section title="By Month">
        <SimpleTable headers={["Month", "Views", "Unique", "Dwell (min)"]} rows={stats.byMonth.map(m => [m.month, m.views, m.unique, ((m.dwellSeconds || 0) / 60).toFixed(1)])} />
      </Section>

      <Section title="By Year">
        <SimpleTable headers={["Year", "Views", "Unique"]} rows={stats.byYear.map(y => [y.year, y.views, y.unique])} />
      </Section>

      <Section title="Pages">
        <SimpleTable headers={["Page", "Views", "Unique", "Avg Time (sec)"]} rows={stats.pages.map(p => [p.page, p.views, p.unique, p.views ? Math.round((p.dwellSeconds || 0) / p.views) : 0])} />
      </Section>

      {/* IP repeats removed per privacy setting */}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0f172a', color: '#fff', borderRadius: 10, padding: 16 }}>
      <div style={{ opacity: 0.8, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  )
}

function SimpleTable({ headers, rows }: { headers: (string)[]; rows: (any[])[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} style={{ padding: 8, borderBottom: '1px solid #222' }}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
