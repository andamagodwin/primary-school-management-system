import { useState, useEffect } from "react"
import { EyeIcon, RefreshCwIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getExams } from "@/lib/exams"
import { getApplications } from "@/lib/staffApplications"

interface ViewPortalsPageProps {
  portalType: 'dos' | 'bursar' | 'headteacher' | 'it'
}

export default function ViewPortalsPage({ portalType }: ViewPortalsPageProps) {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState({
    stat1: 0,
    stat2: 0,
    stat3: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPortalData()
  }, [portalType])

  const loadPortalData = async () => {
    try {
      setIsLoading(true)
      
      switch (portalType) {
        case 'dos':
          const exams = await getExams({ status: 'submitted' })
          setData(exams)
          setStats({
            stat1: exams.length,
            stat2: 0, // Would get from students
            stat3: 0, // Would get from applications
          })
          break
        case 'bursar':
          // Placeholder for bursar data
          setData([])
          setStats({ stat1: 0, stat2: 0, stat3: 0 })
          break
        case 'headteacher':
          // Placeholder for headteacher data
          setData([])
          setStats({ stat1: 0, stat2: 0, stat3: 0 })
          break
        case 'it':
          // Placeholder for IT data
          setData([])
          setStats({ stat1: 0, stat2: 0, stat3: 0 })
          break
      }
    } catch (error) {
      console.error('Error loading portal data:', error)
      toast.error('Failed to load portal data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPortalInfo = () => {
    const portals: Record<string, { title: string; currentUser: string; description: string }> = {
      dos: {
        title: 'Director of Studies Portal (View Only)',
        currentUser: 'Dr. Michael Kato',
        description: 'You are viewing the DOS portal in read-only mode. You cannot make any changes to the data.',
      },
      bursar: {
        title: 'Bursar Portal (View Only)',
        currentUser: 'Mr. John Okello',
        description: 'You are viewing the Bursar portal in read-only mode. You cannot make any changes to the data.',
      },
      headteacher: {
        title: 'Head Teacher Portal (View Only)',
        currentUser: 'Mrs. Sarah Johnson',
        description: 'You are viewing the Head Teacher portal in read-only mode. You cannot make any changes to the data.',
      },
      it: {
        title: 'IT Administrator Portal (View Only)',
        currentUser: 'Mr. David Tech',
        description: 'You are viewing the IT Administrator portal in read-only mode. You cannot make any changes to the data.',
      },
    }
    return portals[portalType] || portals.dos
  }

  const portalInfo = getPortalInfo()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{portalInfo.title}</h2>
          <p className="text-muted-foreground">{portalInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            <EyeIcon className="mr-1 inline h-4 w-4" />
            View Only Access
          </span>
          <button
            onClick={loadPortalData}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-muted p-4">
        <h4 className="mb-1 font-semibold text-primary">Current {portalType === 'dos' ? 'DOS' : portalType === 'it' ? 'IT Admin' : portalType.charAt(0).toUpperCase() + portalType.slice(1)}: {portalInfo.currentUser}</h4>
        <p className="text-sm text-muted-foreground">{portalInfo.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-3xl font-bold">{stats.stat1}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {portalType === 'dos' ? 'Pending Exams Review' : 'Pending Items'}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-3xl font-bold">{stats.stat2}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {portalType === 'dos' ? 'Total Students' : 'Active Items'}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-3xl font-bold">{stats.stat3}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {portalType === 'dos' ? 'Pending Applications' : 'Other Items'}
          </div>
        </div>
      </div>

      {/* Data Table */}
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
                  {portalType === 'dos' && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Exam Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Submitted Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">View</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {portalType === 'dos' && data.map((exam: any) => (
                  <tr key={exam.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{exam.title}</td>
                    <td className="px-4 py-3">{exam.className}</td>
                    <td className="px-4 py-3">{exam.createdByName}</td>
                    <td className="px-4 py-3">
                      {new Date(exam.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        exam.status === 'approved' ? 'bg-green-100 text-green-800' :
                        exam.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                        <EyeIcon className="mr-1 inline h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No data available for this portal</p>
        </div>
      )}
    </div>
  )
}


