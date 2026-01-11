import { useState, useEffect } from "react"
import { 
  EyeIcon, 
  RefreshCwIcon, 
  Loader2Icon,
  FileTextIcon,
  UsersIcon,
  UserCheckIcon,
  CalendarIcon,
  BellIcon,
  TrendingUpIcon,
  AwardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BarChart3Icon,
  GraduationCapIcon
} from "lucide-react"
import { toast } from "sonner"
import { getExams } from "@/lib/exams"
import { getApplications } from "@/lib/staffApplications"
import { getStudents } from "@/lib/students"
import { getEvents } from "@/lib/events"
import { getMarks } from "@/lib/marks"
import { getClasses } from "@/lib/classes"
import { databases, DATABASE_ID, USERS_TABLE_ID } from "@/lib/appwrite"
import { Query } from "appwrite"

interface ViewPortalsPageProps {
  portalType: 'dos' | 'bursar' | 'headteacher' | 'it'
}

export default function ViewPortalsPage({ portalType }: ViewPortalsPageProps) {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState({
    pendingExams: 0,
    totalStudents: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
    approvedExams: 0,
    rejectedExams: 0,
    totalClasses: 0,
    averagePerformance: 0,
  })
  const [academicPerformance, setAcademicPerformance] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [recentExams, setRecentExams] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dosUser, setDosUser] = useState<any>(null)

  useEffect(() => {
    loadPortalData()
  }, [portalType])

  const loadPortalData = async () => {
    try {
      setIsLoading(true)
      
      if (portalType === 'dos') {
        await loadDOSData()
      } else {
        // Placeholder for other portals
        setData([])
        setStats({ 
          pendingExams: 0, 
          totalStudents: 0, 
          pendingApplications: 0, 
          upcomingEvents: 0,
          approvedExams: 0,
          rejectedExams: 0,
          totalClasses: 0,
          averagePerformance: 0,
        })
      }
    } catch (error) {
      console.error('Error loading portal data:', error)
      toast.error('Failed to load portal data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDOSData = async () => {
    try {
      // Get DOS user
      const dosUsers = await databases.listDocuments(
        DATABASE_ID,
        USERS_TABLE_ID,
        [Query.equal('userType', 'dos')]
      )
      if (dosUsers.documents.length > 0) {
        setDosUser(dosUsers.documents[0])
      }

      // Get all exams
      const allExams = await getExams()
      const pendingExams = allExams.filter(e => e.status === 'submitted')
      const approvedExams = allExams.filter(e => e.status === 'approved')
      const rejectedExams = allExams.filter(e => e.status === 'rejected')

      // Get students
      const students = await getStudents()
      const activeStudents = students.filter(s => s.status === 'active')

      // Get applications
      const applications = await getApplications()
      const pendingApplications = applications.filter(a => a.status === 'pending')

      // Get events
      const events = await getEvents()
      const upcomingEvents = events.filter(e => 
        e.status === 'upcoming' && new Date(e.eventDate) >= new Date()
      )

      // Get classes
      const classes = await getClasses()

      // Get marks for performance calculation
      const currentYear = new Date().getFullYear().toString()
      const allMarks = await getMarks({ academicYear: currentYear })
      
      // Calculate academic performance by class
      const classPerformance: Record<string, { total: number; count: number }> = {}
      allMarks.forEach(mark => {
        if (!classPerformance[mark.className]) {
          classPerformance[mark.className] = { total: 0, count: 0 }
        }
        const percentage = (mark.marks / mark.maxMarks) * 100
        classPerformance[mark.className].total += percentage
        classPerformance[mark.className].count += 1
      })

      const performanceData = Object.entries(classPerformance).map(([className, data]) => ({
        className,
        average: data.count > 0 ? Math.round(data.total / data.count) : 0,
        totalMarks: data.count,
      })).sort((a, b) => b.average - a.average)

      setAcademicPerformance(performanceData)

      // Calculate top performers
      const studentPerformance: Record<string, { total: number; count: number; name: string }> = {}
      allMarks.forEach(mark => {
        if (!studentPerformance[mark.studentId]) {
          studentPerformance[mark.studentId] = { 
            total: 0, 
            count: 0, 
            name: mark.studentName 
          }
        }
        const percentage = (mark.marks / mark.maxMarks) * 100
        studentPerformance[mark.studentId].total += percentage
        studentPerformance[mark.studentId].count += 1
      })

      const topPerformersData = Object.values(studentPerformance)
        .map(data => ({
          name: data.name,
          average: data.count > 0 ? Math.round(data.total / data.count) : 0,
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 5)

      setTopPerformers(topPerformersData)

      // Calculate overall average performance
      const overallAverage = performanceData.length > 0
        ? Math.round(performanceData.reduce((sum, p) => sum + p.average, 0) / performanceData.length)
        : 0

      // Get recent exams
      const recentExamsData = allExams
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
        .slice(0, 5)

      setRecentExams(recentExamsData)

      // Build recent activities
      const activities: any[] = []
      
      if (pendingExams.length > 0) {
        activities.push({
          icon: FileTextIcon,
          text: `${pendingExams[0].createdByName} submitted "${pendingExams[0].title}"`,
          time: new Date(pendingExams[0].$createdAt).toLocaleDateString(),
          color: 'text-blue-600',
          type: 'exam',
        })
      }
      
      if (pendingApplications.length > 0) {
        activities.push({
          icon: UserCheckIcon,
          text: `New application from ${pendingApplications[0].applicantName}`,
          time: new Date(pendingApplications[0].$createdAt).toLocaleDateString(),
          color: 'text-yellow-600',
          type: 'application',
        })
      }

      if (upcomingEvents.length > 0) {
        activities.push({
          icon: CalendarIcon,
          text: `Upcoming event: ${upcomingEvents[0].title}`,
          time: new Date(upcomingEvents[0].eventDate).toLocaleDateString(),
          color: 'text-purple-600',
          type: 'event',
        })
      }

      setRecentActivities(activities)

      // Set stats
      setStats({
        pendingExams: pendingExams.length,
        totalStudents: activeStudents.length,
        pendingApplications: pendingApplications.length,
        upcomingEvents: upcomingEvents.length,
        approvedExams: approvedExams.length,
        rejectedExams: rejectedExams.length,
        totalClasses: classes.length,
        averagePerformance: overallAverage,
      })

      setData(pendingExams)
    } catch (error) {
      console.error('Error loading DOS data:', error)
      throw error
    }
  }

  const getPortalInfo = () => {
    const portals: Record<string, { title: string; currentUser: string; description: string }> = {
      dos: {
        title: 'Director of Studies Portal (View Only)',
        currentUser: dosUser?.fullName || 'Dr. Michael Kato',
        description: 'You are viewing the DOS portal in read-only mode. You cannot make any changes to the data.',
      },
      bursar: {
        title: 'Bursar Portal (View Only)',
        currentUser: 'Mr. John Okello',
        description: 'You are viewing the Bursar portal in read-only mode. You cannot make any changes to the data.',
      },
      headteacher: {
        title: 'Head Teacher Portal (View Only)',
        currentUser: 'Mrs. Sarah Johnson',
        description: 'You are viewing the Head Teacher portal in read-only mode. You cannot make any changes to the data.',
      },
      it: {
        title: 'IT Administrator Portal (View Only)',
        currentUser: 'Mr. David Tech',
        description: 'You are viewing the IT Administrator portal in read-only mode. You cannot make any changes to the data.',
      },
    }
    return portals[portalType] || portals.dos
  }

  const portalInfo = getPortalInfo()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (portalType !== 'dos') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{portalInfo.title}</h2>
            <p className="text-muted-foreground">{portalInfo.description}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Portal view coming soon</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{portalInfo.title}</h2>
          <p className="text-muted-foreground">{portalInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            <EyeIcon className="mr-1 inline h-4 w-4" />
            View Only Access
          </span>
          <button
            onClick={loadPortalData}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted p-4">
        <h4 className="mb-1 font-semibold text-primary">
          Current DOS: {portalInfo.currentUser}
        </h4>
        <p className="text-sm text-muted-foreground">{portalInfo.description}</p>
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

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved Exams</p>
          <p className="text-2xl font-bold text-green-600">{stats.approvedExams}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rejected Exams</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejectedExams}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Classes</p>
          <p className="text-2xl font-bold">{stats.totalClasses}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Performance</p>
          <p className="text-2xl font-bold text-blue-600">{stats.averagePerformance}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Performance by Class */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-blue-600" />
              Academic Performance by Class
            </h3>
          </div>
          <div className="space-y-3">
            {academicPerformance.length > 0 ? (
              academicPerformance.map((perf, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <GraduationCapIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{perf.className}</p>
                      <p className="text-xs text-muted-foreground">{perf.totalMarks} assessments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{perf.average}%</p>
                    <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${perf.average}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No performance data available</p>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-yellow-600" />
              Top Performers
            </h3>
          </div>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {index === 0 ? (
                        <AwardIcon className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <span className="font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">Student</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{student.average}%</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No performance data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Exams Table */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Recent Exam Submissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Exam Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Submitted Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentExams.length > 0 ? (
                recentExams.map((exam: any) => (
                  <tr key={exam.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{exam.title}</td>
                    <td className="px-4 py-3">{exam.className}</td>
                    <td className="px-4 py-3">{exam.subject}</td>
                    <td className="px-4 py-3">{exam.createdByName}</td>
                    <td className="px-4 py-3">
                      {new Date(exam.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        exam.status === 'approved' ? 'bg-green-100 text-green-800' :
                        exam.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        exam.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.status === 'approved' && <CheckCircleIcon className="h-3 w-3" />}
                        {exam.status === 'rejected' && <XCircleIcon className="h-3 w-3" />}
                        {exam.status === 'submitted' && <ClockIcon className="h-3 w-3" />}
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No exams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  )
}
