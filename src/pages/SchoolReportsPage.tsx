import { useState } from "react"
import { FileTextIcon, DownloadIcon, CalendarIcon, TrendingUpIcon } from "lucide-react"

export default function SchoolReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const reportTypes = [
    {
      id: "attendance",
      title: "Attendance Report",
      description: "View student and staff attendance statistics",
      icon: CalendarIcon,
    },
    {
      id: "academic",
      title: "Academic Performance",
      description: "Student grades, exam results, and academic progress",
      icon: TrendingUpIcon,
    },
    {
      id: "financial",
      title: "Financial Report",
      description: "School finances, fees, and budget analysis",
      icon: FileTextIcon,
    },
    {
      id: "enrollment",
      title: "Enrollment Report",
      description: "Student enrollment statistics by grade and class",
      icon: FileTextIcon,
    },
    {
      id: "staff",
      title: "Staff Report",
      description: "Staff performance, attendance, and evaluations",
      icon: FileTextIcon,
    },
    {
      id: "events",
      title: "Events Report",
      description: "Summary of school events and activities",
      icon: CalendarIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">School Reports</h2>
        <p className="text-muted-foreground">Generate and view comprehensive school reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`cursor-pointer rounded-lg border bg-card p-6 transition-colors hover:bg-muted ${
                selectedReport === report.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{report.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </div>
          )
        })}
      </div>

      {/* Report Filters and Actions */}
      {selectedReport && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {reportTypes.find((r) => r.id === selectedReport)?.title}
            </h3>
            <div className="flex gap-2">
              <select className="rounded-md border bg-background px-3 py-2 text-sm">
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>Custom Range</option>
              </select>
              <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <DownloadIcon className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="rounded-lg border bg-muted/50 p-8 text-center">
            <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Report preview will be displayed here. Select date range and click "Generate Report" to view data.
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Reports Generated</p>
          <p className="text-3xl font-bold">127</p>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Most Requested Report</p>
          <p className="text-lg font-semibold">Attendance Report</p>
          <p className="text-xs text-muted-foreground mt-2">45 times this month</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Last Generated</p>
          <p className="text-lg font-semibold">Academic Performance</p>
          <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
        </div>
      </div>
    </div>
  )
}

