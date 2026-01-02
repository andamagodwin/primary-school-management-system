import { useState, useEffect } from "react"
import { UploadIcon, FileIcon, XIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getClassesByTeacher } from "@/lib/classes"
import { createExam, uploadExamFile, getExams, deleteExam, type Exam } from "@/lib/exams"
import { useAuthStore } from "@/store/authStore"
import type { Class } from "@/lib/classes"

export default function ExamsUploadPage() {
  const user = useAuthStore((state) => state.user)
  const [classes, setClasses] = useState<Class[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subject: "",
    term: "Term3",
    academicYear: new Date().getFullYear().toString(),
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadClasses()
    loadExams()
  }, [])

  const loadClasses = async () => {
    try {
      if (user?.userId) {
        const teacherClasses = await getClassesByTeacher(user.userId)
        setClasses(teacherClasses)
        if (teacherClasses.length > 0) {
          setFormData(prev => ({ ...prev, classId: teacherClasses[0].$id }))
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadExams = async () => {
    try {
      if (user?.userId) {
        const teacherExams = await getExams({ createdBy: user.userId })
        setExams(teacherExams)
      }
    } catch (error) {
      console.error('Error loading exams:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!formData.title || !formData.classId || !formData.subject) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    try {
      const selectedClassData = classes.find(c => c.$id === formData.classId)
      if (!selectedClassData) return

      // Upload file
      const fileId = await uploadExamFile(selectedFile)

      // Create exam record
      await createExam({
        title: formData.title,
        classId: formData.classId,
        className: selectedClassData.name,
        subject: formData.subject,
        term: formData.term,
        academicYear: formData.academicYear,
        fileUrl: fileId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        status: 'submitted',
      })

      toast.success('Exam uploaded to secretary successfully!')
      setFormData({ title: "", classId: formData.classId, subject: "", term: "Term3", academicYear: new Date().getFullYear().toString() })
      setSelectedFile(null)
      loadExams()
    } catch (error) {
      console.error('Error uploading exam:', error)
      toast.error('Failed to upload exam')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      await deleteExam(examId)
      toast.success('Exam deleted successfully')
      loadExams()
    } catch (error) {
      console.error('Error deleting exam:', error)
      toast.error('Failed to delete exam')
    }
  }

  const selectedClassData = classes.find(c => c.$id === formData.classId)
  const subjects = selectedClassData?.subjects || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Exam Papers</h2>
        <p className="text-muted-foreground">Upload and manage exam papers for your classes</p>
      </div>

      {/* Upload Form */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Exam Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Primary Two English End of Term 3 2025"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Class & Section</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem.$id} value={classItem.$id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Subject</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
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
          <label className="mb-2 block text-sm font-medium">Exam File</label>
          <div
            onClick={() => document.getElementById('examFile')?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-12 transition-colors hover:border-primary"
          >
            <UploadIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drag & Drop Exam File Here</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              or click to browse (PDF, DOC, DOCX, TXT)
            </p>
            <input
              id="examFile"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
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
                <FileIcon className="h-8 w-8 text-red-600" />
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
            Upload to Secretary
          </button>
        </div>
      </div>

      {/* Recently Uploaded Exams */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Recently Uploaded Exams</h3>
        {exams.length === 0 ? (
          <p className="text-center text-muted-foreground">No exams uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div
                key={exam.$id}
                className="flex items-center justify-between rounded-lg border bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-medium">{exam.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exam.className} | {exam.subject} | {exam.date}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        exam.status === 'submitted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : exam.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(exam.$id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

