import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  UsersIcon, 
  EditIcon, 
  CalendarIcon, 
  UploadIcon, 
  BookOpenIcon,
  BellIcon,
  ClockIcon,
  TrendingUpIcon
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getClassesByTeacher } from "@/lib/classes"
import { getStudents } from "@/lib/students"
import { getMarks } from "@/lib/marks"
import { getAttendance } from "@/lib/attendance"
import type { Class } from "@/lib/classes"
import type { Student } from "@/lib/students"

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingMarks: 0,
    attendanceRate: 0,
    myClasses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const currentYear = new Date().getFullYear().toString()
      const currentTerm = 'Term3' // You can make this dynamic

      // Get teacher's classes
      if (user?.userId) {
        const teacherClasses = await getClassesByTeacher(user.userId)
        setClasses(teacherClasses)
        setStats(prev => ({ ...prev, myClasses: teacherClasses.length }))

        // Get students from teacher's classes
        const allStudents = await getStudents()
        const myStudents = allStudents.filter(s => 
          teacherClasses.some(c => c.$id === s.classId)
        )
        setStudents(myStudents)
        setStats(prev => ({ ...prev, totalStudents: myStudents.length }))

        // Get pending marks
        const marks = await getMarks({
          academicYear: currentYear,
          term: currentTerm,
        })
        const pending = marks.filter(m => m.status === 'draft' || m.status === 'saved')
        setStats(prev => ({ ...prev, pendingMarks: pending.length }))

        // Calculate attendance rate
        const today = new Date().toISOString().split('T')[0]
        const attendance = await getAttendance({
          startDate: today,
          endDate: today,
        })
        if (attendance.length > 0) {
          const present = attendance.filter(a => a.status === 'present').length
          const rate = (present / attendance.length) * 100
          setStats(prev => ({ ...prev, attendanceRate: Math.round(rate) }))
        }
      }
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
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Teacher'}
        </p>
      </div>

      {/* Quick Stats */}
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
              <p className="text-sm text-muted-foreground">Pending Marks</p>
              <p className="text-3xl font-bold">{stats.pendingMarks}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <EditIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold">{stats.attendanceRate}%</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">My Classes</p>
              <p className="text-3xl font-bold">{stats.myClasses}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="grid gap-3">
            <button
              onClick={() => navigate('/marks')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <EditIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Enter Marks for Today</p>
                <p className="text-sm text-muted-foreground">Record student marks</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Take Attendance</p>
                <p className="text-sm text-muted-foreground">Record daily attendance</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/exams')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <UploadIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Upload Exam Paper</p>
                <p className="text-sm text-muted-foreground">Submit exam documents</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/lesson-plans')}
              className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted"
            >
              <BookOpenIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Upload Lesson Plan</p>
                <p className="text-sm text-muted-foreground">Submit weekly lesson plans</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notifications & Deadlines */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <BellIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-3">
              <p className="font-medium text-sm">Term 3 Marks Due</p>
              <p className="text-xs text-muted-foreground">Submit by Friday, 29th November</p>
            </div>
            <div className="rounded-lg border-l-4 border-green-600 bg-muted/50 p-3">
              <p className="font-medium text-sm">Staff Meeting</p>
              <p className="text-xs text-muted-foreground">Tomorrow at 2:00 PM</p>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="mb-3 font-semibold text-sm">Upcoming Deadlines</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-2">
                <div>
                  <p className="text-sm font-medium">Term 3 Report Cards</p>
                  <p className="text-xs text-muted-foreground">December 10, 2025</p>
                </div>
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2">
                <div>
                  <p className="text-sm font-medium">Lesson Plans Submission</p>
                  <p className="text-xs text-muted-foreground">Every Friday</p>
                </div>
                <ClockIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Classes */}
      {classes.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">My Classes</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <div
                key={classItem.$id}
                className="rounded-lg border bg-background p-4"
              >
                <h4 className="font-semibold">{classItem.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {classItem.currentStudents} students
                </p>
                <p className="text-sm text-muted-foreground">
                  {classItem.subjects?.join(', ') || 'No subjects'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

