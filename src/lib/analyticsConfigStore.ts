import fs from 'fs'
import path from 'path'

export type AnalyticsConfig = {
  ga4PropertyId?: string
  gscSiteUrl?: string
  updatedAt?: string
}

const CONFIG_FILE = path.join(process.cwd(), 'src', 'lib', 'analytics-config.json')

function ensureFile() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({} satisfies AnalyticsConfig, null, 2), 'utf-8')
  }
}

export function readAnalyticsConfig(): AnalyticsConfig {
  ensureFile()
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    const parsed = JSON.parse(raw || '{}') as AnalyticsConfig
    return parsed || {}
  } catch {
    return {}
  }
}

export function writeAnalyticsConfig(update: Partial<AnalyticsConfig>): AnalyticsConfig {
  const current = readAnalyticsConfig()
  const next: AnalyticsConfig = {
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2), 'utf-8')
  return next
}