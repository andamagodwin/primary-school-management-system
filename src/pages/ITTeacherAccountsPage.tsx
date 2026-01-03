import { useState, useEffect } from "react"
import { PlusIcon, EyeIcon, EditIcon, TrashIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getTeachers, type Teacher } from "@/lib/teachers"
import { getUserPermissions, updateUserPermissions, createUserPermissions, type UserPermission } from "@/lib/userPermissions"

export default function ITTeacherAccountsPage() {
  const user = useAuthStore((state) => state.user)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [activeTab, setActiveTab] = useState<"list" | "permissions" | "bulk">("list")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [permissions, setPermissions] = useState<UserPermission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [classFilter, setClassFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  
  const [permissionData, setPermissionData] = useState({
    canEnterMarks: true,
    canRecordAttendance: true,
    canUploadExams: false,
    canUploadLessonPlans: true,
    canGenerateReports: false,
    portalAccess: 'full' as 'full' | 'limited' | 'marks_only',
  })

  useEffect(() => {
    loadTeachers()
  }, [])

  useEffect(() => {
    filterTeachers()
  }, [teachers, classFilter, subjectFilter])

  useEffect(() => {
    if (selectedTeacher && activeTab === 'permissions') {
      loadTeacherPermissions()
    }
  }, [selectedTeacher, activeTab])

  const loadTeachers = async () => {
    try {
      setIsLoading(true)
      const teachersData = await getTeachers()
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error loading teachers:', error)
      toast.error('Failed to load teachers')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeacherPermissions = async () => {
    try {
      const perm = await getUserPermissions(selectedTeacher)
      if (perm) {
        setPermissions(perm)
        setPermissionData({
          canEnterMarks: perm.canEnterMarks,
          canRecordAttendance: perm.canRecordAttendance,
          canUploadExams: perm.canUploadExams,
          canUploadLessonPlans: perm.canUploadLessonPlans,
          canGenerateReports: perm.canGenerateReports,
          portalAccess: perm.portalAccess,
        })
      } else {
        setPermissions(null)
        // Set defaults
        setPermissionData({
          canEnterMarks: true,
          canRecordAttendance: true,
          canUploadExams: false,
          canUploadLessonPlans: true,
          canGenerateReports: false,
          portalAccess: 'full',
        })
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  const filterTeachers = () => {
    let filtered = [...teachers]
    if (classFilter !== "all") {
      filtered = filtered.filter(t => t.classId?.toLowerCase().includes(classFilter.toLowerCase()))
    }
    if (subjectFilter !== "all") {
      filtered = filtered.filter(t => t.subjects?.some(s => s.toLowerCase().includes(subjectFilter.toLowerCase())))
    }
    setFilteredTeachers(filtered)
  }

  const handleSavePermissions = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher first')
      return
    }
    
    try {
      if (permissions) {
        await updateUserPermissions(selectedTeacher, {
          ...permissionData,
          updatedBy: user?.userId || "",
        })
      } else {
        const teacher = teachers.find(t => t.userId === selectedTeacher)
        await createUserPermissions({
          userId: selectedTeacher,
          userType: 'teacher',
          ...permissionData,
          updatedBy: user?.userId || "",
        })
      }
      toast.success('Teacher permissions saved successfully')
      loadTeacherPermissions()
    } catch (error) {
      console.error('Error saving permissions:', error)
      toast.error('Failed to save permissions')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teacher Account Management</h2>
          <p className="text-muted-foreground">Manage teacher accounts and permissions</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          New Teacher
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 font-medium ${
            activeTab === "list"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Teachers
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 font-medium ${
            activeTab === "permissions"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Permissions
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 font-medium ${
            activeTab === "bulk"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Bulk Operations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <>
          <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Classes</option>
                <option value="p1">Primary One</option>
                <option value="p2">Primary Two</option>
                <option value="p3">Primary Three</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Subjects</option>
                <option value="english">English</option>
                <option value="mathematics">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Teacher Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Teacher ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Class Assigned</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Subjects</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Account Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.$id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{teacher.fullName}</td>
                      <td className="px-4 py-3 text-sm">{teacher.teacherId}</td>
                      <td className="px-4 py-3 text-sm">{teacher.classId || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{teacher.subjects?.join(', ') || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          teacher.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button className="p-1 rounded hover:bg-muted">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted">
                            <EditIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "permissions" && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a teacher...</option>
              {teachers.map((t) => (
                <option key={t.$id} value={t.userId}>
                  {t.fullName} ({t.teacherId})
                </option>
              ))}
            </select>
          </div>

          {selectedTeacher && (
            <>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Portal Permissions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissionData.canEnterMarks}
                      onChange={(e) => setPermissionData({ ...permissionData, canEnterMarks: e.target.checked })}
                      className="rounded"
                    />
                    <span>Enter Marks</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissionData.canRecordAttendance}
                      onChange={(e) => setPermissionData({ ...permissionData, canRecordAttendance: e.target.checked })}
                      className="rounded"
                    />
                    <span>Record Attendance</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissionData.canUploadExams}
                      onChange={(e) => setPermissionData({ ...permissionData, canUploadExams: e.target.checked })}
                      className="rounded"
                    />
                    <span>Upload Exams</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissionData.canUploadLessonPlans}
                      onChange={(e) => setPermissionData({ ...permissionData, canUploadLessonPlans: e.target.checked })}
                      className="rounded"
                    />
                    <span>Upload Lesson Plans</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissionData.canGenerateReports}
                      onChange={(e) => setPermissionData({ ...permissionData, canGenerateReports: e.target.checked })}
                      className="rounded"
                    />
                    <span>Generate Reports</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Portal Access Level</label>
                <select
                  value={permissionData.portalAccess}
                  onChange={(e) => setPermissionData({ ...permissionData, portalAccess: e.target.value as any })}
                  className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="full">Full Access</option>
                  <option value="limited">Limited Access</option>
                  <option value="marks_only">Marks Entry Only</option>
                </select>
              </div>

              <button
                onClick={handleSavePermissions}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <SaveIcon className="h-4 w-4" />
                Save Permissions
              </button>
            </>
          )}
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Bulk Upload Teachers (CSV Format)</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50">
              <p className="text-muted-foreground">Click to browse or drag & drop CSV file</p>
              <input type="file" accept=".csv" className="hidden" />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Action</label>
            <select className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm">
              <option value="create">Create New Accounts</option>
              <option value="update">Update Existing Accounts</option>
              <option value="deactivate">Deactivate Accounts</option>
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Process Bulk Operation
          </button>
        </div>
      )}
    </div>
  )
}

