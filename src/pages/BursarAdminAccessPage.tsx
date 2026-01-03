import { useState, useEffect } from "react"
import { GraduationCapIcon, CrownIcon, ChartBarIcon, Loader2Icon } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function BursarAdminAccessPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    academicPerformance: 87,
    ministryUpdates: 3,
    unebCandidates: 42,
  })

  const accessDOSPortal = () => {
    navigate('/dos/exams')
  }

  const accessHeadTeacherPortal = () => {
    navigate('/events')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Access DOS & Head Teacher Information</h2>
          <p className="text-muted-foreground">View information from other administrative portals</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accessDOSPortal}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <GraduationCapIcon className="h-4 w-4" />
            DOS Portal View
          </button>
          <button
            onClick={accessHeadTeacherPortal}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <CrownIcon className="h-4 w-4" />
            Head Teacher View
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Academic Performance</p>
              <p className="text-3xl font-bold">{stats.academicPerformance}%</p>
              <p className="text-xs text-muted-foreground mt-1">Term 3 Average</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ministry Updates</p>
              <p className="text-3xl font-bold">{stats.ministryUpdates}</p>
              <p className="text-xs text-muted-foreground mt-1">Require action</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <CrownIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">UNEB Candidates</p>
              <p className="text-3xl font-bold">{stats.unebCandidates}</p>
              <p className="text-xs text-muted-foreground mt-1">Registered for PLE</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <GraduationCapIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Data Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Teacher Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Teacher</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Performance</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Attendance</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Reports Submitted</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">Sample Teacher</td>
                <td className="px-4 py-3 text-sm">P2</td>
                <td className="px-4 py-3 text-sm">English</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-600 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <span>87%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">95%</td>
                <td className="px-4 py-3 text-sm">3/3</td>
                <td className="px-4 py-3 text-sm">
                  <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                    View Analytics
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

