import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, FINANCIAL_DATA_TABLE_ID, USERS_TABLE_ID, account } from './appwrite'

export interface FinancialData {
  $id: string
  $createdAt: string
  $updatedAt: string
  financialId: string
  category: string
  type: 'revenue' | 'expense' | 'budget'
  term: string
  academicYear: string
  budgetAllocated: number
  amountSpent: number
  description?: string
  createdBy: string
  createdByName: string
}

export interface CreateFinancialData {
  category: string
  type: 'revenue' | 'expense' | 'budget'
  term: string
  academicYear: string
  budgetAllocated: number
  amountSpent: number
  description?: string
}

/**
 * Create financial data entry
 */
export async function createFinancialData(data: CreateFinancialData): Promise<FinancialData> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const financialId = ID.unique()

    const financialData = {
      financialId,
      category: data.category,
      type: data.type,
      term: data.term,
      academicYear: data.academicYear,
      budgetAllocated: data.budgetAllocated,
      amountSpent: data.amountSpent,
      description: data.description || null,
      createdBy: currentUser.$id,
      createdByName,
    }

    const financial = await databases.createDocument(
      DATABASE_ID,
      FINANCIAL_DATA_TABLE_ID,
      ID.unique(),
      financialData
    )

    return financial as unknown as FinancialData
  } catch (error) {
    console.error('Error creating financial data:', error)
    throw error
  }
}

/**
 * Get financial data by filters
 */
export async function getFinancialData(filters?: {
  term?: string
  academicYear?: string
  type?: 'revenue' | 'expense' | 'budget'
  category?: string
}): Promise<FinancialData[]> {
  try {
    const queries: string[] = []
    
    if (filters?.term) {
      queries.push(Query.equal('term', filters.term))
    }
    if (filters?.academicYear) {
      queries.push(Query.equal('academicYear', filters.academicYear))
    }
    if (filters?.type) {
      queries.push(Query.equal('type', filters.type))
    }
    if (filters?.category) {
      queries.push(Query.equal('category', filters.category))
    }

    queries.push(Query.orderDesc('$createdAt'))

    const response = await databases.listDocuments(
      DATABASE_ID,
      FINANCIAL_DATA_TABLE_ID,
      queries
    )

    return response.documents as unknown as FinancialData[]
  } catch (error) {
    console.error('Error fetching financial data:', error)
    throw error
  }
}

/**
 * Update financial data
 */
export async function updateFinancialData(
  documentId: string,
  data: Partial<CreateFinancialData>
): Promise<FinancialData> {
  try {
    const financial = await databases.updateDocument(
      DATABASE_ID,
      FINANCIAL_DATA_TABLE_ID,
      documentId,
      data
    )

    return financial as unknown as FinancialData
  } catch (error) {
    console.error('Error updating financial data:', error)
    throw error
  }
}

/**
 * Delete financial data
 */
export async function deleteFinancialData(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'financialData', documentId)
  } catch (error) {
    console.error('Error deleting financial data:', error)
    throw error
  }
}

/**
 * Calculate financial summary
 */
export async function getFinancialSummary(
  term: string,
  academicYear: string
): Promise<{
  totalRevenue: number
  totalExpenses: number
  totalBudget: number
  balance: number
  utilization: number
}> {
  try {
    const [revenue, expenses, budgets] = await Promise.all([
      getFinancialData({ term, academicYear, type: 'revenue' }),
      getFinancialData({ term, academicYear, type: 'expense' }),
      getFinancialData({ term, academicYear, type: 'budget' }),
    ])

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amountSpent, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountSpent, 0)
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAllocated, 0)
    const balance = totalRevenue - totalExpenses
    const utilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

    return {
      totalRevenue,
      totalExpenses,
      totalBudget,
      balance,
      utilization,
    }
  } catch (error) {
    console.error('Error calculating financial summary:', error)
    throw error
  }
}

