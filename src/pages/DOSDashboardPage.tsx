import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  FileTextIcon, 
  UsersIcon, 
  UserCheckIcon, 
  CalendarIcon,
  BellIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  PlusIcon
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getExams } from "@/lib/exams"
import { getApplications } from "@/lib/staffApplications"
import { getStudents } from "@/lib/students"
import { getEvents } from "@/lib/events"

export default function DOSDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    pendingExams: 0,
    totalStudents: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Get pending exams
      const exams = await getExams({ status: 'submitted' })
      setStats(prev => ({ ...prev, pendingExams: exams.length }))

      // Get pending applications
      const applications = await getApplications({ status: 'pending' })
      setStats(prev => ({ ...prev, pendingApplications: applications.length }))

      // Get total students
      const students = await getStudents()
      setStats(prev => ({ ...prev, totalStudents: students.length }))

      // Get upcoming events
      const events = await getEvents()
      const upcoming = events.filter(e => 
        e.status === 'upcoming' && new Date(e.eventDate) >= new Date()
      )
      setStats(prev => ({ ...prev, upcomingEvents: upcoming.length }))

      // Load recent activities
      const activities = []
      if (exams.length > 0) {
        activities.push({
          icon: FileTextIcon,
          text: `${exams[0].createdByName} submitted ${exams[0].title}`,
          time: new Date(exams[0].$createdAt).toLocaleDateString(),
          color: 'text-blue-600',
        })
      }
      if (applications.length > 0) {
        activities.push({
          icon: UserCheckIcon,
          text: `New application from ${applications[0].applicantName}`,
          time: new Date(applications[0].$createdAt).toLocaleDateString(),
          color: 'text-yellow-600',
        })
      }
      setRecentActivities(activities)
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Director of Studies Portal</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Director of Studies'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Exams Review</p>
              <p className="text-3xl font-bold">{stats.pendingExams}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Applications</p>
              <p className="text-3xl font-bold">{stats.pendingApplications}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <UserCheckIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
              <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              Recent Activities
            </h3>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center gap-3 rounded-lg border-l-4 border-primary bg-muted/50 p-3">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="grid gap-3">
            <button
              onClick={() => navigate('/dos/exams')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <EyeIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Review Exams</p>
                <p className="text-sm text-muted-foreground">Approve or reject submitted exams</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/dos/applications')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <UserCheckIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Process Applications</p>
                <p className="text-sm text-muted-foreground">Review staff applications</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/dos/report-comments')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <MessageSquareIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Add Report Comments</p>
                <p className="text-sm text-muted-foreground">Add comments to student reports</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/dos/sports-events')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <PlusIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Add New Event</p>
                <p className="text-sm text-muted-foreground">Create sports and cultural events</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

