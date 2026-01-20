import { useEffect, useMemo, useState } from "react"
import { UsersIcon, UserPlusIcon, SearchIcon, MailIcon, PhoneIcon, XIcon } from "lucide-react"
import { getAllUsers, type SystemUser, createStaff, type CreateSystemUserInput } from "@/lib/userManagement"
import { toast } from "sonner"

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add Staff modal state
  const [openAdd, setOpenAdd] = useState(false)
  const [form, setForm] = useState<CreateSystemUserInput>({
    fullName: "",
    email: "",
    phoneNumber: "",
    userType: "staff",
    status: "active",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllUsers()
      setUsers(data)
    } catch (e: any) {
      console.error("Failed to load staff:", e)
      setError(e?.message || "Failed to load staff")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!searchQuery) return users
    const q = searchQuery.toLowerCase()
    return users.filter(u =>
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.userType || "").toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const totals = useMemo(() => {
    const total = users.length
    const teachers = users.filter(u => u.userType === 'teacher').length
    const support = users.filter(u => u.userType === 'staff').length
    const adminRoles = ['admin','headteacher','director','schoolDirector','bursar','it']
    const admin = users.filter(u => adminRoles.includes(u.userType)).length
    return { total, teachers, support, admin }
  }, [users])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (!form.fullName || !form.email) {
        toast.error("Full name and email are required")
        return
      }
      const created = await createStaff(form)
      toast.success(`Staff member ${created.fullName} created`)
      setOpenAdd(false)
      setForm({ fullName: "", email: "", phoneNumber: "", userType: "staff", status: "active" })
      await load()
    } catch (e: any) {
      console.error('Create staff failed:', e)
      toast.error(e?.message || "Failed to create staff member")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage school staff members and their roles</p>
        </div>
        <button onClick={() => setOpenAdd(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <UserPlusIcon className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Staff Member</h3>
              <button className="p-1 rounded hover:bg-muted" onClick={() => setOpenAdd(false)}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.fullName} onChange={(e)=>setForm(prev=>({...prev, fullName: e.target.value}))} required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input type="email" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.email} onChange={(e)=>setForm(prev=>({...prev, email: e.target.value}))} required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone Number</label>
                  <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.phoneNumber || ""} onChange={(e)=>setForm(prev=>({...prev, phoneNumber: e.target.value}))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">User Type</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.userType} onChange={(e)=>setForm(prev=>({...prev, userType: e.target.value as CreateSystemUserInput["userType"]}))}>
                    <option value="staff">Support Staff</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                    <option value="headteacher">Head Teacher</option>
                    <option value="bursar">Bursar</option>
                    <option value="it">IT</option>
                    <option value="director">Director of Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={form.status} onChange={(e)=>setForm(prev=>({...prev, status: e.target.value as NonNullable<CreateSystemUserInput["status"]>}))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={()=>setOpenAdd(false)}>Cancel</button>
                <button disabled={submitting} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
                  {submitting ? 'Adding…' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <p className="text-3xl font-bold">{totals.total}</p>
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
              <p className="text-3xl font-bold">{totals.teachers}</p>
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
              <p className="text-3xl font-bold">{totals.support}</p>
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
              <p className="text-3xl font-bold">{totals.admin}</p>
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
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading staff…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error} <button className="ml-2 underline" onClick={load}>Retry</button></div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No staff match your search.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((u) => {
                const initials = (u.fullName || '?')
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .slice(0,2)
                  .toUpperCase()
                return (
                  <div key={u.$id || u.userId} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-lg font-medium">{initials}</span>
                      </div>
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-sm text-muted-foreground capitalize">{u.userType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[180px]">
                        <MailIcon className="h-4 w-4" />
                        <span className="truncate" title={u.email}>{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[140px]">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{u.phoneNumber || '-'}</span>
                      </div>
                      <span className="text-xs rounded-full border px-2 py-1 capitalize">{u.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

