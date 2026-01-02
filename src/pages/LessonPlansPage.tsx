import { useState, useEffect } from "react"
import { UploadIcon, FileIcon, XIcon, Loader2Icon, BookOpenIcon } from "lucide-react"
import { toast } from "sonner"
import { createLessonPlan, uploadLessonPlanFile, getLessonPlans, deleteLessonPlan, type LessonPlan } from "@/lib/lessonPlans"
import { useAuthStore } from "@/store/authStore"

export default function LessonPlansPage() {
  const user = useAuthStore((state) => state.user)
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    weekNumber: 1,
    term: "Term3",
    academicYear: new Date().getFullYear().toString(),
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadLessonPlans()
  }, [])

  const loadLessonPlans = async () => {
    try {
      if (user?.userId) {
        const plans = await getLessonPlans({ createdBy: user.userId })
        setLessonPlans(plans)
      }
    } catch (error) {
      console.error('Error loading lesson plans:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!formData.title || !formData.subject) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    try {
      // Upload file
      const fileId = await uploadLessonPlanFile(selectedFile)

      // Create lesson plan record
      await createLessonPlan({
        title: formData.title,
        subject: formData.subject,
        weekNumber: formData.weekNumber,
        term: formData.term,
        academicYear: formData.academicYear,
        fileUrl: fileId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        status: 'submitted',
      })

      toast.success('Lesson plan uploaded to DOS successfully!')
      setFormData({ title: "", subject: "", weekNumber: 1, term: "Term3", academicYear: new Date().getFullYear().toString() })
      setSelectedFile(null)
      loadLessonPlans()
    } catch (error) {
      console.error('Error uploading lesson plan:', error)
      toast.error('Failed to upload lesson plan')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return

    try {
      await deleteLessonPlan(planId)
      toast.success('Lesson plan deleted successfully')
      loadLessonPlans()
    } catch (error) {
      console.error('Error deleting lesson plan:', error)
      toast.error('Failed to delete lesson plan')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Lesson Plans</h2>
        <p className="text-muted-foreground">Upload and manage your weekly lesson plans</p>
      </div>

      {/* Upload Form */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Lesson Plan Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Fractions"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Subject</option>
              <option value="English">English</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Literacy">Literacy</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Week Number</label>
            <select
              value={formData.weekNumber}
              onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Term</label>
            <select
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="Term1">Term 1</option>
              <option value="Term2">Term 2</option>
              <option value="Term3">Term 3</option>
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium">Lesson Plan File</label>
          <div
            onClick={() => document.getElementById('lessonFile')?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 transition-colors hover:border-primary"
          >
            <BookOpenIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Upload Lesson Plan File</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Click to browse (PDF, DOC, DOCX)
            </p>
            <input
              id="lessonFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Browse Files
            </button>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">{selectedFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <UploadIcon className="h-4 w-4" />
            )}
            Upload to DOS
          </button>
        </div>
      </div>

      {/* My Lesson Plans */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">My Lesson Plans</h3>
        {lessonPlans.length === 0 ? (
          <p className="text-center text-muted-foreground">No lesson plans uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {lessonPlans.map((plan) => (
              <div
                key={plan.$id}
                className="rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{plan.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      <BookOpenIcon className="mr-1 inline h-4 w-4" />
                      {plan.subject} | Week {plan.weekNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded: {new Date(plan.$createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(plan.status)}`}
                    >
                      {plan.status}
                    </span>
                    <button
                      onClick={() => handleDelete(plan.$id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

