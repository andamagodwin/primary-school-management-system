import { useState, useEffect } from "react"
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, BellIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getStudents, type Student } from "@/lib/students"
import { getFeePayments } from "@/lib/payments"
import { getAttendance } from "@/lib/attendance"

export default function BursarStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [classFilter, setClassFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, classFilter, sectionFilter])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const studentsData = await getStudents()
      setStudents(studentsData)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = [...students]
    if (classFilter !== "all") {
      filtered = filtered.filter(s => s.className?.toLowerCase() === classFilter.toLowerCase())
    }
    if (sectionFilter !== "all") {
      filtered = filtered.filter(s => s.section === sectionFilter)
    }
    setFilteredStudents(filtered)
  }

  const getStudentFees = async (studentId: string) => {
    try {
      const payments = await getFeePayments({ studentId })
      if (payments.length > 0) {
        const latest = payments[0]
        return {
          due: latest.amountDue,
          paid: latest.amountPaid,
          balance: latest.balance
        }
      }
      return { due: 0, paid: 0, balance: 0 }
    } catch {
      return { due: 0, paid: 0, balance: 0 }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboards</h2>
          <p className="text-muted-foreground">View and manage student information</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Classes</option>
            <option value="p1">Primary One</option>
            <option value="p2">Primary Two</option>
            <option value="p3">Primary Three</option>
            <option value="p4">Primary Four</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Section</label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <div key={student.$id} className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {student.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{student.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {student.studentId} | {student.className} | {student.section}
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fees Status:</span>
                <span className="font-medium">Check details</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendance:</span>
                <span className="font-medium">View details</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Performance:</span>
                <span className="font-medium">View details</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                <EyeIcon className="h-4 w-4 inline mr-1" />
                View
              </button>
              <button className="px-3 py-2 rounded-md bg-yellow-100 text-yellow-800 text-sm hover:bg-yellow-200">
                <BellIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

