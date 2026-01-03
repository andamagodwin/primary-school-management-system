import { useState, useEffect } from "react"
import { RefreshCwIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, BellIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getFeePayments, getPaymentSummary, createFeePayment, updateFeePayment, type FeePayment } from "@/lib/payments"
import { getBankNotifications, processNotification, ignoreNotification, type BankNotification } from "@/lib/bankNotifications"

export default function BursarPaymentsPage() {
  const user = useAuthStore((state) => state.user)
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [notifications, setNotifications] = useState<BankNotification[]>([])
  const [summary, setSummary] = useState({ totalCollected: 0, totalDue: 0, pendingCount: 0, collectionRate: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [paymentsData, notificationsData, summaryData] = await Promise.all([
        getFeePayments(),
        getBankNotifications({ status: 'pending' }),
        getPaymentSummary()
      ])
      setPayments(paymentsData)
      setNotifications(notificationsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading payments data:', error)
      toast.error('Failed to load payments data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessNotification = async (id: string) => {
    try {
      await processNotification(id, user?.userId || "")
      toast.success('Notification processed')
      loadData()
    } catch (error) {
      console.error('Error processing notification:', error)
      toast.error('Failed to process notification')
    }
  }

  const handleIgnoreNotification = async (id: string) => {
    try {
      await ignoreNotification(id, user?.userId || "")
      toast.success('Notification ignored')
      loadData()
    } catch (error) {
      console.error('Error ignoring notification:', error)
      toast.error('Failed to ignore notification')
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
          <h2 className="text-3xl font-bold tracking-tight">Fee Payments & Bank Notifications</h2>
          <p className="text-muted-foreground">Manage student fee payments and bank transactions</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Sync Bank Updates
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Collected (Term 3)</p>
              <p className="text-3xl font-bold">UGX {(summary.totalCollected / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground mt-1">{summary.collectionRate.toFixed(0)}% collection rate</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Fee Payments</p>
              <p className="text-3xl font-bold">{summary.pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Balance reminders required</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <BellIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Notifications */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Notifications</h3>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending notifications</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.$id} className={`p-4 rounded-md border-l-4 ${
                notif.type === 'balance' ? 'border-l-yellow-600 bg-yellow-50' : 'border-l-green-600 bg-green-50'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{notif.message}</p>
                    {notif.studentName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Student: {notif.studentName} | Amount: UGX {notif.amount?.toLocaleString() || 'N/A'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.notificationDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcessNotification(notif.$id)}
                      className="px-3 py-1 rounded-md bg-green-100 text-green-800 text-sm hover:bg-green-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Process
                    </button>
                    <button
                      onClick={() => handleIgnoreNotification(notif.$id)}
                      className="px-3 py-1 rounded-md bg-red-100 text-red-800 text-sm hover:bg-red-200"
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-1" />
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Payment Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Term</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount Due</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount Paid</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{payment.studentName}</td>
                  <td className="px-4 py-3 text-sm">{payment.className}</td>
                  <td className="px-4 py-3 text-sm">{payment.term}</td>
                  <td className="px-4 py-3 text-sm">UGX {payment.amountDue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">UGX {payment.amountPaid.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${
                    payment.balance > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    UGX {payment.balance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{payment.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {payment.balance > 0 && (
                      <button className="px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs hover:bg-yellow-200">
                        <BellIcon className="h-3 w-3 inline mr-1" />
                        Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

