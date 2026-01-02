import { useState, useEffect } from "react"
import { EyeIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getApplications, updateApplicationStatus, type StaffApplication } from "@/lib/staffApplications"

export default function StaffApplicationsPage() {
  const [applications, setApplications] = useState<StaffApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<StaffApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<StaffApplication | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, statusFilter, positionFilter])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const apps = await getApplications()
      setApplications(apps)
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = [...applications]

    if (statusFilter !== "all") {
      filtered = filtered.filter(a => a.status === statusFilter)
    }

    if (positionFilter !== "all") {
      filtered = filtered.filter(a => 
        a.position.toLowerCase().includes(positionFilter.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }

  const handleApprove = async (applicationId: string) => {
    if (!confirm('Are you sure you want to approve this application?')) return

    setIsProcessing(true)
    try {
      await updateApplicationStatus(applicationId, 'approved')
      toast.success('Application approved successfully')
      loadApplications()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error approving application:', error)
      toast.error('Failed to approve application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (applicationId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return

    setIsProcessing(true)
    try {
      await updateApplicationStatus(applicationId, 'rejected')
      toast.success('Application rejected')
      loadApplications()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast.error('Failed to reject application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScheduleInterview = async (applicationId: string) => {
    setIsProcessing(true)
    try {
      await updateApplicationStatus(applicationId, 'interview-scheduled')
      toast.success('Interview scheduled. Applicant will be notified.')
      loadApplications()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast.error('Failed to schedule interview')
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
      case 'interview-scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const uniquePositions = Array.from(new Set(applications.map(a => a.position)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Staff Applications</h2>
        <p className="text-muted-foreground">Review and process staff job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="pending">Pending Review</option>
            <option value="all">All Applications</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="interview-scheduled">Interview Scheduled</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Position</label>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Positions</option>
            {uniquePositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Applicant Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Qualification</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Experience</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Applied Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">{app.applicantName}</td>
                  <td className="px-4 py-3">{app.position}</td>
                  <td className="px-4 py-3">{app.qualification}</td>
                  <td className="px-4 py-3">{app.experience} years</td>
                  <td className="px-4 py-3">
                    {new Date(app.$createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="rounded-md border p-2 hover:bg-muted"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(app.$id)}
                            disabled={isProcessing}
                            className="rounded-md border bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(app.$id)}
                            disabled={isProcessing}
                            className="rounded-md border bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleScheduleInterview(app.$id)}
                            disabled={isProcessing}
                            className="rounded-md border bg-blue-50 p-2 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            title="Schedule Interview"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredApplications.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No applications found</p>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Applicant Name</label>
                <p className="text-sm">{selectedApplication.applicantName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Position Applied</label>
                <p className="text-sm">{selectedApplication.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Qualification</label>
                <p className="text-sm">{selectedApplication.qualification}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <p className="text-sm">{selectedApplication.experience} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Information</label>
                <div className="mt-2 rounded-lg border bg-muted p-3">
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </p>
              </div>
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleApprove(selectedApplication.$id)}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve Application
                  </button>
                  <button
                    onClick={() => handleReject(selectedApplication.$id)}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleScheduleInterview(selectedApplication.$id)}
                    disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Schedule Interview
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

