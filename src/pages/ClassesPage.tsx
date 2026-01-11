import { useState, useEffect } from "react"
import { BookOpenIcon, PlusIcon, Loader2Icon, PencilIcon, UsersIcon, Presentation, UserPlusIcon, XIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getClasses, assignTeacherToClass, createPrimarySchoolClasses, type Class } from "@/lib/classes"
import { getTeachers } from "@/lib/teachers"
import { useAuthStore } from "@/store/authStore"
import type { Teacher } from "@/lib/teachers"

// Helper function to format term display
const formatTerm = (term: string) => {
  return term.replace(/(\d)/, ' $1') // Add space before number (Term1 -> Term 1)
}

export default function ClassesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isDOS = user?.userType === 'dos'
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isCreatingClasses, setIsCreatingClasses] = useState(false)

  useEffect(() => {
    fetchClasses()
    if (isDOS) {
      fetchTeachers()
    }
  }, [isDOS])

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await getClasses()
      setClasses(data)
    } catch (err) {
      console.error("Error fetching classes:", err)
      setError("Failed to load classes")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers()
      setTeachers(data.filter(t => t.status === 'active'))
    } catch (err) {
      console.error("Error fetching teachers:", err)
    }
  }

  const handleAssignTeacher = (classItem: Class) => {
    setSelectedClass(classItem)
    setSelectedTeacherId(classItem.classTeacherId || "")
    setShowAssignModal(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedClass || !selectedTeacherId) {
      toast.error('Please select a teacher')
      return
    }

    try {
      setIsAssigning(true)
      const selectedTeacher = teachers.find(t => t.$id === selectedTeacherId)
      if (!selectedTeacher) {
        toast.error('Teacher not found')
        return
      }

      await assignTeacherToClass(
        selectedClass.$id,
        selectedTeacher.$id,
        `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
      )

      toast.success('Teacher assigned successfully!')
      setShowAssignModal(false)
      await fetchClasses()
    } catch (error) {
      console.error('Error assigning teacher:', error)
      toast.error('Failed to assign teacher')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleCreatePrimaryClasses = async () => {
    if (!confirm('This will create classes for P1-P7 with standard primary school subjects. Continue?')) {
      return
    }

    try {
      setIsCreatingClasses(true)
      const currentYear = new Date().getFullYear().toString()
      await createPrimarySchoolClasses(currentYear, 'Term1')
      toast.success('Primary school classes created successfully!')
      await fetchClasses()
    } catch (error) {
      console.error('Error creating classes:', error)
      toast.error('Failed to create classes')
    } finally {
      setIsCreatingClasses(false)
    }
  }

  const filteredClasses = classes.filter((cls) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      cls.name.toLowerCase().includes(searchLower) ||
      cls.classTeacherName?.toLowerCase().includes(searchLower) ||
      cls.roomNumber?.toLowerCase().includes(searchLower)
    )
    const matchesGrade = !filterGrade || cls.grade === filterGrade
    return matchesSearch && matchesGrade
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground">
            Manage class sections and assignments
          </p>
        </div>
        <div className="flex gap-2">
          {isDOS && classes.length === 0 && (
            <button
              onClick={handleCreatePrimaryClasses}
              disabled={isCreatingClasses}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isCreatingClasses ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Create Primary Classes
            </button>
          )}
          <button
            onClick={() => navigate("/classes/add")}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
        />
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="rounded-md border bg-background px-4 py-2 text-sm sm:w-48"
        >
          <option value="">All Grades</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
          <option value="P4">P4</option>
          <option value="P5">P5</option>
          <option value="P6">P6</option>
          <option value="P7">P7</option>
        </select>
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
            <p className="text-sm text-muted-foreground">Loading classes...</p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No classes found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterGrade
                  ? "Try adjusting your filters"
                  : "Get started by creating your first class"}
              </p>
            </div>
            {!searchQuery && !filterGrade && (
              <button
                onClick={() => navigate("/classes/add")}
                className="mt-2 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="h-4 w-4" />
                Add Class
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <div key={cls.$id} className="rounded-lg border bg-card transition-shadow hover:shadow-md">
              <div className="border-b p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                      <Presentation className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cls.roomNumber ? `Room ${cls.roomNumber}` : 'No room assigned'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                    {cls.currentStudents}/{cls.capacity}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Class Teacher</span>
                    <span className="font-medium">
                      {cls.classTeacherName || 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Academic Year</span>
                    <span className="font-medium">{cls.academicYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Term</span>
                    <span className="font-medium">{formatTerm(cls.term)}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {cls.subjects.length} subject{cls.subjects.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {isDOS && (
                      <button
                        onClick={() => handleAssignTeacher(cls)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        <UserPlusIcon className="h-3 w-3" />
                        Assign Teacher
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/classes/add?id=${cls.$id}`)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                    >
                      <PencilIcon className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Assign Teacher to {selectedClass.name}</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.$id} value={teacher.$id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.employeeNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssign}
                  disabled={isAssigning || !selectedTeacherId}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isAssigning ? (
                    <>
                      <Loader2Icon className="mr-2 inline h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Teacher'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
