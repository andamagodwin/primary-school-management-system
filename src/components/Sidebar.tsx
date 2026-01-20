import * as React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardListIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  CalendarIcon,
  FileTextIcon,
  MessageSquareIcon,
  UserCogIcon,
  DollarSignIcon,
  UserPlusIcon,
  GraduationCapIcon,
  CalculatorIcon,
  CrownIcon,
  LaptopIcon,
  HistoryIcon,
  BoxesIcon,
  CreditCardIcon,
  UserCheckIcon,
  ServerIcon,
  DatabaseIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"

interface User {
  $id: string
  userId: string
  email: string
  fullName: string
  userType: "admin" | "teacher" | "staff" | "parent" | "headteacher" | "director" | "schoolDirector" | "bursar" | "it"
  phoneNumber?: string
  status: "active" | "inactive" | "suspended"
  avatar?: string
  employeeId?: string
  dateJoined: string
  lastLogin?: string
}

interface SidebarProps {
  user: User | null
}

// Menu items for regular users
const regularMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/dashboard",
  },
  {
    title: "Students",
    icon: UsersIcon,
    path: "/students",
  },
  {
    title: "Teachers",
    icon: UsersIcon,
    path: "/teachers",
  },
  {
    title: "Classes",
    icon: BookOpenIcon,
    path: "/classes",
  },
  {
    title: "Attendance",
    icon: ClipboardListIcon,
    path: "/attendance",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for headteacher
const headteacherMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/headteacher/dashboard",
  },
  {
    title: "School Events",
    icon: CalendarIcon,
    path: "/events",
  },
  {
    title: "Staff Management",
    icon: UserCogIcon,
    path: "/staff-management",
  },
  {
    title: "School Reports",
    icon: FileTextIcon,
    path: "/reports",
  },
  {
    title: "UNEB Communications",
    icon: MessageSquareIcon,
    path: "/uneb-communications",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for teachers
const teacherMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/dashboard",
  },
  {
    title: "Enter Marks",
    icon: ClipboardListIcon,
    path: "/marks",
  },
  {
    title: "Upload Exams",
    icon: BookOpenIcon,
    path: "/exams",
  },
  {
    title: "Attendance",
    icon: CalendarIcon,
    path: "/attendance",
  },
  {
    title: "Lesson Plans",
    icon: BookOpenIcon,
    path: "/lesson-plans",
  },
  {
    title: "My Students",
    icon: UsersIcon,
    path: "/my-students",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for Director of Studies
const dosMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/dashboard",
  },
  {
    title: "Exams Management",
    icon: FileTextIcon,
    path: "/dos/exams",
  },
  {
    title: "Student Results",
    icon: ClipboardListIcon,
    path: "/dos/results",
  },
  {
    title: "Attendance Overview",
    icon: CalendarIcon,
    path: "/dos/attendance",
  },
  {
    title: "Staff Applications",
    icon: UserCogIcon,
    path: "/dos/applications",
  },
  {
    title: "Sports & Events",
    icon: CalendarIcon,
    path: "/dos/sports-events",
  },
  {
    title: "Report Comments",
    icon: MessageSquareIcon,
    path: "/dos/report-comments",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for IT Administrator
const itMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/it/dashboard",
  },
  {
    title: "User Management",
    icon: UsersIcon,
    path: "/it/users",
  },
  {
    title: "Teacher Accounts",
    icon: GraduationCapIcon,
    path: "/it/teachers",
  },
  {
    title: "Student Accounts",
    icon: UserIcon,
    path: "/it/students",
  },
  {
    title: "System Health",
    icon: ServerIcon,
    path: "/it/system",
  },
  {
    title: "Audit Logs",
    icon: HistoryIcon,
    path: "/it/audit",
  },
  {
    title: "Backup & Recovery",
    icon: DatabaseIcon,
    path: "/it/backup",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for Bursar
const bursarMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/bursar/dashboard",
  },
  {
    title: "Inventory",
    icon: BoxesIcon,
    path: "/bursar/inventory",
  },
  {
    title: "Library",
    icon: BookOpenIcon,
    path: "/bursar/library",
  },
  {
    title: "Fee Payments",
    icon: CreditCardIcon,
    path: "/bursar/payments",
  },
  {
    title: "Staff Applications",
    icon: UserCogIcon,
    path: "/bursar/staff-applications",
  },
  {
    title: "Attendance",
    icon: ClipboardListIcon,
    path: "/bursar/attendance",
  },
  {
    title: "Student Dashboards",
    icon: UsersIcon,
    path: "/bursar/students",
  },
  {
    title: "Admin Access",
    icon: UserCheckIcon,
    path: "/bursar/admin-access",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

// Menu items for Director (School Director)
const directorMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/dashboard",
  },
  {
    title: "Financial Overview",
    icon: DollarSignIcon,
    path: "/director/financial",
  },
  {
    title: "Create Admin Accounts",
    icon: UserPlusIcon,
    path: "/director/create-accounts",
  },
  {
    title: "View DOS Portal",
    icon: GraduationCapIcon,
    path: "/director/view-dos",
  },
  {
    title: "View Bursar Portal",
    icon: CalculatorIcon,
    path: "/director/view-bursar",
  },
  {
    title: "View Head Teacher",
    icon: CrownIcon,
    path: "/director/view-headteacher",
  },
  {
    title: "View IT Portal",
    icon: LaptopIcon,
    path: "/director/view-it",
  },
  {
    title: "Audit Logs",
    icon: HistoryIcon,
    path: "/director/audit-logs",
  },
  {
    title: "Generate Reports",
    icon: FileTextIcon,
    path: "/director/reports",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
]

export function Sidebar({ user }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const logout = useAuthStore((state) => state.logout)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-primary p-2 text-primary-foreground lg:hidden"
      >
        {isMobileOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r bg-card transition-transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">School Management</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {(
              user?.userType === 'schoolDirector' || user?.userType === 'admin'
                ? directorMenuItems
                : user?.userType === 'director'
                ? dosMenuItems
                : user?.userType === 'headteacher' 
                ? headteacherMenuItems 
                : user?.userType === 'teacher'
                ? teacherMenuItems
                : user?.userType === 'bursar'
                ? bursarMenuItems
                : user?.userType === 'it'
                ? itMenuItems
                : regularMenuItems
            ).map((item) => {
              const Icon = item.icon
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
              <NavLink
                to="/profile"
                onClick={() => setIsMobileOpen(false)}
                className="flex flex-1 items-center gap-3 hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user?.fullName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{user?.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              </NavLink>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                title="Logout"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
