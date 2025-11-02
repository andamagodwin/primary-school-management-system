import { useState, useEffect } from "react"
import { PlusIcon, SearchIcon, PhoneIcon, Loader2Icon, UserIcon, PencilIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getStudents, type Student } from "@/lib/students"

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await getStudents()
      setStudents(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load students"
      setError(errorMessage)
      console.error("Error fetching students:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.admissionNumber.toLowerCase().includes(searchLower) ||
      student.grade.toLowerCase().includes(searchLower) ||
      student.parentName.toLowerCase().includes(searchLower)
    )
  })

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
        <button 
          onClick={() => navigate("/students/add")}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading students...</p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <UserIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No students found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by adding your first student"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate("/students/add")}
                className="mt-2 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="h-4 w-4" />
                Add Student
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Photo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Admission No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Age</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Parent/Guardian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.$id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{student.admissionNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">{student.grade}</td>
                    <td className="px-4 py-3 text-sm">
                      {student.className ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {student.className}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{calculateAge(student.dateOfBirth)}</td>
                    <td className="px-4 py-3 text-sm">{student.parentName}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                        {student.parentPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/students/add?id=${student.$id}`)}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <PencilIcon className="h-3 w-3" />
                          Edit
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
    </div>
  )
}
