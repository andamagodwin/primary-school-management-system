import { useState, useEffect } from "react"
import { SaveIcon, SendIcon, Loader2Icon, CheckCircleIcon, AlertCircleIcon, RefreshCwIcon, PlusIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getClassesByTeacher, getClasses, createPrimarySchoolClasses } from "@/lib/classes"
import { getStudents } from "@/lib/students"
import { createMarks, updateMark, getMarks, calculateGrade, type CreateMarkData, type Mark } from "@/lib/marks"
import { useAuthStore } from "@/store/authStore"
import type { Class } from "@/lib/classes"
import type { Student } from "@/lib/students"

interface StudentMarkData {
  marks: number
  remarks: string
  maxMarks: number
  existingMarkId?: string
  status?: 'draft' | 'saved' | 'submitted'
}

export default function MarksEntryPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [existingMarks, setExistingMarks] = useState<Mark[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term1")
  const [selectedAssessment, setSelectedAssessment] = useState<string>("Test1")
  const [maxMarks, setMaxMarks] = useState<number>(100)
  const [marks, setMarks] = useState<Record<string, StudentMarkData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const currentYear = new Date().getFullYear().toString()

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    } else {
      setStudents([])
      setMarks({})
      setExistingMarks([])
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm && selectedAssessment) {
      loadExistingMarks()
    } else {
      setExistingMarks([])
      setMarks({})
    }
  }, [selectedClass, selectedSubject, selectedTerm, selectedAssessment])

  const loadClasses = async () => {
    try {
      if (user?.userId) {
        // First try to get classes assigned to this teacher
        let teacherClasses = await getClassesByTeacher(user.userId)
        
        // If no classes assigned, show all active classes
        if (teacherClasses.length === 0) {
          const allClasses = await getClasses()
          teacherClasses = allClasses.filter(c => c.status === 'active')
        }
        
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
      setIsLoading(true)
      const allStudents = await getStudents()
      const classStudents = allStudents.filter(s => s.classId === selectedClass && s.status === 'active')
      setStudents(classStudents)
      
      // Initialize marks object with default values
      const initialMarks: Record<string, StudentMarkData> = {}
      classStudents.forEach(student => {
        initialMarks[student.studentId] = {
          marks: 0,
          remarks: 'Good',
          maxMarks: maxMarks,
        }
      })
      setMarks(initialMarks)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExistingMarks = async () => {
    try {
      setIsLoading(true)
      const marksData = await getMarks({
        classId: selectedClass,
        subject: selectedSubject,
        term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
        academicYear: currentYear,
        assessmentType: selectedAssessment as 'Test1' | 'Test2' | 'Midterm' | 'Endterm',
      })

      setExistingMarks(marksData)

      // Update marks state with existing data
      const updatedMarks: Record<string, StudentMarkData> = { ...marks }
      marksData.forEach(mark => {
        updatedMarks[mark.studentId] = {
          marks: mark.marks,
          remarks: mark.remarks || 'Good',
          maxMarks: mark.maxMarks,
          existingMarkId: mark.$id,
          status: mark.status,
        }
      })

      // Also update maxMarks if we found existing marks
      if (marksData.length > 0) {
        setMaxMarks(marksData[0].maxMarks)
      }

      setMarks(updatedMarks)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error loading existing marks:', error)
      toast.error('Failed to load existing marks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkChange = (studentId: string, value: number) => {
    if (value < 0) value = 0
    if (value > maxMarks) value = maxMarks
    
    setMarks(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        marks: value,
        maxMarks: maxMarks,
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: value }
    }))
    setHasUnsavedChanges(true)
  }

  const handleMaxMarksChange = (value: number) => {
    if (value < 1) value = 1
    setMaxMarks(value)
    
    // Update all marks to use new maxMarks
    const updatedMarks: Record<string, StudentMarkData> = {}
    Object.keys(marks).forEach(studentId => {
      updatedMarks[studentId] = {
        ...marks[studentId],
        maxMarks: value,
      }
    })
    setMarks(updatedMarks)
    setHasUnsavedChanges(true)
  }

  const validateMarks = (): boolean => {
    if (!selectedClass || !selectedSubject) {
      toast.error('Please select class and subject')
      return false
    }

    if (students.length === 0) {
      toast.error('No students found in this class')
      return false
    }

    const hasMarks = Object.values(marks).some(m => m.marks > 0)
    if (!hasMarks) {
      toast.error('Please enter at least one mark')
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateMarks()) return

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) {
        toast.error('Class not found')
        return
      }

      const marksToCreate: CreateMarkData[] = []
      const marksToUpdate: Array<{ id: string; data: Partial<CreateMarkData> }> = []

      students.forEach(student => {
        const studentMark = marks[student.studentId]
        if (!studentMark) return

        const markData: CreateMarkData = {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          classId: selectedClass,
          className: selectedClassData.name,
          subject: selectedSubject,
          term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
          academicYear: currentYear,
          assessmentType: selectedAssessment as 'Test1' | 'Test2' | 'Midterm' | 'Endterm',
          marks: studentMark.marks,
          maxMarks: studentMark.maxMarks,
          grade: calculateGrade(studentMark.marks, studentMark.maxMarks),
          remarks: studentMark.remarks,
          status: 'saved',
        }

        // If mark exists, update it; otherwise create new
        if (studentMark.existingMarkId) {
          marksToUpdate.push({
            id: studentMark.existingMarkId,
            data: markData,
          })
        } else {
          marksToCreate.push(markData)
        }
      })

      // Update existing marks
      await Promise.all(marksToUpdate.map(({ id, data }) => updateMark(id, data)))

      // Create new marks
      if (marksToCreate.length > 0) {
        await createMarks(marksToCreate)
      }

      toast.success(`Successfully saved ${marksToCreate.length + marksToUpdate.length} mark(s)!`)
      setHasUnsavedChanges(false)
      
      // Reload existing marks to update the UI
      await loadExistingMarks()
    } catch (error) {
      console.error('Error saving marks:', error)
      toast.error('Failed to save marks')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateMarks()) return

    const hasSubmittedMarks = Object.values(marks).some(m => m.status === 'submitted')
    if (hasSubmittedMarks) {
      const confirmed = confirm('Some marks are already submitted. Do you want to resubmit them?')
      if (!confirmed) return
    }

    const confirmed = confirm('Are you sure you want to submit these marks? Once submitted, they will be sent to the secretary for review.')
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      const selectedClassData = classes.find(c => c.$id === selectedClass)
      if (!selectedClassData) {
        toast.error('Class not found')
        return
      }

      const marksToCreate: CreateMarkData[] = []
      const marksToUpdate: Array<{ id: string; data: Partial<CreateMarkData> }> = []

      students.forEach(student => {
        const studentMark = marks[student.studentId]
        if (!studentMark) return

        const markData: CreateMarkData = {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          classId: selectedClass,
          className: selectedClassData.name,
          subject: selectedSubject,
          term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
          academicYear: currentYear,
          assessmentType: selectedAssessment as 'Test1' | 'Test2' | 'Midterm' | 'Endterm',
          marks: studentMark.marks,
          maxMarks: studentMark.maxMarks,
          grade: calculateGrade(studentMark.marks, studentMark.maxMarks),
          remarks: studentMark.remarks,
          status: 'submitted',
        }

        // If mark exists, update it; otherwise create new
        if (studentMark.existingMarkId) {
          marksToUpdate.push({
            id: studentMark.existingMarkId,
            data: markData,
          })
        } else {
          marksToCreate.push(markData)
        }
      })

      // Update existing marks
      await Promise.all(marksToUpdate.map(({ id, data }) => updateMark(id, data)))

      // Create new marks
      if (marksToCreate.length > 0) {
        await createMarks(marksToCreate)
      }

      toast.success(`Successfully submitted ${marksToCreate.length + marksToUpdate.length} mark(s) to secretary!`)
      setHasUnsavedChanges(false)
      
      // Reload existing marks to update the UI
      await loadExistingMarks()
    } catch (error) {
      console.error('Error submitting marks:', error)
      toast.error('Failed to submit marks')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedClassData = classes.find(c => c.$id === selectedClass)
  const subjects = selectedClassData?.subjects || []
  const submittedCount = Object.values(marks).filter(m => m.status === 'submitted').length
  const savedCount = Object.values(marks).filter(m => m.status === 'saved').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enter Student Marks</h2>
          <p className="text-muted-foreground">Record and submit student assessment marks</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-2 text-sm text-yellow-800">
            <AlertCircleIcon className="h-4 w-4" />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Class & Section</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSubject("")
                setMarks({})
                setHasUnsavedChanges(false)
              }}
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
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setMarks({})
                setHasUnsavedChanges(false)
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              disabled={!selectedClass}
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
              value={selectedTerm}
              onChange={(e) => {
                setSelectedTerm(e.target.value)
                setMarks({})
                setHasUnsavedChanges(false)
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="Term1">Term 1 - {currentYear}</option>
              <option value="Term2">Term 2 - {currentYear}</option>
              <option value="Term3">Term 3 - {currentYear}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Assessment Type</label>
            <select
              value={selectedAssessment}
              onChange={(e) => {
                setSelectedAssessment(e.target.value)
                setMarks({})
                setHasUnsavedChanges(false)
              }}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="Test1">Test 1</option>
              <option value="Test2">Test 2</option>
              <option value="Midterm">Mid-term</option>
              <option value="Endterm">End of Term</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Max Marks</label>
            <input
              type="number"
              min="1"
              value={maxMarks}
              onChange={(e) => handleMaxMarksChange(parseInt(e.target.value) || 100)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Status Summary */}
        {(submittedCount > 0 || savedCount > 0) && (
          <div className="flex gap-4 border-t pt-4 text-sm">
            {submittedCount > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{submittedCount} Submitted</span>
              </div>
            )}
            {savedCount > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <SaveIcon className="h-4 w-4" />
                <span>{savedCount} Saved</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Marks Table */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : students.length > 0 && selectedSubject ? (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Marks (Out of {maxMarks})
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const studentMark = marks[student.studentId] || { marks: 0, remarks: 'Good', maxMarks: maxMarks }
                  const percentage = studentMark.maxMarks > 0 
                    ? Math.round((studentMark.marks / studentMark.maxMarks) * 100) 
                    : 0
                  const grade = calculateGrade(studentMark.marks, studentMark.maxMarks)
                  
                  return (
                    <tr key={student.$id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        {`${student.firstName} ${student.lastName}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {student.admissionNumber}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.5"
                          value={studentMark.marks || 0}
                          onChange={(e) => handleMarkChange(student.studentId, parseFloat(e.target.value) || 0)}
                          className="w-24 rounded-md border bg-background px-2 py-1 text-center text-sm"
                          disabled={studentMark.status === 'submitted'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          percentage >= 80 ? 'text-green-600' :
                          percentage >= 60 ? 'text-blue-600' :
                          percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={studentMark.remarks || 'Good'}
                          onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                          className="w-40 rounded-md border bg-background px-2 py-1 text-sm"
                          disabled={studentMark.status === 'submitted'}
                        >
                          <option>Excellent</option>
                          <option>Good</option>
                          <option>Average</option>
                          <option>Needs Improvement</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {studentMark.status === 'submitted' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <CheckCircleIcon className="h-3 w-3" />
                            Submitted
                          </span>
                        ) : studentMark.status === 'saved' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            <SaveIcon className="h-3 w-3" />
                            Saved
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Draft</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Total Students: {students.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadExistingMarks}
                disabled={isSubmitting || isLoading}
                className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || isLoading || !hasUnsavedChanges}
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
                disabled={isSubmitting || isLoading || !hasUnsavedChanges}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
                Submit to Secretary
              </button>
            </div>
          </div>
        </div>
      ) : selectedClass && !selectedSubject ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Please select a subject to enter marks</p>
        </div>
      ) : selectedClass && students.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No active students found in this class</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <p className="text-lg font-medium text-muted-foreground">
              No classes found
            </p>
            <p className="text-sm text-muted-foreground">
              Classes need to be created before you can enter marks. You can either:
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    const currentYear = new Date().getFullYear().toString()
                    
                    toast.loading('Creating primary school classes...', { id: 'create-classes' })
                    
                    await createPrimarySchoolClasses(currentYear, 'Term1')
                    
                    toast.success('Primary school classes created successfully!', { id: 'create-classes' })
                    
                    // Reload classes
                    await loadClasses()
                  } catch (error) {
                    console.error('Error creating classes:', error)
                    toast.error('Failed to create classes', { id: 'create-classes' })
                  }
                }}
                className="mx-auto flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Primary School Classes (P1-P7)
              </button>
              <p className="text-xs text-muted-foreground">or</p>
              <button
                onClick={() => navigate('/classes')}
                className="mx-auto flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Go to Classes Page
              </button>
            </div>
            <p className="pt-4 text-xs text-muted-foreground">
              Note: If you don't have permission to create classes, please contact your administrator.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Please select a class to begin</p>
        </div>
      )}
    </div>
  )
}
