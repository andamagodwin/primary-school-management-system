import { useState, useEffect } from "react"
import { PlusIcon, UserIcon, Loader2Icon, PencilIcon, BookOpenIcon, UsersIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getTeachers, type Teacher } from "@/lib/teachers"

export default function TeachersPage() {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await getTeachers()
      setTeachers(data)
    } catch (err) {
      console.error("Error fetching teachers:", err)
      setError("Failed to load teachers")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      teacher.employeeNumber.toLowerCase().includes(searchLower) ||
      teacher.specialization.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage teaching staff and assignments
          </p>
        </div>
        <button
          onClick={() => navigate("/teachers/add")}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search teachers by name, email, or employee number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
        />
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
            <p className="text-sm text-muted-foreground">Loading teachers...</p>
          </div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <UserIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No teachers found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by adding your first teacher"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => navigate("/teachers/add")}
                className="mt-2 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="h-4 w-4" />
                Add Teacher
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.$id} className="rounded-lg border bg-card transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 border-b p-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                  {teacher.avatar ? (
                    <img
                      src={teacher.avatar}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{teacher.specialization}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Employee #:</span> {teacher.employeeNumber}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Email:</span> {teacher.email}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Type:</span> {teacher.employmentType}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                      <p className="text-sm font-semibold">{teacher.subjects.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Classes</p>
                      <p className="text-sm font-semibold">{teacher.classes.length}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <button
                    onClick={() => navigate(`/teachers/add?id=${teacher.$id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    <PencilIcon className="h-3 w-3" />
                    Edit Teacher
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
