import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, GENERATED_REPORTS_TABLE_ID, USERS_TABLE_ID, storage, STORAGE_BUCKET_ID, account } from './appwrite'

export interface GeneratedReport {
  $id: string
  $createdAt: string
  $updatedAt: string
  reportId: string
  reportName: string
  reportType: 'financial' | 'academic' | 'staff' | 'audit' | 'custom'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  generatedBy: string
  generatedByName: string
  parameters?: string
}

export interface CreateReportData {
  reportName: string
  reportType: 'financial' | 'academic' | 'staff' | 'audit' | 'custom'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  parameters?: Record<string, any>
}

/**
 * Upload report file to storage
 */
export async function uploadReportFile(file: File): Promise<string> {
  try {
    const fileId = ID.unique()
    const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file)
    return response.$id
  } catch (error) {
    console.error('Error uploading report file:', error)
    throw error
  }
}

/**
 * Create a generated report record
 */
export async function createReport(data: CreateReportData): Promise<GeneratedReport> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const generatedByName = user?.fullName || currentUser.name || 'Unknown'

    const reportId = ID.unique()

    const reportData = {
      reportId,
      reportName: data.reportName,
      reportType: data.reportType,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      generatedBy: currentUser.$id,
      generatedByName,
      parameters: data.parameters ? JSON.stringify(data.parameters) : null,
    }

    const report = await databases.createDocument(
      DATABASE_ID,
      GENERATED_REPORTS_TABLE_ID,
      ID.unique(),
      reportData
    )

    return report as unknown as GeneratedReport
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

/**
 * Get reports by filters
 */
export async function getReports(filters?: {
  reportType?: string
  generatedBy?: string
}): Promise<GeneratedReport[]> {
  try {
    const queries: string[] = []
    
    if (filters?.reportType) {
      queries.push(Query.equal('reportType', filters.reportType))
    }
    if (filters?.generatedBy) {
      queries.push(Query.equal('generatedBy', filters.generatedBy))
    }

    queries.push(Query.orderDesc('$createdAt'))
    queries.push(Query.limit(100))

    const response = await databases.listDocuments(
      DATABASE_ID,
      GENERATED_REPORTS_TABLE_ID,
      queries
    )

    return response.documents as unknown as GeneratedReport[]
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw error
  }
}

/**
 * Delete report
 */
export async function deleteReport(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'generatedReports', documentId)
  } catch (error) {
    console.error('Error deleting report:', error)
    throw error
  }
}

