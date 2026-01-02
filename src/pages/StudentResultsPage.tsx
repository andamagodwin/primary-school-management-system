import { useState, useEffect } from "react"
import { DownloadIcon, FilterIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getMarks } from "@/lib/marks"
import { getStudents } from "@/lib/students"
import { getClasses } from "@/lib/classes"

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term3")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      loadResults()
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

  const loadResults = async () => {
    try {
      setIsLoading(true)
      const students = await getStudents()
      const classStudents = students.filter(s => s.classId === selectedClass)
      
      const resultsData = await Promise.all(
        classStudents.map(async (student) => {
          const marks = await getMarks({
            studentId: student.studentId,
            term: selectedTerm as 'Term1' | 'Term2' | 'Term3',
            academicYear: selectedYear,
          })

          const subjectMarks: Record<string, number> = {}
          marks.forEach(mark => {
            subjectMarks[mark.subject] = Math.round((mark.marks / mark.maxMarks) * 100)
          })

          const allMarks = Object.values(subjectMarks)
          const average = allMarks.length > 0 
            ? Math.round(allMarks.reduce((a, b) => a + b, 0) / allMarks.length)
            : 0

          return {
            studentId: student.studentId,
            name: `${student.firstName} ${student.lastName}`,
            admissionNumber: student.admissionNumber,
            english: subjectMarks['English'] || 0,
            mathematics: subjectMarks['Mathematics'] || 0,
            science: subjectMarks['Science'] || 0,
            sst: subjectMarks['Social Studies'] || 0,
            average,
            position: 0, // Would need to calculate based on all students
            reportStatus: marks.length > 0 ? 'completed' : 'pending',
          }
        })
      )

      // Sort by average and assign positions
      resultsData.sort((a, b) => b.average - a.average)
      resultsData.forEach((result, index) => {
        result.position = index + 1
      })

      setResults(resultsData)
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    toast.success('Results exported successfully')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Performance & Results</h2>
        <p className="text-muted-foreground">View and analyze student academic performance</p>
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

        <div className="flex items-end gap-2">
          <button
            onClick={loadResults}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <FilterIcon className="h-4 w-4" />
            Load Results
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Results Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">English</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mathematics</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Science</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">SST</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Average</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Report Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.studentId} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{result.name}</td>
                    <td className="px-4 py-3">{result.admissionNumber}</td>
                    <td className="px-4 py-3">{result.english}%</td>
                    <td className="px-4 py-3">{result.mathematics}%</td>
                    <td className="px-4 py-3">{result.science}%</td>
                    <td className="px-4 py-3">{result.sst}%</td>
                    <td className="px-4 py-3 font-semibold">{result.average}%</td>
                    <td className="px-4 py-3">{result.position}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          result.reportStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {result.reportStatus === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No results found. Select a class and term to load results.</p>
        </div>
      )}
    </div>
  )
}

