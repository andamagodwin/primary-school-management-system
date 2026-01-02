import { useState, useEffect } from "react"
import { SaveIcon, MessageSquareIcon, Loader2Icon, FilterIcon } from "lucide-react"
import { toast } from "sonner"
import { getStudents } from "@/lib/students"
import { getClasses } from "@/lib/classes"
import { getMarks } from "@/lib/marks"
import { getReportComments, createReportComment, updateReportComment, type ReportComment } from "@/lib/reportComments"
import { useAuthStore } from "@/store/authStore"
import type { Student } from "@/lib/students"

export default function ReportCommentsPage() {
  const user = useAuthStore((state) => state.user)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [comments, setComments] = useState<Record<string, ReportComment>>({})
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term3")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [studentComments, setStudentComments] = useState<Record<string, { comment: string; commentType: string }>>({})
  const [studentAverages, setStudentAverages] = useState<Record<string, number>>({})
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentForm, setCommentForm] = useState({
    comment: "",
    commentType: "academic" as 'academic' | 'behavior' | 'improvement' | 'encouragement',
    signature: user?.fullName || "Director of Studies",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStudents()
      loadComments()
    }
  }, [selectedClass, selectedTerm, selectedYear])

  const loadClasses = async () => {
    try {
      const classList = await getClasses()
      setClasses(classList)
      if (classList.length > 0) {
        setSelectedClass(classList[0].$id)
      }
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const allStudents = await getStudents()
      const classStudents = allStudents.filter(s => s.classId === selectedClass)
      setStudents(classStudents)

      // Initialize comments
      const initialComments: Record<string, { comment: string; commentType: string }> = {}
      classStudents.forEach(student => {
        initialComments[student.$id] = { comment: "", commentType: "academic" }
      })
      setStudentComments(initialComments)

      // Load averages
      const averages: Record<string, number> = {}
      for (const student of classStudents) {
        const avg = await getStudentAverage(student)
        averages[student.$id] = avg
      }
      setStudentAverages(averages)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const loadComments = async () => {
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) return

      const existingComments = await getReportComments({
        classId: selectedClass,
        term: selectedTerm,
        academicYear: selectedYear,
      })

      const commentsMap: Record<string, ReportComment> = {}
      existingComments.forEach(comment => {
        commentsMap[comment.studentId] = comment
      })
      setComments(commentsMap)

      // Update student comments with existing data
      const updatedComments: Record<string, { comment: string; commentType: string }> = {}
      students.forEach(student => {
        const existing = commentsMap[student.studentId]
        updatedComments[student.$id] = {
          comment: existing?.comment || "",
          commentType: existing?.commentType || "academic",
        }
      })
      setStudentComments(prev => ({ ...prev, ...updatedComments }))
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleCommentChange = (studentId: string, comment: string) => {
    setStudentComments(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment }
    }))
  }

  const handleSaveComment = async (student: Student) => {
    if (!studentComments[student.$id]?.comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) return

      const commentData = {
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: selectedClass,
        className: selectedClassData.name,
        term: selectedTerm,
        academicYear: selectedYear,
        commentType: studentComments[student.$id].commentType as 'academic' | 'behavior' | 'improvement' | 'encouragement',
        comment: studentComments[student.$id].comment,
        signature: commentForm.signature,
      }

      const existing = comments[student.studentId]
      if (existing) {
        await updateReportComment(existing.$id, commentData)
      } else {
        await createReportComment(commentData)
      }

      toast.success(`Comment saved for ${student.firstName} ${student.lastName}`)
      loadComments()
    } catch (error) {
      console.error('Error saving comment:', error)
      toast.error('Failed to save comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAdvancedComment = (student: Student) => {
    setSelectedStudent(student)
    const existing = comments[student.studentId]
    setCommentForm({
      comment: existing?.comment || studentComments[student.$id]?.comment || "",
      commentType: (existing?.commentType || studentComments[student.$id]?.commentType || "academic") as any,
      signature: commentForm.signature,
    })
    setShowCommentModal(true)
  }

  const handleSaveAdvancedComment = async () => {
    if (!selectedStudent || !commentForm.comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) return

      const commentData = {
        studentId: selectedStudent.studentId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        classId: selectedClass,
        className: selectedClassData.name,
        term: selectedTerm,
        academicYear: selectedYear,
        commentType: commentForm.commentType,
        comment: commentForm.comment,
        signature: commentForm.signature,
      }

      const existing = comments[selectedStudent.studentId]
      if (existing) {
        await updateReportComment(existing.$id, commentData)
      } else {
        await createReportComment(commentData)
      }

      toast.success('Comment saved successfully')
      setShowCommentModal(false)
      loadComments()
    } catch (error) {
      console.error('Error saving comment:', error)
      toast.error('Failed to save comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStudentAverage = async (student: Student): Promise<number> => {
    try {
      const marks = await getMarks({
        studentId: student.studentId,
        term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
        academicYear: selectedYear,
      })

      if (marks.length === 0) return 0

      const totalMarks = marks.reduce((sum, m) => sum + m.marks, 0)
      const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0)
      return totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0
    } catch (error) {
      return 0
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Report Card Comments</h2>
        <p className="text-muted-foreground">Add Director of Studies comments to student reports</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
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

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Term1">Term 1 - {selectedYear}</option>
            <option value="Term2">Term 2 - {selectedYear}</option>
            <option value="Term3">Term 3 - {selectedYear}</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadStudents}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <FilterIcon className="h-4 w-4" />
            Load Students
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Average Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Class Teacher Comment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Add DOS Comment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const average = studentAverages[student.$id] || 0
                const existingComment = comments[student.studentId]
                return (
                  <tr key={student.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{`${student.firstName} ${student.lastName}`}</td>
                    <td className="px-4 py-3 font-semibold">{average}%</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {existingComment ? "Comment added" : "No comment yet"}
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={studentComments[student.$id]?.comment || ""}
                        onChange={(e) => handleCommentChange(student.$id, e.target.value)}
                        placeholder="Enter DOS comment here..."
                        rows={3}
                        className="w-full rounded-md border bg-background px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveComment(student)}
                          disabled={isSubmitting}
                          className="rounded-md border bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          <SaveIcon className="mr-1 inline h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => openAdvancedComment(student)}
                          className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                        >
                          <MessageSquareIcon className="mr-1 inline h-4 w-4" />
                          Advanced
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No students found. Select a class to load students.</p>
        </div>
      )}

      {/* Advanced Comment Modal */}
      {showCommentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Add DOS Comment</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Student</label>
                <input
                  type="text"
                  value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                  readOnly
                  className="w-full rounded-md border bg-muted px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Comment Type</label>
                <select
                  value={commentForm.commentType}
                  onChange={(e) => setCommentForm({ ...commentForm, commentType: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="academic">Academic Performance</option>
                  <option value="behavior">Behavior & Conduct</option>
                  <option value="improvement">Areas for Improvement</option>
                  <option value="encouragement">Words of Encouragement</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Comment</label>
                <textarea
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  rows={6}
                  placeholder="Enter your comment..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Signature</label>
                <input
                  type="text"
                  value={commentForm.signature}
                  onChange={(e) => setCommentForm({ ...commentForm, signature: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdvancedComment}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      Save Comment
                    </>
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

