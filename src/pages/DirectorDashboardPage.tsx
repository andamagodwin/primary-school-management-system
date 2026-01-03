import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  DollarSignIcon, 
  UsersIcon, 
  UserCogIcon, 
  AlertTriangleIcon,
  EyeIcon,
  UserPlusIcon,
  GraduationCapIcon,
  CalculatorIcon,
  CrownIcon,
  LaptopIcon
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getFinancialSummary } from "@/lib/financial"
import { getStudents } from "@/lib/students"
import { getTeachers } from "@/lib/teachers"
import { getAuditLogs } from "@/lib/auditLogs"
import { getExams } from "@/lib/exams"
import { getApplications } from "@/lib/staffApplications"

export default function DirectorDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalStaff: 0,
    pendingAlerts: 0,
  })
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const currentYear = new Date().getFullYear().toString()
  const currentTerm = "Term3"

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Get financial summary
      const financialSummary = await getFinancialSummary(currentTerm, currentYear)
      setStats(prev => ({ ...prev, totalRevenue: financialSummary.totalRevenue }))

      // Get total students
      const students = await getStudents()
      setStats(prev => ({ ...prev, totalStudents: students.length }))

      // Get total staff
      const teachers = await getTeachers()
      setStats(prev => ({ ...prev, totalStaff: teachers.length }))

      // Get pending alerts
      const [pendingExams, pendingApplications] = await Promise.all([
        getExams({ status: 'submitted' }),
        getApplications({ status: 'pending' }),
      ])
      const alerts = []
      if (pendingExams.length > 0) {
        alerts.push({
          id: 1,
          type: 'academic',
          message: `${pendingExams.length} exams pending review`,
          severity: 'medium',
          date: new Date().toLocaleDateString(),
        })
      }
      if (pendingApplications.length > 0) {
        alerts.push({
          id: 2,
          type: 'staff',
          message: `${pendingApplications.length} staff applications pending`,
          severity: 'medium',
          date: new Date().toLocaleDateString(),
        })
      }
      if (financialSummary.utilization > 90) {
        alerts.push({
          id: 3,
          type: 'financial',
          message: `Budget utilization at ${financialSummary.utilization.toFixed(1)}%`,
          severity: 'high',
          date: new Date().toLocaleDateString(),
        })
      }
      setCriticalAlerts(alerts)
      setStats(prev => ({ ...prev, pendingAlerts: alerts.length }))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${(amount / 1000000).toFixed(1)}M`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Director's Portal</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Director'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Term 3 {currentYear}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-3xl font-bold">{stats.totalStaff}</p>
              <p className="text-xs text-muted-foreground mt-1">Teaching & Non-teaching</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <UserCogIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
              <p className="text-3xl font-bold">{stats.pendingAlerts}</p>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            Critical Alerts Requiring Attention
          </h3>
          <button
            onClick={() => navigate('/director/audit-logs')}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {criticalAlerts.length > 0 ? (
            criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border-l-4 p-4 ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-600' : 'bg-yellow-600'
                        }`}
                      />
                      <strong>{alert.message}</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert • {alert.date}
                    </p>
                  </div>
                  <button className="rounded-md border bg-background px-3 py-1 text-sm hover:bg-muted">
                    Resolve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No critical alerts</p>
          )}
        </div>
      </div>

      {/* Quick Access to Admin Portals */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold">Quick Access to Admin Portals</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border-l-4 border-l-blue-600 bg-card p-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <GraduationCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="mb-2 font-semibold">Director of Studies</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Academic management, exams, student results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/director/view-dos')}
                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-muted"
              >
                <EyeIcon className="mr-1 inline h-4 w-4" />
                View
              </button>
              <button
                onClick={() => navigate('/director/create-accounts')}
                className="flex-1 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <UserPlusIcon className="mr-1 inline h-4 w-4" />
                Create
              </button>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-l-amber-600 bg-card p-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <CalculatorIcon className="h-6 w-6 text-amber-600" />
            </div>
            <h4 className="mb-2 font-semibold">Bursar</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Financial management, fees, inventory
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/director/view-bursar')}
                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-muted"
              >
                <EyeIcon className="mr-1 inline h-4 w-4" />
                View
              </button>
              <button
                onClick={() => navigate('/director/create-accounts')}
                className="flex-1 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <UserPlusIcon className="mr-1 inline h-4 w-4" />
                Create
              </button>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-l-gray-600 bg-card p-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <CrownIcon className="h-6 w-6 text-gray-600" />
            </div>
            <h4 className="mb-2 font-semibold">Head Teacher</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Overall school management, staff supervision
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/director/view-headteacher')}
                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-muted"
              >
                <EyeIcon className="mr-1 inline h-4 w-4" />
                View
              </button>
              <button
                onClick={() => navigate('/director/create-accounts')}
                className="flex-1 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <UserPlusIcon className="mr-1 inline h-4 w-4" />
                Create
              </button>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-l-green-600 bg-card p-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <LaptopIcon className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="mb-2 font-semibold">IT Administrator</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              System maintenance, technical support
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/director/view-it')}
                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-muted"
              >
                <EyeIcon className="mr-1 inline h-4 w-4" />
                View
              </button>
              <button
                onClick={() => navigate('/director/create-accounts')}
                className="flex-1 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <UserPlusIcon className="mr-1 inline h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


