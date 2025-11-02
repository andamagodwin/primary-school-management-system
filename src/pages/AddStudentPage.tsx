import { useState, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeftIcon, CameraIcon, Loader2Icon, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { createStudent, getStudents, updateStudent, type Student } from "@/lib/students"
import { getClasses, type Class } from "@/lib/classes"
import { uploadFile } from "@/lib/storage"
import type { UploadProgress } from "appwrite"

export default function AddStudentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get("id")
  const isEditMode = !!studentId

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [classes, setClasses] = useState<Class[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    grade: "",
    classId: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    medicalInfo: "",
  })

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses()
        setClasses(data.filter(c => c.status === 'active'))
      } catch (err) {
        console.error("Error fetching classes:", err)
      }
    }
    fetchClasses()
  }, [])

  // Load student data when in edit mode
  useEffect(() => {
    const loadStudentData = async () => {
      if (!studentId) return

      setIsLoading(true)
      try {
        const students = await getStudents()
        const student = students.find((s: Student) => s.$id === studentId)
        
        if (student) {
          setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            grade: student.grade,
            classId: student.classId || "",
            parentName: student.parentName,
            parentEmail: student.parentEmail || "",
            parentPhone: student.parentPhone,
            address: student.address || "",
            medicalInfo: student.medicalInfo || "",
          })
          
          if (student.avatar) {
            setPreviewUrl(student.avatar)
            setAvatarUrl(student.avatar)
          }
        }
      } catch (error) {
        console.error("Error loading student:", error)
        setUploadError("Failed to load student data")
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentData()
  }, [studentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Appwrite Storage
      const { url } = await uploadFile(file, (progress: UploadProgress) => {
        // Calculate percentage based on chunks uploaded
        const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100)
        setUploadProgress(percentage)
      })

      setPreviewUrl(url)
      setAvatarUrl(url)
      setIsUploading(false)
    } catch (error) {
      setIsUploading(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      setUploadError(errorMessage)
      console.error("Upload error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError("")

    try {
      // Find selected class to get class name
      const selectedClass = classes.find(c => c.$id === formData.classId)
      
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'Male' | 'Female',
        grade: formData.grade as 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7',
        avatar: avatarUrl || undefined,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail || undefined,
        parentPhone: formData.parentPhone,
        address: formData.address || undefined,
        medicalInfo: formData.medicalInfo || undefined,
        classId: formData.classId || undefined,
        className: selectedClass?.name,
      }

      if (isEditMode && studentId) {
        // Update existing student
        await updateStudent(studentId, studentData)
        toast.success('Student updated successfully!', {
          description: `${studentData.firstName} ${studentData.lastName} has been updated.`
        })
      } else {
        // Create new student
        await createStudent(studentData)
        toast.success('Student added successfully!', {
          description: `${studentData.firstName} ${studentData.lastName} has been enrolled.`
        })
      }

      setIsSubmitting(false)

      // Reset form if adding new student
      if (!isEditMode) {
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          grade: "",
          classId: "",
          parentName: "",
          parentEmail: "",
          parentPhone: "",
          address: "",
          medicalInfo: "",
        })
        setPreviewUrl("")
        setAvatarUrl("")
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/students")
      }, 1500)
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} student`
      setUploadError(errorMessage)
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} student`, {
        description: errorMessage
      })
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} student:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/students")}
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </h2>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update the student information below' : 'Fill in the student information below'}
          </p>
        </div>
      </div>

      {/* Upload Error Message */}
      {uploadError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{uploadError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Profile Photo</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Student"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2Icon className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CameraIcon className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Upload student photo</p>
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to upload. Maximum 10MB (JPEG, PNG, GIF, WebP)
                </p>
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Student Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Enter last name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="grade" className="text-sm font-medium">
                  Grade/Class <span className="text-red-500">*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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

              <div className="space-y-2">
                <label htmlFor="classId" className="text-sm font-medium">
                  Assign to Class
                </label>
                <select
                  id="classId"
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">No class assigned</option>
                  {classes
                    .filter(cls => formData.grade ? cls.grade === formData.grade : true)
                    .map(cls => (
                      <option key={cls.$id} value={cls.$id}>
                        {cls.name} ({cls.currentStudents}/{cls.capacity})
                      </option>
                    ))}
                </select>
                {formData.grade && classes.filter(cls => cls.grade === formData.grade).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No classes available for {formData.grade}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Parent/Guardian Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="parentName" className="text-sm font-medium">
                  Parent/Guardian Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Enter parent/guardian name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="parentEmail" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="parent@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="parentPhone" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="parentPhone"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Additional Information</h3>
            <div className="space-y-2">
              <label htmlFor="medicalInfo" className="text-sm font-medium">
                Medical Information (Allergies, Conditions, etc.)
              </label>
              <textarea
                id="medicalInfo"
                name="medicalInfo"
                value={formData.medicalInfo}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter any medical information, allergies, or special requirements..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEditMode ? "Updating Student..." : "Adding Student...") 
                : (isEditMode ? "Update Student" : "Add Student")
              }
            </button>
            <button
              type="button"
              onClick={() => navigate("/students")}
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
