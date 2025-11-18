import fs from 'fs'
import path from 'path'

type LogEntry = {
  id: string
  type: 'export_project' | 'export_backup' | 'unlock_pdf' | 'contact_message'
  message: string
  context?: any
  createdAt: string
  userId?: string
}

const logFile = path.join(process.cwd(), 'src', 'lib', 'logsStore.json')

function ensureLogFile() {
  try {
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, JSON.stringify({ logs: [] }, null, 2), 'utf-8')
    }
  } catch {}
}

function readLogs(): { logs: LogEntry[] } {
  ensureLogFile()
  try {
    const raw = fs.readFileSync(logFile, 'utf-8')
    return raw ? JSON.parse(raw) : { logs: [] }
  } catch {
    return { logs: [] }
  }
}

function writeLogs(data: { logs: LogEntry[] }) {
  try {
    fs.writeFileSync(logFile, JSON.stringify(data, null, 2), 'utf-8')
  } catch {}
}

export async function addLog(entry: Omit<LogEntry, 'id' | 'createdAt'> & Partial<Pick<LogEntry, 'createdAt'>>): Promise<void> {
  const existing = readLogs()
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const createdAt = entry.createdAt || new Date().toISOString()
  const newEntry: LogEntry = { id, createdAt, ...entry } as LogEntry
  existing.logs.unshift(newEntry)
  // Cap log size to avoid runaway growth
  existing.logs = existing.logs.slice(0, 1000)
  writeLogs(existing)
}

export function getLogs(type?: LogEntry['type']): LogEntry[] {
  const { logs } = readLogs()
  return type ? logs.filter(l => l.type === type) : logs
}