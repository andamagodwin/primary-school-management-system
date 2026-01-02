import { useState, useEffect } from "react"
import { BarChart3Icon, MailIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getAttendance } from "@/lib/attendance"
import { getClasses } from "@/lib/classes"
import { getStudents } from "@/lib/students"

export default function AttendanceOverviewPage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [summary, setSummary] = useState({
    overallRate: 0,
    lowAttendance: 0,
    chronicAbsentees: 0,
  })
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    loadAttendanceData()
  }, [selectedClass, selectedMonth])

  const loadClasses = async () => {
    try {
      const classList = await getClasses()
      setClasses(classList)
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true)
      const [startDate, endDate] = getMonthDateRange(selectedMonth)

      const allClasses = selectedClass === "all" 
        ? await getClasses()
        : [await getClasses().then(c => c.find(cl => cl.$id === selectedClass))].filter(Boolean)

      const data = await Promise.all(
        allClasses.map(async (classItem) => {
          const students = await getStudents()
          const classStudents = students.filter(s => s.classId === classItem.$id)
          
          const attendance = await getAttendance({
            classId: classItem.$id,
            startDate,
            endDate,
          })

          const presentCount = attendance.filter(a => a.status === 'present').length
          const totalRecords = attendance.length
          const rate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
          const absences = totalRecords - presentCount

          return {
            classId: classItem.$id,
            className: classItem.name,
            teacher: classItem.classTeacherName || 'N/A',
            totalStudents: classStudents.length,
            attendanceRate: rate,
            absences,
          }
        })
      )

      setAttendanceData(data)

      // Calculate summary
      if (data.length > 0) {
        const overallRate = Math.round(
          data.reduce((sum, d) => sum + d.attendanceRate, 0) / data.length
        )
        const lowAttendance = data.filter(d => d.attendanceRate < 80).length
        const chronicAbsentees = data.reduce((sum, d) => sum + (d.absences > 10 ? 1 : 0), 0)

        setSummary({ overallRate, lowAttendance, chronicAbsentees })
      }
    } catch (error) {
      console.error('Error loading attendance data:', error)
      toast.error('Failed to load attendance data')
    } finally {
      setIsLoading(false)
    }
  }

  const getMonthDateRange = (month: string): [string, string] => {
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1).toISOString()
    const endDate = new Date(year, monthNum, 0).toISOString()
    return [startDate, endDate]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">School Attendance Overview</h2>
        <p className="text-muted-foreground">Monitor attendance across all classes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem.$id} value={classItem.$id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={loadAttendanceData}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <BarChart3Icon className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{summary.overallRate}%</div>
          <div className="mt-2 text-sm text-muted-foreground">Overall Attendance Rate</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{summary.lowAttendance}</div>
          <div className="mt-2 text-sm text-muted-foreground">Classes with &lt; 80% Attendance</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{summary.chronicAbsentees}</div>
          <div className="mt-2 text-sm text-muted-foreground">Chronic Absentees</div>
        </div>
      </div>

      {/* Attendance Table */}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total Students</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Attendance Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Absences This Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((data) => (
                  <tr key={data.classId} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{data.className}</td>
                    <td className="px-4 py-3">{data.teacher}</td>
                    <td className="px-4 py-3">{data.totalStudents}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              data.attendanceRate >= 90
                                ? 'bg-green-600'
                                : data.attendanceRate >= 80
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${data.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{data.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{data.absences}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <BarChart3Icon className="mr-1 inline h-4 w-4" />
                          Details
                        </button>
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <MailIcon className="mr-1 inline h-4 w-4" />
                          Notify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {attendanceData.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No attendance data found</p>
        </div>
      )}
    </div>
  )
}

