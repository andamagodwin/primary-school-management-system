import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-react"

export default function AddStudentPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    grade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    medicalInfo: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setShowSuccess(true)

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      grade: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      address: "",
      medicalInfo: "",
    })

    // Hide success message and redirect after 2 seconds
    setTimeout(() => {
      setShowSuccess(false)
      navigate("/students")
    }, 2000)
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
          <h2 className="text-3xl font-bold tracking-tight">Add New Student</h2>
          <p className="text-muted-foreground">
            Fill in the student information below
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircleIcon className="h-5 w-5" />
          <p className="font-medium">Student added successfully!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
        <div className="space-y-6">
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
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
              {isSubmitting ? "Adding Student..." : "Add Student"}
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
