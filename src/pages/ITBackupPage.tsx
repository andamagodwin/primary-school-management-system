import { useState, useEffect } from "react"
import { PlusIcon, DownloadIcon, TrashIcon, RefreshCwIcon, AlertTriangleIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getBackups, createBackup, deleteBackup, type SystemBackup } from "@/lib/systemBackups"

export default function ITBackupPage() {
  const user = useAuthStore((state) => state.user)
  const [backups, setBackups] = useState<SystemBackup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [backupFormData, setBackupFormData] = useState({
    backupType: 'full' as 'full' | 'database' | 'files' | 'incremental',
    description: '',
  })

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      setIsLoading(true)
      const backupsData = await getBackups()
      setBackups(backupsData)
    } catch (error) {
      console.error('Error loading backups:', error)
      toast.error('Failed to load backups')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createBackup({
        ...backupFormData,
        createdBy: user?.userId || "",
      })
      toast.success('System backup started. You will be notified when complete.')
      setShowBackupModal(false)
      setBackupFormData({ backupType: 'full', description: '' })
      loadBackups()
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Failed to create backup')
    }
  }

  const handleDeleteBackup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return
    try {
      await deleteBackup(id)
      toast.success('Backup deleted')
      loadBackups()
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('Failed to delete backup')
    }
  }

  const handleDownloadBackup = (backup: SystemBackup) => {
    if (backup.fileUrl) {
      window.open(backup.fileUrl, '_blank')
    } else {
      toast.info('Backup file not available yet')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const lastBackup = backups.length > 0 ? backups[0] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Backup & Recovery</h2>
          <p className="text-muted-foreground">Manage system backups and recovery operations</p>
        </div>
        <button
          onClick={() => setShowBackupModal(true)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4" />
          Create Backup
        </button>
      </div>

      {/* Backup Schedule & Last Backup */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold mb-4">Backup Schedule</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Daily Backup (2:00 AM)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Weekly Backup (Sunday 3:00 AM)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Monthly Backup (1st of month)</span>
            </label>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <RefreshCwIcon className="h-4 w-4" />
            Save Schedule
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold mb-4">Last Backup</h4>
          {lastBackup ? (
            <>
              <p className="text-sm mb-1">
                <strong>Date:</strong> {new Date(lastBackup.backupDate).toLocaleString()}
              </p>
              <p className="text-sm mb-1">
                <strong>Size:</strong> {lastBackup.backupSize}
              </p>
              <p className="text-sm mb-1">
                <strong>Status:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  lastBackup.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : lastBackup.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {lastBackup.status}
                </span>
              </p>
              <p className="text-sm">
                <strong>Next Backup:</strong> {new Date(Date.now() + 86400000).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No backups yet</p>
          )}
        </div>
      </div>

      {/* Recent Backups */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Backup Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No backups found
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{new Date(backup.backupDate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm capitalize">{backup.backupType}</td>
                    <td className="px-4 py-3 text-sm">{backup.backupSize}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        backup.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : backup.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup)}
                          className="p-1 rounded hover:bg-muted"
                          title="Download"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.$id)}
                          className="p-1 rounded hover:bg-muted text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disaster Recovery */}
      <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
          <h4 className="font-semibold text-yellow-800">Disaster Recovery</h4>
        </div>
        <p className="text-sm text-yellow-700 mb-4">
          In case of system failure, use the recovery options below:
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            <AlertTriangleIcon className="h-4 w-4" />
            System Recovery
          </button>
          <button className="flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700">
            <RefreshCwIcon className="h-4 w-4" />
            Restore Database
          </button>
          <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <DownloadIcon className="h-4 w-4" />
            Download Latest Backup
          </button>
        </div>
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create System Backup</h3>
            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Backup Type</label>
                <select
                  value={backupFormData.backupType}
                  onChange={(e) => setBackupFormData({ ...backupFormData, backupType: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="full">Full System Backup</option>
                  <option value="database">Database Only</option>
                  <option value="files">Files Only</option>
                  <option value="incremental">Incremental Backup</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Backup Description</label>
                <input
                  type="text"
                  value={backupFormData.description}
                  onChange={(e) => setBackupFormData({ ...backupFormData, description: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Enter backup description"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Include in backup:</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">User Accounts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Academic Marks</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Attendance Records</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Uploaded Files</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowBackupModal(false)
                    setBackupFormData({ backupType: 'full', description: '' })
                  }}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                >
                  Start Backup Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

