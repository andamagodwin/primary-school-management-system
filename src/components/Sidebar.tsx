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
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"

interface User {
  $id: string
  userId: string
  email: string
  fullName: string
  userType: "admin" | "teacher" | "staff" | "parent"
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

const menuItems = [
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
            {menuItems.map((item) => {
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
