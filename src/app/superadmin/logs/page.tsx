import { getLogs } from '@/lib/logsStore'

export default async function SuperadminLogsPage() {
  const exportProjectLogs = getLogs('export_project')
  const exportBackupLogs = getLogs('export_backup')
  const unlockPdfLogs = getLogs('unlock_pdf')

  const Section = ({ title, logs }: { title: string; logs: ReturnType<typeof getLogs> }) => (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No logs yet.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="rounded border p-3">
              <div className="text-sm text-gray-600">
                {new Date(log.createdAt).toLocaleString()} {log.userId ? `• ${log.userId}` : ''}
              </div>
              <div className="mt-1">{log.message}</div>
              {log.context ? (
                <pre className="mt-2 text-xs bg-gray-50 rounded p-2 overflow-x-auto">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <a href="/superadmin/export" className="text-sm text-blue-600 hover:underline">Back to Export Tools</a>
      </div>
      <Section title="Project Export Logs" logs={exportProjectLogs} />
      <Section title="Website Backup Logs" logs={exportBackupLogs} />
      <Section title="Unlock PDF Logs" logs={unlockPdfLogs} />
    </div>
  )
}