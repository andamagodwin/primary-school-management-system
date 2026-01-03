import { useState, useEffect } from "react"
import { FilterIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getAuditLogs, type AuditLog } from "@/lib/auditLogs"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [userFilter, setUserFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, userFilter, actionFilter])

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true)
      const allLogs = await getAuditLogs()
      setLogs(allLogs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    if (userFilter !== "all") {
      filtered = filtered.filter(log => 
        log.userType.toLowerCase().includes(userFilter.toLowerCase())
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    setFilteredLogs(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Audit Logs</h2>
          <p className="text-muted-foreground">Monitor all system activities and user actions</p>
        </div>
        <button
          onClick={() => toast.success('Audit logs exported successfully')}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <DownloadIcon className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">User Type</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Users</option>
            <option value="director">Director</option>
            <option value="headteacher">Head Teacher</option>
            <option value="dos">DOS</option>
            <option value="bursar">Bursar</option>
            <option value="it">IT</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="account_creation">Account Creation</option>
            <option value="password_reset">Password Reset</option>
            <option value="account_deactivation">Account Deactivation</option>
            <option value="financial">Financial</option>
            <option value="data_access">Data Access</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadAuditLogs}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.$createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userType}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatAction(log.action)}</td>
                    <td className="px-4 py-3 text-sm">{log.details || '-'}</td>
                    <td className="px-4 py-3 text-sm">{log.ipAddress || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      )}
    </div>
  )
}


