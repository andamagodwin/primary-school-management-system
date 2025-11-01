import { useState, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeftIcon, CameraIcon, Loader2Icon, UserIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { createTeacher, getTeachers, updateTeacher, type Teacher } from "@/lib/teachers"
import { uploadFile } from "@/lib/storage"
import type { UploadProgress } from "appwrite"

export default function AddTeacherPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const teacherId = searchParams.get("id")
  const isEditMode = !!teacherId

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    dateOfJoining: "",
    qualification: "",
    specialization: "",
    employmentType: "",
    salary: "",
    bankDetails: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    notes: "",
  })

  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState("")
  const [classInput, setClassInput] = useState("")

  // Load teacher data when in edit mode
  useEffect(() => {
    const loadTeacherData = async () => {
      if (!teacherId) return

      setIsLoading(true)
      try {
        const teachers = await getTeachers()
        const teacher = teachers.find((t: Teacher) => t.$id === teacherId)
        
        if (teacher) {
          setFormData({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            dateOfBirth: teacher.dateOfBirth,
            gender: teacher.gender,
            address: teacher.address || "",
            dateOfJoining: teacher.dateOfJoining,
            qualification: teacher.qualification,
            specialization: teacher.specialization,
            employmentType: teacher.employmentType,
            salary: teacher.salary?.toString() || "",
            bankDetails: teacher.bankDetails || "",
            emergencyContactName: teacher.emergencyContact?.name || "",
            emergencyContactPhone: teacher.emergencyContact?.phone || "",
            emergencyContactRelationship: teacher.emergencyContact?.relationship || "",
            notes: teacher.notes || "",
          })
          
          setSubjects(teacher.subjects || [])
          setClasses(teacher.classes || [])
          
          if (teacher.avatar) {
            setPreviewUrl(teacher.avatar)
            setAvatarUrl(teacher.avatar)
          }
        }
      } catch (error) {
        console.error("Error loading teacher:", error)
        setUploadError("Failed to load teacher data")
      } finally {
        setIsLoading(false)
      }
    }

    loadTeacherData()
  }, [teacherId])

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

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()])
      setSubjectInput("")
    }
  }

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject))
  }

  const handleAddClass = () => {
    if (classInput && !classes.includes(classInput)) {
      setClasses([...classes, classInput])
      setClassInput("")
    }
  }

  const handleRemoveClass = (className: string) => {
    setClasses(classes.filter(c => c !== className))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError("")

    try {
      const teacherData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'Male' | 'Female',
        address: formData.address || undefined,
        avatar: avatarUrl || undefined,
        dateOfJoining: formData.dateOfJoining,
        qualification: formData.qualification,
        specialization: formData.specialization,
        subjects,
        classes,
        employmentType: formData.employmentType as 'Full-time' | 'Part-time' | 'Contract',
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        bankDetails: formData.bankDetails || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        } : undefined,
        notes: formData.notes || undefined,
      }

      if (isEditMode && teacherId) {
        // Update existing teacher
        await updateTeacher(teacherId, teacherData)
        toast.success('Teacher updated successfully!', {
          description: `${teacherData.firstName} ${teacherData.lastName} has been updated.`
        })
      } else {
        // Create new teacher
        await createTeacher(teacherData)
        toast.success('Teacher added successfully!', {
          description: `${teacherData.firstName} ${teacherData.lastName} has been added to the staff.`
        })
      }

      setIsSubmitting(false)

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/teachers")
      }, 1500)
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} teacher`
      setUploadError(errorMessage)
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} teacher`, {
        description: errorMessage
      })
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} teacher:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading teacher data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/teachers")}
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update the teacher information below' : 'Fill in the teacher information below'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{uploadError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div>
            <label className="mb-2 block text-sm font-medium">Profile Photo</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click the camera icon to upload a photo. Maximum file size: 10MB
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="gender" className="mb-2 block text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="mb-2 block text-sm font-medium">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Employment Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="dateOfJoining" className="mb-2 block text-sm font-medium">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="employmentType" className="mb-2 block text-sm font-medium">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label htmlFor="qualification" className="mb-2 block text-sm font-medium">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bachelor's in Education"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="mb-2 block text-sm font-medium">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Mathematics"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="salary" className="mb-2 block text-sm font-medium">
                  Salary (Optional)
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Monthly salary"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="bankDetails" className="mb-2 block text-sm font-medium">
                  Bank Details (Optional)
                </label>
                <input
                  id="bankDetails"
                  name="bankDetails"
                  type="text"
                  value={formData.bankDetails}
                  onChange={handleChange}
                  placeholder="Account number or details"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
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

          {/* Classes */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Classes <span className="text-red-500">*</span></h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select class</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                  <option value="P5">P5</option>
                  <option value="P6">P6</option>
                  <option value="P7">P7</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddClass}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
              {classes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {classes.map((className) => (
                    <div
                      key={className}
                      className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm"
                    >
                      <span>{className}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(className)}
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

          {/* Emergency Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Emergency Contact</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="emergencyContactName" className="mb-2 block text-sm font-medium">
                  Contact Name
                </label>
                <input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactPhone" className="mb-2 block text-sm font-medium">
                  Contact Phone
                </label>
                <input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactRelationship" className="mb-2 block text-sm font-medium">
                  Relationship
                </label>
                <input
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  type="text"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Sibling"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
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
              placeholder="Any additional information..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="submit"
              disabled={isSubmitting || subjects.length === 0 || classes.length === 0}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting 
                ? (isEditMode ? "Updating Teacher..." : "Adding Teacher...") 
                : (isEditMode ? "Update Teacher" : "Add Teacher")
              }
            </button>
            <button
              type="button"
              onClick={() => navigate("/teachers")}
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
