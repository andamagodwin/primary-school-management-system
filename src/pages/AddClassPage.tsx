import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeftIcon, CheckCircleIcon, Loader2Icon, XIcon } from "lucide-react"
import { createClass, getClasses, updateClass, type Class } from "@/lib/classes"
import { getTeachers, type Teacher } from "@/lib/teachers"

export default function AddClassPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classId = searchParams.get("id")
  const isEditMode = !!classId

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    classTeacherId: "",
    roomNumber: "",
    capacity: "",
    academicYear: new Date().getFullYear().toString(),
    term: "",
    notes: "",
  })

  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState("")

  // Load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers()
        setTeachers(data.filter(t => t.status === 'active'))
      } catch (err) {
        console.error("Error fetching teachers:", err)
      }
    }
    fetchTeachers()
  }, [])

  // Load class data when in edit mode
  useEffect(() => {
    const loadClassData = async () => {
      if (!classId) return

      setIsLoading(true)
      try {
        const classes = await getClasses()
        const classData = classes.find((c: Class) => c.$id === classId)
        
        if (classData) {
          setFormData({
            name: classData.name,
            grade: classData.grade,
            section: classData.section,
            classTeacherId: classData.classTeacherId || "",
            roomNumber: classData.roomNumber || "",
            capacity: classData.capacity.toString(),
            academicYear: classData.academicYear,
            term: classData.term,
            notes: classData.notes || "",
          })
          
          setSubjects(classData.subjects || [])
        }
      } catch (err) {
        console.error("Error loading class:", err)
        setError("Failed to load class data")
      } finally {
        setIsLoading(false)
      }
    }

    loadClassData()
  }, [classId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()])
      setSubjectInput("")
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Find selected teacher to get their name
      const selectedTeacher = teachers.find(t => t.$id === formData.classTeacherId)
      
      const classData = {
        name: formData.name,
        grade: formData.grade as 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7',
        section: formData.section,
        classTeacherId: formData.classTeacherId || undefined,
        classTeacherName: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : undefined,
        roomNumber: formData.roomNumber || undefined,
        capacity: parseInt(formData.capacity),
        subjects,
        academicYear: formData.academicYear,
        term: formData.term as 'Term1' | 'Term2' | 'Term3',
        notes: formData.notes || undefined,
      }

      if (isEditMode && classId) {
        // Update existing class
        await updateClass(classId, classData)
      } else {
        // Create new class
        await createClass(classData)
      }

      setIsSubmitting(false)
      setShowSuccess(true)

      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        navigate("/classes")
      }, 2000)
    } catch (err) {
      setIsSubmitting(false)
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} class`
      setError(errorMessage)
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} class:`, err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading class data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/classes")}
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Class' : 'Add New Class'}
          </h2>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update the class information below' : 'Fill in the class information below'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircleIcon className="h-5 w-5" />
          <p className="font-medium">
            Class {isEditMode ? 'updated' : 'created'} successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Primary 1A"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="grade" className="mb-2 block text-sm font-medium">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select grade</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                  <option value="P5">P5</option>
                  <option value="P6">P6</option>
                  <option value="P7">P7</option>
                </select>
              </div>

              <div>
                <label htmlFor="section" className="mb-2 block text-sm font-medium">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  id="section"
                  name="section"
                  type="text"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  placeholder="e.g., A, B, C"
                  maxLength={1}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase"
                />
              </div>

              <div>
                <label htmlFor="roomNumber" className="mb-2 block text-sm font-medium">
                  Room Number
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g., 101"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="mb-2 block text-sm font-medium">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Maximum students"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="classTeacherId" className="mb-2 block text-sm font-medium">
                  Class Teacher
                </label>
                <select
                  id="classTeacherId"
                  name="classTeacherId"
                  value={formData.classTeacherId}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select teacher (optional)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.$id} value={teacher.$id}>
                      {teacher.firstName} {teacher.lastName} - {teacher.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Academic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="academicYear" className="mb-2 block text-sm font-medium">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  id="academicYear"
                  name="academicYear"
                  type="text"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2025"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="term" className="mb-2 block text-sm font-medium">
                  Term <span className="text-red-500">*</span>
                </label>
                <select
                  id="term"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select term</option>
                  <option value="Term1">Term 1</option>
                  <option value="Term2">Term 2</option>
                  <option value="Term3">Term 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Subjects <span className="text-red-500">*</span></h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                  placeholder="Enter subject name (e.g., Mathematics)"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm"
                    >
                      <span>{subject}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Any additional information about this class..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting || subjects.length === 0}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEditMode ? "Updating Class..." : "Creating Class...") 
                : (isEditMode ? "Update Class" : "Create Class")
              }
            </button>
            <button
              type="button"
              onClick={() => navigate("/classes")}
              className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
