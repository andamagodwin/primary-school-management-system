import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  CalculatorIcon, 
  BookOpenIcon, 
  BoxesIcon, 
  UserCheckIcon,
  BellIcon,
  ClockIcon,
  EyeIcon
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { getInventoryItems } from "@/lib/inventory"
import { getBorrowingRecords } from "@/lib/library"
import { getFeePayments } from "@/lib/payments"
import { getBankNotifications } from "@/lib/bankNotifications"

export default function BursarDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    pendingPayments: 0,
    overdueBooks: 0,
    lowStock: 0,
    absentStaff: 0,
  })
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [upcomingReturns, setUpcomingReturns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Get pending payments
      const payments = await getFeePayments({ status: 'partial' })
      setStats(prev => ({ ...prev, pendingPayments: payments.length }))
      
      // Get overdue books
      const borrowingRecords = await getBorrowingRecords({ status: 'overdue' })
      setStats(prev => ({ ...prev, overdueBooks: borrowingRecords.length }))
      
      // Get low stock items
      const inventory = await getInventoryItems({ status: 'low' })
      setStats(prev => ({ ...prev, lowStock: inventory.length }))
      
      // Get recent bank notifications
      const notifications = await getBankNotifications({ status: 'pending' })
      setRecentNotifications(notifications.slice(0, 5))
      
      // Get upcoming returns
      const borrowed = await getBorrowingRecords({ status: 'borrowed' })
      setUpcomingReturns(borrowed.slice(0, 5))
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bursar Management Portal</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || 'Bursar'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-3xl font-bold">{stats.pendingPayments}</p>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CalculatorIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue Library Books</p>
              <p className="text-3xl font-bold">{stats.overdueBooks}</p>
              <p className="text-xs text-muted-foreground mt-1">Send reminders</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-3xl font-bold">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <BoxesIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 border-t-4 border-t-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Staff Absent Today</p>
              <p className="text-3xl font-bold">{stats.absentStaff}</p>
              <p className="text-xs text-muted-foreground mt-1">Attendance monitoring</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <UserCheckIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payment Notifications */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Recent Payment Notifications
          </h3>
          <button
            onClick={() => navigate('/bursar/payments')}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentNotifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent notifications</p>
          ) : (
            recentNotifications.map((notif) => (
              <div key={notif.$id} className="p-4 rounded-md bg-muted/50 border-l-4 border-l-green-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notif.message}</p>
                    {notif.studentName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Student: {notif.studentName} | Amount: UGX {notif.amount?.toLocaleString() || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.notificationDate).toLocaleDateString()}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                      notif.status === 'processed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {notif.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Library Returns */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Upcoming Library Returns
          </h3>
          <button
            onClick={() => navigate('/bursar/library')}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>
        <div className="space-y-3">
          {upcomingReturns.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming returns</p>
          ) : (
            upcomingReturns.map((record) => (
              <div key={record.$id} className="p-4 rounded-md border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.bookTitle}</p>
                    <p className="text-sm text-muted-foreground">Borrower: {record.borrowerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                    <button className="mt-2 px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs hover:bg-yellow-200">
                      Remind
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

