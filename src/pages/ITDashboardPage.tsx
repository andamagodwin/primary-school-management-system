import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  UsersIcon, 
  GraduationCapIcon, 
  UserIcon, 
  AlertTriangleIcon,
  PlusIcon,
  SettingsIcon,
  DownloadIcon,
  Loader2Icon,
  ClockIcon
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getSystemStats } from "@/lib/userManagement"
import { getAuditLogs } from "@/lib/auditLogs"

export default function ITDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingIssues: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const systemStats = await getSystemStats()
      setStats(systemStats)
      
      // Get recent audit logs
      const logs = await getAuditLogs({})
      setRecentActivities(logs.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">IT Administrator Portal</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'IT Administrator'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Teacher Accounts</p>
              <p className="text-3xl font-bold">{stats.totalTeachers}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <GraduationCapIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Student Accounts</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Issues</p>
              <p className="text-3xl font-bold">{stats.pendingIssues}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activities */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Recent System Activities
          </h3>
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activities</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.$id} className="p-4 rounded-md border-b flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.description || activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.userId} • {new Date(activity.$createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Quick Actions
          </h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/it/teachers')}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add New Teacher
          </button>
          <button
            onClick={() => navigate('/it/students')}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add New Student
          </button>
          <button
            onClick={() => navigate('/it/system')}
            className="flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <SettingsIcon className="h-4 w-4" />
            System Check
          </button>
          <button
            onClick={() => navigate('/it/backup')}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <DownloadIcon className="h-4 w-4" />
            Backup Now
          </button>
        </div>
      </div>
    </div>
  )
}

