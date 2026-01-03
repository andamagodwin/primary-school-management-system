import { useState, useEffect } from "react"
import { RefreshCwIcon, ServerIcon, DatabaseIcon, CpuIcon, HardDriveIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

export default function ITSystemHealthPage() {
  const [systemHealth, setSystemHealth] = useState({
    database: { usage: 45, status: 'healthy' },
    cpu: { usage: 32, status: 'normal' },
    memory: { usage: 68, status: 'good' },
    network: { latency: 28, status: 'stable' },
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshSystemHealth = () => {
    setIsRefreshing(true)
    // Simulate system health check
    setTimeout(() => {
      setSystemHealth({
        database: { usage: Math.floor(Math.random() * 30) + 40, status: 'healthy' },
        cpu: { usage: Math.floor(Math.random() * 40) + 20, status: 'normal' },
        memory: { usage: Math.floor(Math.random() * 30) + 50, status: 'good' },
        network: { latency: Math.floor(Math.random() * 20) + 20, status: 'stable' },
      })
      setIsRefreshing(false)
      toast.success('System health metrics refreshed')
    }, 1000)
  }

  useEffect(() => {
    refreshSystemHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'normal':
      case 'good':
      case 'stable':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (usage: number) => {
    if (usage > 80) return 'bg-red-600'
    if (usage > 60) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health & Performance</h2>
          <p className="text-muted-foreground">Monitor system resources and performance metrics</p>
        </div>
        <button
          onClick={refreshSystemHealth}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5" />
              Database
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.database.status)}`}>
              {systemHealth.database.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Storage Usage: {systemHealth.database.usage}%</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(systemHealth.database.usage)}`}
              style={{ width: `${systemHealth.database.usage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Connected: Active users</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <CpuIcon className="h-5 w-5" />
              Server CPU
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.cpu.status)}`}>
              {systemHealth.cpu.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Usage: {systemHealth.cpu.usage}%</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(systemHealth.cpu.usage)}`}
              style={{ width: `${systemHealth.cpu.usage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Load Average: 1.2, 1.0, 0.8</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <HardDriveIcon className="h-5 w-5" />
              Memory
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.memory.status)}`}>
              {systemHealth.memory.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Usage: {systemHealth.memory.usage}%</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(systemHealth.memory.usage)}`}
              style={{ width: `${systemHealth.memory.usage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">4.2GB / 6.0GB used</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <ServerIcon className="h-5 w-5" />
              Network
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemHealth.network.status)}`}>
              {systemHealth.network.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Latency: {systemHealth.network.latency}ms</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Uptime: 99.8%</p>
        </div>
      </div>

      {/* Portal Status */}
      <div className="rounded-lg border bg-card p-6">
        <h4 className="text-lg font-semibold mb-4">Portal Status</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted border-l-4 border-l-green-600">
            <h5 className="font-medium mb-2">Teacher Portal</h5>
            <p className="text-sm text-muted-foreground mb-1">
              Status: <span className="text-green-600 font-medium">Online</span>
            </p>
            <p className="text-xs text-muted-foreground">Active Sessions: 12</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border-l-4 border-l-green-600">
            <h5 className="font-medium mb-2">DOS Portal</h5>
            <p className="text-sm text-muted-foreground mb-1">
              Status: <span className="text-green-600 font-medium">Online</span>
            </p>
            <p className="text-xs text-muted-foreground">Active Sessions: 3</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border-l-4 border-l-green-600">
            <h5 className="font-medium mb-2">Student Portal</h5>
            <p className="text-sm text-muted-foreground mb-1">
              Status: <span className="text-green-600 font-medium">Online</span>
            </p>
            <p className="text-xs text-muted-foreground">Active Sessions: 45</p>
          </div>
          <div className="p-4 rounded-lg bg-muted border-l-4 border-l-yellow-600">
            <h5 className="font-medium mb-2">Parent Portal</h5>
            <p className="text-sm text-muted-foreground mb-1">
              Status: <span className="text-yellow-600 font-medium">Offline</span>
            </p>
            <p className="text-xs text-muted-foreground">Under Maintenance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

