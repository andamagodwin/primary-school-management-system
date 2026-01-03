import { useState, useEffect } from "react"
import { DownloadIcon, TrendingUpIcon, TrendingDownIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react"
import { toast } from "sonner"
import { getFinancialData, getFinancialSummary, type FinancialData } from "@/lib/financial"

export default function FinancialOverviewPage() {
  const [financialData, setFinancialData] = useState<FinancialData[]>([])
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalBudget: 0,
    balance: 0,
    utilization: 0,
  })
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Term3")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFinancialData()
  }, [selectedPeriod, selectedYear])

  const loadFinancialData = async () => {
    try {
      setIsLoading(true)
      const [data, financialSummary] = await Promise.all([
        getFinancialData({ term: selectedPeriod, academicYear: selectedYear }),
        getFinancialSummary(selectedPeriod, selectedYear),
      ])
      setFinancialData(data)
      setSummary(financialSummary)
    } catch (error) {
      console.error('Error loading financial data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const getStatusColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600'
    if (utilization > 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusBadge = (utilization: number) => {
    if (utilization > 100) return 'bg-red-100 text-red-800'
    if (utilization > 90) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (utilization: number) => {
    if (utilization > 100) return 'Over Budget'
    if (utilization > 90) return 'Warning'
    return 'Good'
  }

  const budgetItems = financialData.filter(d => d.type === 'budget')
  const revenueItems = financialData.filter(d => d.type === 'revenue')
  const expenseItems = financialData.filter(d => d.type === 'expense')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Complete Financial Overview</h2>
          <p className="text-muted-foreground">Monitor revenue, expenses, and budget utilization</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="Term1">Term 1 {selectedYear}</option>
            <option value="Term2">Term 2 {selectedYear}</option>
            <option value="Term3">Term 3 {selectedYear}</option>
          </select>
          <button
            onClick={() => toast.success('Report exported successfully')}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <DownloadIcon className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h4 className="mb-4 font-semibold">Revenue Breakdown</h4>
          <div className="flex h-64 items-end justify-center gap-8">
            {revenueItems.length > 0 ? (
              revenueItems.map((item) => {
                const percentage = summary.totalRevenue > 0 
                  ? (item.amountSpent / summary.totalRevenue) * 100 
                  : 0
                return (
                  <div key={item.$id} className="text-center">
                    <div
                      className="w-16 rounded-t bg-green-600"
                      style={{ height: `${(percentage / 100) * 200}px` }}
                    />
                    <div className="mt-2 text-xs font-medium">{item.category}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground">No revenue data</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h4 className="mb-4 font-semibold">Expense Distribution</h4>
          <div className="flex h-64 items-end justify-center gap-6">
            {expenseItems.length > 0 ? (
              expenseItems.map((item) => {
                const percentage = summary.totalExpenses > 0 
                  ? (item.amountSpent / summary.totalExpenses) * 100 
                  : 0
                return (
                  <div key={item.$id} className="text-center">
                    <div
                      className="w-14 rounded-t bg-red-600"
                      style={{ height: `${(percentage / 100) * 200}px` }}
                    />
                    <div className="mt-2 text-xs font-medium">{item.category}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground">No expense data</p>
            )}
          </div>
        </div>
      </div>

      {/* Budget Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Budget Allocated</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount Spent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Utilization %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item) => {
                  const balance = item.budgetAllocated - item.amountSpent
                  const utilization = item.budgetAllocated > 0 
                    ? (item.amountSpent / item.budgetAllocated) * 100 
                    : 0
                  return (
                    <tr key={item.$id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">{item.category}</td>
                      <td className="px-4 py-3">{formatCurrency(item.budgetAllocated)}</td>
                      <td className="px-4 py-3">{formatCurrency(item.amountSpent)}</td>
                      <td className={`px-4 py-3 font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${
                                utilization > 100 ? 'bg-red-600' : utilization > 90 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getStatusColor(utilization)}`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(utilization)}`}>
                          {getStatusText(utilization)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {budgetItems.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No budget data found for the selected period</p>
        </div>
      )}

      {/* Financial Alerts */}
      {summary.utilization > 90 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Financial Alert</h4>
          </div>
          <p className="text-sm text-red-800">
            Budget utilization is at {summary.utilization.toFixed(1)}%. 
            {summary.utilization > 100 ? ' Budget has been exceeded.' : ' Approaching budget limit.'}
          </p>
        </div>
      )}
    </div>
  )
}

