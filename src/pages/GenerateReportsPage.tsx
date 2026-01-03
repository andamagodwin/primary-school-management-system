import { useState, useEffect } from "react"
import { FileTextIcon, DownloadIcon, EyeIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getReports, createReport, type GeneratedReport } from "@/lib/reports"
import { useAuthStore } from "@/store/authStore"

export default function GenerateReportsPage() {
  const user = useAuthStore((state) => state.user)
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const allReports = await getReports()
      setReports(allReports)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async (reportType: 'financial' | 'academic' | 'staff' | 'audit') => {
    setIsGenerating(reportType)
    try {
      const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`
      
      // In a real implementation, this would generate the actual PDF
      // For now, we'll just create a record
      await createReport({
        reportName,
        reportType,
        parameters: JSON.stringify({
          generatedAt: new Date().toISOString(),
          generatedBy: user?.fullName,
        }),
      })

      toast.success(`${reportName} generated successfully`)
      loadReports()
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(null)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const reportTypes = [
    {
      type: 'financial' as const,
      title: 'Financial Report',
      description: 'Complete financial overview with revenue, expenses, and projections',
      icon: 'chart-line',
      color: 'blue',
    },
    {
      type: 'academic' as const,
      title: 'Academic Performance Report',
      description: 'Student results, teacher performance, and academic statistics',
      icon: 'graduation-cap',
      color: 'green',
    },
    {
      type: 'staff' as const,
      title: 'Staff Management Report',
      description: 'Staff attendance, performance, and payroll overview',
      icon: 'users',
      color: 'yellow',
    },
    {
      type: 'audit' as const,
      title: 'System Audit Report',
      description: 'Complete system access logs and administrator activities',
      icon: 'shield-alt',
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Generate Comprehensive Reports</h2>
        <p className="text-muted-foreground">Create and download detailed reports for various aspects of the school</p>
      </div>

      {/* Report Generation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => (
          <div key={report.type} className="rounded-lg border-l-4 border-l-primary bg-card p-6">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-${report.color}-100`}>
              <FileTextIcon className={`h-6 w-6 text-${report.color}-600`} />
            </div>
            <h4 className="mb-2 font-semibold">{report.title}</h4>
            <p className="mb-4 text-sm text-muted-foreground">{report.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleGenerateReport(report.type)}
                disabled={isGenerating === report.type}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating === report.type ? (
                  <>
                    <Loader2Icon className="mr-1 inline h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-1 inline h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </button>
              <button className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Generated Reports */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Recently Generated Reports</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Report Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Generated By</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date Generated</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{report.reportName}</td>
                    <td className="px-4 py-3">{report.generatedByName}</td>
                    <td className="px-4 py-3">
                      {new Date(report.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{formatFileSize(report.fileSize)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {report.fileUrl && (
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border bg-green-50 px-3 py-1 text-sm text-green-700 hover:bg-green-100"
                          >
                            <DownloadIcon className="mr-1 inline h-4 w-4" />
                            Download
                          </a>
                        )}
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          Preview
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reports.length === 0 && !isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            No reports generated yet. Generate your first report above.
          </div>
        )}
      </div>
    </div>
  )
}


