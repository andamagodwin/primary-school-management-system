import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ClipboardListIcon,
  UserCheckIcon,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getStudents } from "@/lib/students"
import { getTeachers } from "@/lib/teachers"
import { getClasses } from "@/lib/classes"
import { getEvents } from "@/lib/events"
import { getApplications } from "@/lib/staffApplications"

export default function HeadTeacherDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    upcomingEvents: 0,
    pendingApplications: 0,
  })
  const [recent, setRecent] = useState<
    { icon: any; text: string; time: string; color?: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)

      const [students, teachers, classes, events, applications] = await Promise.all([
        getStudents(),
        getTeachers(),
        getClasses(),
        getEvents(),
        getApplications({ status: "pending" }),
      ])

      const upcoming = events.filter(
        (e) => e.status === "upcoming" && new Date(e.eventDate) >= new Date()
      )

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        upcomingEvents: upcoming.length,
        pendingApplications: applications.length,
      })

      const activities: { icon: any; text: string; time: string; color?: string }[] = []
      if (students[0]) {
        activities.push({
          icon: GraduationCapIcon,
          text: `New/updated student: ${students[0].fullName || students[0].name || students[0].studentName || "Student"}`,
          time: new Date(students[0].$createdAt).toLocaleDateString(),
          color: "text-primary",
        })
      }
      if (applications[0]) {
        activities.push({
          icon: UserCheckIcon,
          text: `Pending staff application: ${applications[0].applicantName}`,
          time: new Date(applications[0].$createdAt).toLocaleDateString(),
          color: "text-yellow-600",
        })
      }
      if (upcoming[0]) {
        activities.push({
          icon: CalendarIcon,
          text: `Upcoming event: ${upcoming[0].title}`,
          time: new Date(upcoming[0].eventDate).toLocaleDateString(),
          color: "text-blue-600",
        })
      }
      setRecent(activities)
    } catch (err) {
      console.error("Failed to load headteacher dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading headteacher dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-red-600">{error}</p>
        <button className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-white" onClick={load}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Head Teacher Portal</h2>
        <p className="text-muted-foreground">Welcome back, {user?.fullName || "Head Teacher"}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
              <p className="text-3xl font-bold">{stats.totalTeachers}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-3xl font-bold">{stats.totalClasses}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpenIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
              <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Staff Applications</p>
              <p className="text-3xl font-bold">{stats.pendingApplications}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <UserCheckIcon className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
          <div className="mt-4">
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/staff-management")}
            >
              Review applications
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Overview</p>
              <p className="text-3xl font-bold">--</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <ClipboardListIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Connect to attendance data source to enable</p>
          <div className="mt-4">
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/attendance")}
            >
              View attendance
            </button>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Highlights</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recent.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`rounded-full bg-muted p-2 ${item.color || ""}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
