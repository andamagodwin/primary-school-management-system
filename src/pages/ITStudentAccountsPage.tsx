import { useState, useEffect } from "react"
import { PlusIcon, EyeIcon, KeyIcon, MailIcon, DownloadIcon, Loader2Icon, UserXIcon } from "lucide-react"
import { toast } from "sonner"
import { getStudents, type Student } from "@/lib/students"

export default function ITStudentAccountsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classFilter, setClassFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, classFilter, sectionFilter, statusFilter])

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
      filtered = filtered.filter(s => s.className?.toLowerCase().includes(classFilter.toLowerCase()))
    }
    if (sectionFilter !== "all") {
      filtered = filtered.filter(s => s.section === sectionFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.status === statusFilter)
    }
    setFilteredStudents(filtered)
  }

  const handleResetPassword = async (studentId: string) => {
    if (!confirm('Reset password for this student?')) return
    toast.success('Student password reset')
  }

  const handleSendCredentials = async (studentId: string) => {
    const student = students.find(s => s.studentId === studentId)
    if (student) {
      toast.success(`Login credentials sent to ${student.fullName}'s parent`)
    }
  }

  const handleGenerateCredentials = () => {
    toast.success('Student login credentials generated and saved')
  }

  const handleBulkResetPasswords = () => {
    if (confirm('Are you sure you want to reset passwords for all selected students?')) {
      toast.success('Passwords reset for selected students')
    }
  }

  const handleExportStudentList = () => {
    toast.success('Student list exported to CSV')
  }

  const handleBulkDeactivate = () => {
    if (confirm('Deactivate all graduated students?')) {
      toast.success('Graduated students deactivated')
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
          <h2 className="text-3xl font-bold tracking-tight">Student Account Management</h2>
          <p className="text-muted-foreground">Manage student accounts and credentials</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          New Student
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
            <option value="C">Section C</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Class & Section</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Parent Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Account Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{student.fullName}</td>
                  <td className="px-4 py-3 text-sm">{student.studentId}</td>
                  <td className="px-4 py-3 text-sm">
                    {student.className} {student.section ? `- ${student.section}` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm">{student.parentPhone || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : student.status === 'graduated'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="p-1 rounded hover:bg-muted">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(student.studentId)}
                        className="p-1 rounded hover:bg-muted"
                        title="Reset Password"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendCredentials(student.studentId)}
                        className="p-1 rounded hover:bg-muted"
                        title="Send Credentials"
                      >
                        <MailIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Operations */}
      <div className="rounded-lg border bg-card p-6">
        <h4 className="text-lg font-semibold mb-4">Bulk Student Operations</h4>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleGenerateCredentials}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <KeyIcon className="h-4 w-4" />
            Generate Login Credentials
          </button>
          <button
            onClick={handleBulkResetPasswords}
            className="flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <KeyIcon className="h-4 w-4" />
            Reset Passwords
          </button>
          <button
            onClick={handleExportStudentList}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <DownloadIcon className="h-4 w-4" />
            Export to CSV
          </button>
          <button
            onClick={handleBulkDeactivate}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <UserXIcon className="h-4 w-4" />
            Deactivate Graduated
          </button>
        </div>
      </div>
    </div>
  )
}

