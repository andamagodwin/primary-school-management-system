import { useState, useEffect } from "react"
import { SearchIcon, DownloadIcon, MailIcon, PhoneIcon, UserIcon, PrinterIcon } from "lucide-react"
import { getClassesByTeacher } from "@/lib/classes"
import { getStudents, type Student } from "@/lib/students"
import { getMarks } from "@/lib/marks"
import { getAttendancePercentage } from "@/lib/attendance"
import { useAuthStore } from "@/store/authStore"
import type { Class } from "@/lib/classes"

export default function MyStudentsPage() {
  const user = useAuthStore((state) => state.user)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [studentStats, setStudentStats] = useState<Record<string, { average: number; attendance: number }>>({})
  const [selectedTerm, setSelectedTerm] = useState("Term3")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass !== "all") {
      loadStudents()
    } else if (classes.length > 0) {
      loadAllStudents()
    }
  }, [selectedClass, classes])

  useEffect(() => {
    filterStudents()
  }, [searchQuery, students])

  useEffect(() => {
    if (students.length > 0) {
      loadStudentStats()
    }
  }, [students, selectedTerm, selectedYear])

  const loadClasses = async () => {
    try {
      if (user?.userId) {
        const teacherClasses = await getClassesByTeacher(user.userId)
        setClasses(teacherClasses)
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
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadAllStudents = async () => {
    try {
      const allStudents = await getStudents()
      const myStudents = allStudents.filter(s => 
        classes.some(c => c.$id === s.classId)
      )
      setStudents(myStudents)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadStudentStats = async () => {
    try {
      const stats: Record<string, { average: number; attendance: number }> = {}
      
      for (const student of students) {
        // Get marks for this student
        const marks = await getMarks({
          studentId: student.studentId,
          term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
          academicYear: selectedYear,
        })
        
        if (marks.length > 0) {
          const totalMarks = marks.reduce((sum, m) => sum + m.marks, 0)
          const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0)
          const average = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0
          stats[student.$id] = { ...stats[student.$id], average: Math.round(average) }
        } else {
          stats[student.$id] = { ...stats[student.$id], average: 0 }
        }

        // Get attendance percentage
        const attendance = await getAttendancePercentage(
          student.studentId,
          `${selectedYear}-01-01`,
          `${selectedYear}-12-31`
        )
        stats[student.$id] = { ...stats[student.$id], attendance: Math.round(attendance) }
      }
      
      setStudentStats(stats)
    } catch (error) {
      console.error('Error loading student stats:', error)
    }
  }

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = students.filter(student =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.admissionNumber.toLowerCase().includes(query) ||
      student.parentName.toLowerCase().includes(query)
    )
    setFilteredStudents(filtered)
  }

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting student list...')
  }

  const handlePrintReport = (student: Student) => {
    // Print functionality would go here
    console.log('Printing report for:', student)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Students</h2>
          <p className="text-muted-foreground">View and manage your students</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <DownloadIcon className="h-4 w-4" />
            Export List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or parent..."
            className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Students</option>
            {classes.map((classItem) => (
              <option key={classItem.$id} value={classItem.$id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[120px]">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Term1">Term 1</option>
            <option value="Term2">Term 2</option>
            <option value="Term3">Term 3</option>
          </select>
        </div>

        <div className="flex-1 min-w-[100px]">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Parent Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Term Average</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Attendance %</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const stats = studentStats[student.$id] || { average: 0, attendance: 0 }
                return (
                  <tr key={student.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.firstName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {student.firstName.charAt(0)}
                            </span>
                          )}
                        </div>
                        {`${student.firstName} ${student.lastName}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">{student.admissionNumber}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{student.parentPhone}</span>
                        </div>
                        {student.parentEmail && (
                          <div className="flex items-center gap-2 text-sm">
                            <MailIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{student.parentEmail}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{stats.average}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{ width: `${stats.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm">{stats.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrintReport(student)}
                          className="rounded-md border p-2 hover:bg-muted"
                          title="Print Report"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md border p-2 hover:bg-muted"
                          title="View Details"
                        >
                          <UserIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md border p-2 hover:bg-muted"
                          title="Message Parent"
                        >
                          <MailIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}
    </div>
  )
}

