import { useState, useEffect } from "react"
import { SaveIcon, SendIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getClassesByTeacher } from "@/lib/classes"
import { getStudents } from "@/lib/students"
import { createAttendanceRecords, getAttendance, type CreateAttendanceData } from "@/lib/attendance"
import { useAuthStore } from "@/store/authStore"
import type { Class } from "@/lib/classes"
import type { Student } from "@/lib/students"

export default function TeacherAttendancePage() {
  const user = useAuthStore((state) => state.user)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'late'; timeIn: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass && attendanceDate) {
      loadStudents()
      loadExistingAttendance()
    }
  }, [selectedClass, attendanceDate])

  const loadClasses = async () => {
    try {
      if (user?.userId) {
        const teacherClasses = await getClassesByTeacher(user.userId)
        setClasses(teacherClasses)
        if (teacherClasses.length > 0) {
          setSelectedClass(teacherClasses[0].$id)
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const allStudents = await getStudents()
      const classStudents = allStudents.filter(s => s.classId === selectedClass)
      setStudents(classStudents)
      
      // Initialize attendance
      const initialAttendance: Record<string, { status: 'present' | 'absent' | 'late'; timeIn: string }> = {}
      classStudents.forEach(student => {
        initialAttendance[student.$id] = { status: 'present', timeIn: '07:30' }
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadExistingAttendance = async () => {
    try {
      const existing = await getAttendance({
        classId: selectedClass,
        date: attendanceDate,
      })
      
      if (existing.length > 0) {
        const attendanceMap: Record<string, { status: 'present' | 'absent' | 'late'; timeIn: string }> = {}
        existing.forEach(record => {
          attendanceMap[record.studentId] = {
            status: record.status,
            timeIn: record.timeIn || '07:30',
          }
        })
        setAttendance(attendanceMap)
      }
    } catch (error) {
      console.error('Error loading existing attendance:', error)
    }
  }

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }))
  }

  const handleTimeInChange = (studentId: string, timeIn: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], timeIn }
    }))
  }

  const markAllPresent = () => {
    const updated: Record<string, { status: 'present' | 'absent' | 'late'; timeIn: string }> = {}
    students.forEach(student => {
      updated[student.$id] = { status: 'present', timeIn: '07:30' }
    })
    setAttendance(updated)
  }

  const markAllAbsent = () => {
    const updated: Record<string, { status: 'present' | 'absent' | 'late'; timeIn: string }> = {}
    students.forEach(student => {
      updated[student.$id] = { status: 'absent', timeIn: '' }
    })
    setAttendance(updated)
  }

  const handleSave = async () => {
    if (!selectedClass) {
      toast.error('Please select a class')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) return

      const records: CreateAttendanceData[] = students.map(student => ({
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: selectedClass,
        className: selectedClassData.name,
        date: attendanceDate,
        status: attendance[student.$id]?.status || 'present',
        timeIn: attendance[student.$id]?.timeIn || '07:30',
      }))

      await createAttendanceRecords(records)
      toast.success('Attendance saved successfully!')
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('Failed to save attendance')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    await handleSave()
    toast.success('Attendance submitted to system!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Record Daily Attendance</h2>
        <p className="text-muted-foreground">Mark student attendance for your classes</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class & Section</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.$id} value={classItem.$id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={markAllPresent}
            className="rounded-md border bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            <CheckCircle2Icon className="mr-2 inline h-4 w-4" />
            Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="rounded-md border bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <XCircleIcon className="mr-2 inline h-4 w-4" />
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {students.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Attendance Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Time In</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentAttendance = attendance[student.$id] || { status: 'present' as const, timeIn: '07:30' }
                  return (
                    <tr key={student.$id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="px-4 py-3">{student.admissionNumber}</td>
                      <td className="px-4 py-3">
                        <select
                          value={studentAttendance.status}
                          onChange={(e) => handleStatusChange(student.$id, e.target.value as 'present' | 'absent' | 'late')}
                          className={`w-32 rounded-md border bg-background px-2 py-1 text-sm ${getStatusColor(studentAttendance.status)}`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          value={studentAttendance.timeIn}
                          onChange={(e) => handleTimeInChange(student.$id, e.target.value)}
                          disabled={studentAttendance.status === 'absent'}
                          className="w-32 rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 border-t p-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              Save Attendance
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
              Submit to System
            </button>
          </div>
        </div>
      )}

      {students.length === 0 && selectedClass && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No students found in this class</p>
        </div>
      )}
    </div>
  )
}

