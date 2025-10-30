import * as React from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardListIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"

interface SidebarProps {
  activePage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    page: "dashboard",
  },
  {
    title: "Students",
    icon: UsersIcon,
    page: "students",
  },
  {
    title: "Teachers",
    icon: UsersIcon,
    page: "teachers",
  },
  {
    title: "Classes",
    icon: BookOpenIcon,
    page: "classes",
  },
  {
    title: "Attendance",
    icon: ClipboardListIcon,
    page: "attendance",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    page: "settings",
  },
]

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

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
              const isActive = activePage === item.page
              
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    onPageChange(item.page)
                    setIsMobileOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                A
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@school.edu</p>
              </div>
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
