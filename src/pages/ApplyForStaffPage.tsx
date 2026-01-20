import { useState, useRef } from "react"
import { toast } from "sonner"
import { createApplication, uploadCVFile, type CreateApplicationData } from "@/lib/staffApplications"
import { Loader2Icon, UploadIcon, FileIcon } from "lucide-react"

export default function ApplyForStaffPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateApplicationData>({
    applicantName: "",
    email: "",
    phone: "",
    position: "",
    qualification: "",
    experience: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? parseInt(value) || 0 : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      // Check file type (PDF, DOC, DOCX)
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document")
        return
      }
      setCvFile(file)
      setCvFileName(file.name)
    }
  }

  const handleRemoveFile = () => {
    setCvFile(null)
    setCvFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.applicantName.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email")
      return
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }
    if (!formData.position.trim()) {
      toast.error("Please select a position")
      return
    }
    if (!formData.qualification.trim()) {
      toast.error("Please enter your qualification")
      return
    }
    if (formData.experience < 0) {
      toast.error("Please enter valid years of experience")
      return
    }

    setIsSubmitting(true)

    try {
      let cvUrl: string | undefined
      let cvFileNameForDb: string | undefined

      // Upload CV if provided
      if (cvFile) {
        setIsUploading(true)
        try {
          const fileId = await uploadCVFile(cvFile)
          cvUrl = fileId
          cvFileNameForDb = cvFileName
          toast.success("CV uploaded successfully")
        } catch (error) {
          console.error("Error uploading CV:", error)
          toast.error("Failed to upload CV. Please try again.")
          setIsUploading(false)
          setIsSubmitting(false)
          return
        } finally {
          setIsUploading(false)
        }
      }

      // Create application
      const applicationData: CreateApplicationData = {
        ...formData,
        cvUrl,
        cvFileName: cvFileNameForDb,
      }

      await createApplication(applicationData)
      toast.success("Application submitted successfully! We will contact you soon.")

      // Reset form
      setFormData({
        applicantName: "",
        email: "",
        phone: "",
        position: "",
        qualification: "",
        experience: 0,
      })
      setCvFile(null)
      setCvFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const positions = [
    "Teacher",
    "Administrative Staff",
    "Security Guard",
    "Cleaner",
    "Cook",
    "Nurse",
    "Librarian",
    "IT Support",
    "Accountant",
    "Secretary",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Application Form</h1>
            <p className="text-gray-600">Fill out the form below to apply for a position at our school</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Name */}
            <div>
              <label htmlFor="applicantName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="applicantName"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+256 XXX XXX XXX"
              />
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position Applied For <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                Qualification <span className="text-red-500">*</span>
              </label>
              <textarea
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your educational qualifications and certifications"
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV/Resume (Optional)
              </label>
              <div className="mt-2">
                {!cvFile ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="cv-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF or Word Document (MAX. 5MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cvFileName}</p>
                        <p className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                    {isUploading ? "Uploading CV..." : "Submitting Application..."}
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our terms and conditions. We will review your application and contact you soon.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

