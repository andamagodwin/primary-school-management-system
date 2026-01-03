import { useState, useEffect } from "react"
import { UserPlusIcon, KeyIcon, CopyIcon, EyeIcon, BanIcon, RefreshCwIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { ID } from "appwrite"
import { account, databases, DATABASE_ID, USERS_TABLE_ID } from "@/lib/appwrite"
import { useAuthStore } from "@/store/authStore"
import { createAuditLog } from "@/lib/auditLogs"

export default function CreateAdminAccountsPage() {
  const user = useAuthStore((state) => state.user)
  const [adminType, setAdminType] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
  })
  const [password, setPassword] = useState("")
  const [accessExpiry, setAccessExpiry] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingAccounts, setExistingAccounts] = useState<any[]>([])

  useEffect(() => {
    loadExistingAccounts()
  }, [])

  const loadExistingAccounts = async () => {
    try {
      const adminTypes = ['headteacher', 'dos', 'director', 'bursar', 'it']
      const allUsers = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
      const adminAccounts = allUsers.documents.filter((u: any) => 
        adminTypes.includes(u.userType)
      )
      setExistingAccounts(adminAccounts)
    } catch (error) {
      console.error('Error loading existing accounts:', error)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let newPassword = ''
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(newPassword)
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      toast.success('Password copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy password')
    }
  }

  const getPositionName = (type: string) => {
    const positions: Record<string, string> = {
      headteacher: 'Head Teacher',
      dos: 'Director of Studies',
      director: 'Director',
      bursar: 'Bursar',
      it: 'IT Administrator',
    }
    return positions[type] || type
  }

  const getPermissionsForType = (type: string) => {
    const permissions: Record<string, Array<{ id: string; name: string; description: string }>> = {
      headteacher: [
        { id: 'ht1', name: 'Full School Management', description: 'Overall school operations' },
        { id: 'ht2', name: 'Staff Supervision', description: 'Manage teaching and non-teaching staff' },
        { id: 'ht3', name: 'Academic Oversight', description: 'Monitor academic performance' },
        { id: 'ht4', name: 'Report Generation', description: 'Generate school reports' },
      ],
      dos: [
        { id: 'dos1', name: 'Academic Management', description: 'Curriculum and syllabus oversight' },
        { id: 'dos2', name: 'Exams Management', description: 'Create and manage examinations' },
        { id: 'dos3', name: 'Student Results', description: 'Process and analyze results' },
        { id: 'dos4', name: 'Teacher Evaluation', description: 'Evaluate teacher performance' },
      ],
      bursar: [
        { id: 'bur1', name: 'Financial Management', description: 'Manage all financial transactions' },
        { id: 'bur2', name: 'Fee Collection', description: 'Process student fee payments' },
        { id: 'bur3', name: 'Inventory Management', description: 'School supplies and equipment' },
        { id: 'bur4', name: 'Library Management', description: 'Book borrowing and returns' },
      ],
      it: [
        { id: 'it1', name: 'System Maintenance', description: 'Maintain school management system' },
        { id: 'it2', name: 'Technical Support', description: 'Support staff and students' },
        { id: 'it3', name: 'IT Inventory', description: 'Manage computers and devices' },
        { id: 'it4', name: 'Security Management', description: 'System security and access control' },
      ],
    }
    return permissions[type] || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adminType || !formData.name || !formData.email || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsSubmitting(true)
    try {
      // Create user account using Appwrite SDK
      const userId = ID.unique()
      const username = formData.username || `${adminType}_${Date.now()}`
      
      await account.create(userId, formData.email, password, formData.name)

      // Create user profile in users table
      await databases.createDocument(
        DATABASE_ID,
        USERS_TABLE_ID,
        ID.unique(),
        {
          userId,
          email: formData.email,
          fullName: formData.name,
          userType: adminType,
          phoneNumber: formData.phone || null,
          status: 'active',
          dateJoined: new Date().toISOString(),
          employeeId: username,
        }
      )

      // Log the account creation
      await createAuditLog({
        action: 'account_creation',
        details: `Created ${getPositionName(adminType)} account for ${formData.name}`,
        status: 'success',
      })

      toast.success(`${getPositionName(adminType)} account created successfully`)
      
      // Reset form
      setAdminType("")
      setFormData({ name: "", email: "", phone: "", username: "" })
      setPassword("")
      setAccessExpiry("")
      loadExistingAccounts()
    } catch (error: any) {
      console.error('Error creating account:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Administrator Accounts</h2>
        <p className="text-muted-foreground">Create accounts for headteacher, DOS, bursar, and IT administrators</p>
      </div>

      {/* Account Creation Form */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Create New Account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Select Administrator Type</label>
            <select
              value={adminType}
              onChange={(e) => setAdminType(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select Administrator Type</option>
              <option value="headteacher">Head Teacher</option>
              <option value="dos">Director of Studies (DOS)</option>
              <option value="bursar">Bursar</option>
              <option value="it">IT Administrator</option>
            </select>
          </div>

          {adminType && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username (auto-generated if left blank)"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Username will be auto-generated if left blank
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Permissions</label>
                <div className="rounded-lg border bg-muted p-4">
                  {getPermissionsForType(adminType).map((permission) => (
                    <div key={permission.id} className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked
                        disabled
                        className="rounded"
                      />
                      <label htmlFor={`perm-${permission.id}`} className="text-sm">
                        {permission.name}
                      </label>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {permission.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">Initial Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Click generate or enter custom password"
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                <KeyIcon className="mr-1 inline h-4 w-4" />
                Generate
              </button>
              <button
                type="button"
                onClick={copyPassword}
                className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                <CopyIcon className="mr-1 inline h-4 w-4" />
                Copy
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Access Expiry Date</label>
            <input
              type="date"
              value={accessExpiry}
              onChange={(e) => setAccessExpiry(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">Leave empty for no expiry</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminType("")
                setFormData({ name: "", email: "", phone: "", username: "" })
                setPassword("")
                setAccessExpiry("")
              }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Existing Accounts */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Existing Administrator Accounts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingAccounts.length > 0 ? (
                existingAccounts.map((account) => (
                  <tr key={account.$id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">{account.fullName}</td>
                    <td className="px-4 py-3">{getPositionName(account.userType)}</td>
                    <td className="px-4 py-3">{account.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          View
                        </button>
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <RefreshCwIcon className="mr-1 inline h-4 w-4" />
                          Reset Pass
                        </button>
                        <button className="rounded-md border bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100">
                          <BanIcon className="mr-1 inline h-4 w-4" />
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No administrator accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

