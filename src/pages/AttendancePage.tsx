import { CheckCircle2Icon, XCircleIcon } from "lucide-react"

const attendanceData = [
  { date: "2025-10-30", present: 245, absent: 12, total: 257 },
  { date: "2025-10-29", present: 251, absent: 6, total: 257 },
  { date: "2025-10-28", present: 248, absent: 9, total: 257 },
  { date: "2025-10-27", present: 253, absent: 4, total: 257 },
]

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground">
          Track daily student attendance records
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Today's Attendance</p>
          <p className="mt-2 text-4xl font-bold">95%</p>
          <div className="mt-2 text-xs text-muted-foreground">
            245 out of 257 students present
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="mt-2 text-4xl font-bold">96%</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Average attendance rate
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="mt-2 text-4xl font-bold">94%</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Monthly average
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Absent Today</p>
          <p className="mt-2 text-4xl font-bold">12</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Students absent
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-6">
          <h3 className="text-lg font-semibold">Recent Attendance Records</h3>
          <p className="text-sm text-muted-foreground">Daily attendance summary for the past week</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {attendanceData.map((record) => (
              <div key={record.date} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Present: {record.present}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                      <span className="text-muted-foreground">Absent: {record.absent}</span>
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  record.absent <= 5 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-destructive text-destructive-foreground'
                }`}>
                  {((record.present / record.total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
