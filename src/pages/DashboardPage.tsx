import { TrendingUpIcon, TrendingDownIcon, UsersIcon, BookOpenIcon, CheckCircle2Icon, ClipboardListIcon } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Primary School Management System
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">257</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
            <span className="text-green-600">+2</span>
            <span className="text-muted-foreground">new this term</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <BookOpenIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <CheckCircle2Icon className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">All active</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold">95%</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <ClipboardListIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingDownIcon className="h-4 w-4 text-red-600" />
            <span className="text-red-600">-2%</span>
            <span className="text-muted-foreground">from last week</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">New student enrolled</p>
                <p className="text-xs text-muted-foreground">John Doe - Grade 5A</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Exam results uploaded</p>
                <p className="text-xs text-muted-foreground">Mathematics - Grade 4</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Parent meeting scheduled</p>
                <p className="text-xs text-muted-foreground">Tomorrow at 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Parent-Teacher Conference</p>
                <p className="text-xs text-muted-foreground">Nov 5, 2025 - 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Sports Day</p>
                <p className="text-xs text-muted-foreground">Nov 10, 2025 - All Day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Mid-Term Exams Begin</p>
                <p className="text-xs text-muted-foreground">Nov 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
