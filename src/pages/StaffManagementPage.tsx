import { useState } from "react"
import { UsersIcon, UserPlusIcon, SearchIcon, MailIcon, PhoneIcon } from "lucide-react"

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage school staff members and their roles</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <UserPlusIcon className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search staff by name, role, or department..."
          className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Staff Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-3xl font-bold">45</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Teachers</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Support Staff</p>
              <p className="text-3xl font-bold">15</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Administrative</p>
              <p className="text-3xl font-bold">6</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Staff Members</h3>
          <div className="space-y-4">
            {/* Placeholder staff cards */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-lg font-medium">JD</span>
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">Mathematics Teacher</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MailIcon className="h-4 w-4" />
                  <span>john.doe@school.edu</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneIcon className="h-4 w-4" />
                  <span>+256 700 000 000</span>
                </div>
                <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

