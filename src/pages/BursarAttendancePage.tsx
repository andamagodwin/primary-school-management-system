import { useState, useEffect } from "react"
import { UserCheckIcon, UsersIcon, CalendarIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getAttendance } from "@/lib/attendance"
import { getClasses } from "@/lib/classes"

export default function BursarAttendancePage() {
  const [attendanceType, setAttendanceType] = useState<"staff" | "students">("staff")
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadClasses()
    loadAttendanceData()
  }, [attendanceType, attendanceDate])

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
      if (attendanceType === "students") {
        const attendance = await getAttendance({ date: attendanceDate })
        setAttendanceData(attendance)
      } else {
        // For staff, you would need a separate staff attendance API
        setAttendanceData([])
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      toast.error('Failed to load attendance data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Monitoring</h2>
          <p className="text-muted-foreground">Monitor staff and student attendance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAttendanceType("staff")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              attendanceType === "staff" 
                ? "bg-primary text-primary-foreground" 
                : "border hover:bg-muted"
            }`}
          >
            <UserCheckIcon className="h-4 w-4" />
            Staff Attendance
          </button>
          <button
            onClick={() => setAttendanceType("students")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              attendanceType === "students" 
                ? "bg-primary text-primary-foreground" 
                : "border hover:bg-muted"
            }`}
          >
            <UsersIcon className="h-4 w-4" />
            Student Attendance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={loadAttendanceData}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <CalendarIcon className="h-4 w-4" />
            Load Data
          </button>
        </div>
      </div>

      {/* Attendance Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              {attendanceType === "staff" ? "Staff Attendance" : "Student Attendance"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                {attendanceType === "staff" ? (
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Staff Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Position</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Hours Worked</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total Students</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Present</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Absent</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Attendance Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No attendance data available for this date
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {attendanceType === "staff" ? (
                        <>
                          <td className="px-4 py-3 text-sm">{item.staffName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.position || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.checkIn || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.checkOut || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.hoursWorked || '0 hours'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status || 'Unknown'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm">{item.className || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{item.totalStudents || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.present || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.absent || 0}</td>
                          <td className="px-4 py-3 text-sm">{item.attendanceRate || 0}%</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs hover:bg-yellow-200">
                              Notify Parents
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

