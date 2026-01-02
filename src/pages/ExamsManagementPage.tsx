import { useState, useEffect } from "react"
import { EyeIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getExams, approveExam, rejectExam, type Exam } from "@/lib/exams"
import { getClasses } from "@/lib/classes"

export default function ExamsManagementPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [classFilter, setClassFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    loadExams()
    loadClasses()
  }, [])

  useEffect(() => {
    filterExams()
  }, [exams, classFilter, statusFilter])

  const loadClasses = async () => {
    try {
      const classList = await getClasses()
      setClasses(classList)
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadExams = async () => {
    try {
      setIsLoading(true)
      const allExams = await getExams()
      setExams(allExams)
    } catch (error) {
      console.error('Error loading exams:', error)
      toast.error('Failed to load exams')
    } finally {
      setIsLoading(false)
    }
  }

  const filterExams = () => {
    let filtered = [...exams]

    if (classFilter !== "all") {
      filtered = filtered.filter(e => e.classId === classFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter)
    }

    setFilteredExams(filtered)
  }

  const handleApprove = async (examId: string) => {
    if (!confirm('Are you sure you want to approve this exam?')) return

    setIsProcessing(true)
    try {
      await approveExam(examId)
      toast.success('Exam approved successfully')
      loadExams()
      setSelectedExam(null)
    } catch (error) {
      console.error('Error approving exam:', error)
      toast.error('Failed to approve exam')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (examId: string) => {
    if (!confirm('Are you sure you want to reject this exam?')) return

    setIsProcessing(true)
    try {
      await rejectExam(examId)
      toast.success('Exam rejected')
      loadExams()
      setSelectedExam(null)
    } catch (error) {
      console.error('Error rejecting exam:', error)
      toast.error('Failed to reject exam')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exams Management</h2>
          <p className="text-muted-foreground">Review and approve exams submitted by teachers</p>
        </div>
        <button
          onClick={loadExams}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem.$id} value={classItem.$id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="submitted">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Exam Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Submitted Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{exam.title}</td>
                  <td className="px-4 py-3">{exam.subject}</td>
                  <td className="px-4 py-3">{exam.className}</td>
                  <td className="px-4 py-3">{exam.createdByName}</td>
                  <td className="px-4 py-3">
                    {new Date(exam.$createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedExam(exam)}
                        className="rounded-md border p-2 hover:bg-muted"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {exam.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleApprove(exam.$id)}
                            disabled={isProcessing}
                            className="rounded-md border bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(exam.$id)}
                            disabled={isProcessing}
                            className="rounded-md border bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {exam.fileUrl && (
                        <a
                          href={exam.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border p-2 hover:bg-muted"
                          title="Download"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredExams.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No exams found</p>
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Exam Details</h3>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Exam Title</label>
                <p className="text-sm">{selectedExam.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="text-sm">{selectedExam.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Class</label>
                <p className="text-sm">{selectedExam.className}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted by</label>
                <p className="text-sm">{selectedExam.createdByName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedExam.status)}`}>
                    {selectedExam.status.charAt(0).toUpperCase() + selectedExam.status.slice(1)}
                  </span>
                </p>
              </div>
              {selectedExam.fileName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File</label>
                  <div className="mt-2 flex items-center justify-between rounded-lg border bg-muted p-3">
                    <span className="text-sm">{selectedExam.fileName}</span>
                    {selectedExam.fileUrl && (
                      <a
                        href={selectedExam.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        <DownloadIcon className="h-4 w-4" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              )}
              {selectedExam.status === 'submitted' && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleApprove(selectedExam.$id)}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve Exam
                  </button>
                  <button
                    onClick={() => handleReject(selectedExam.$id)}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject Exam
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

