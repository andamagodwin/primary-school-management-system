import { useState, useEffect } from "react"
import { SaveIcon, SendIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getClassesByTeacher } from "@/lib/classes"
import { getStudents } from "@/lib/students"
import { createMarks, calculateGrade, type CreateMarkData } from "@/lib/marks"
import { useAuthStore } from "@/store/authStore"
import type { Class } from "@/lib/classes"
import type { Student } from "@/lib/students"

export default function MarksEntryPage() {
  const user = useAuthStore((state) => state.user)
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term3")
  const [selectedAssessment, setSelectedAssessment] = useState<string>("Test1")
  const [marks, setMarks] = useState<Record<string, { marks: number; remarks: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentYear = new Date().getFullYear().toString()

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
  }, [selectedClass])

  const loadClasses = async () => {
    try {
      if (user?.userId) {
        const teacherClasses = await getClassesByTeacher(user.userId)
        setClasses(teacherClasses)
        if (teacherClasses.length > 0) {
          setSelectedClass(teacherClasses[0].$id)
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error)
      toast.error('Failed to load classes')
    }
  }

  const loadStudents = async () => {
    try {
      const allStudents = await getStudents()
      const classStudents = allStudents.filter(s => s.classId === selectedClass)
      setStudents(classStudents)
      
      // Initialize marks object
      const initialMarks: Record<string, { marks: number; remarks: string }> = {}
      classStudents.forEach(student => {
        initialMarks[student.$id] = { marks: 0, remarks: 'Good' }
      })
      setMarks(initialMarks)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Failed to load students')
    }
  }

  const handleMarkChange = (studentId: string, value: number) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: value }
    }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: value }
    }))
  }

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error('Please select class and subject')
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) return

      const marksData: CreateMarkData[] = students.map(student => ({
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: selectedClass,
        className: selectedClassData.name,
        subject: selectedSubject,
        term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
        academicYear: currentYear,
        assessmentType: selectedAssessment as 'Test1' | 'Test2' | 'Midterm' | 'Endterm',
        marks: marks[student.$id]?.marks || 0,
        maxMarks: 100,
        grade: calculateGrade(marks[student.$id]?.marks || 0, 100),
        remarks: marks[student.$id]?.remarks || 'Good',
        status: 'saved',
      }))

      await createMarks(marksData)
      toast.success('Marks saved successfully!')
    } catch (error) {
      console.error('Error saving marks:', error)
      toast.error('Failed to save marks')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit these marks? This action cannot be undone.')) {
      return
    }

    await handleSave()
    // Update status to submitted
    toast.success('Marks submitted to secretary successfully!')
  }

  const selectedClassData = classes.find(c => c.$id === selectedClass)
  const subjects = selectedClassData?.subjects || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Enter Student Marks</h2>
        <p className="text-muted-foreground">Record and submit student assessment marks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class & Section</label>
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
          <label className="mb-2 block text-sm font-medium">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
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

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Term1">Term 1 - {currentYear}</option>
            <option value="Term2">Term 2 - {currentYear}</option>
            <option value="Term3">Term 3 - {currentYear}</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Assessment Type</label>
          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Test1">Test 1</option>
            <option value="Test2">Test 2</option>
            <option value="Midterm">Mid-term</option>
            <option value="Endterm">End of Term</option>
          </select>
        </div>
      </div>

      {/* Marks Table */}
      {students.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Marks (Out of 100)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentMark = marks[student.$id]?.marks || 0
                  const grade = calculateGrade(studentMark, 100)
                  return (
                    <tr key={student.$id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="px-4 py-3">{student.admissionNumber}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={marks[student.$id]?.marks || 0}
                          onChange={(e) => handleMarkChange(student.$id, parseInt(e.target.value) || 0)}
                          className="w-20 rounded-md border bg-background px-2 py-1 text-center text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">{grade}</td>
                      <td className="px-4 py-3">
                        <select
                          value={marks[student.$id]?.remarks || 'Good'}
                          onChange={(e) => handleRemarksChange(student.$id, e.target.value)}
                          className="w-40 rounded-md border bg-background px-2 py-1 text-sm"
                        >
                          <option>Excellent</option>
                          <option>Good</option>
                          <option>Average</option>
                          <option>Needs Improvement</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 border-t p-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="h-4 w-4" />
              )}
              Save Marks
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
              Submit to Secretary
            </button>
          </div>
        </div>
      )}

      {students.length === 0 && selectedClass && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No students found in this class</p>
        </div>
      )}
    </div>
  )
}

