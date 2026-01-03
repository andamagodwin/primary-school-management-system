import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, AUDIT_LOGS_TABLE_ID, USERS_TABLE_ID, account } from './appwrite'

export interface AuditLog {
  $id: string
  $createdAt: string
  $updatedAt: string
  logId: string
  userId: string
  userName: string
  userType: string
  action: string
  details?: string
  ipAddress?: string
  status: 'success' | 'failed' | 'pending'
  metadata?: string
}

export interface CreateAuditLogData {
  action: string
  details?: string
  ipAddress?: string
  status?: 'success' | 'failed' | 'pending'
  metadata?: string
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const userName = user?.fullName || currentUser.name || 'Unknown'
    const userType = user?.userType || 'unknown'

    const logId = ID.unique()

    const logData = {
      logId,
      userId: currentUser.$id,
      userName,
      userType,
      action: data.action,
      details: data.details || null,
      ipAddress: data.ipAddress || null,
      status: data.status || 'success',
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    }

    const log = await databases.createDocument(
      DATABASE_ID,
      AUDIT_LOGS_TABLE_ID,
      ID.unique(),
      logData
    )

    return log as unknown as AuditLog
  } catch (error) {
    console.error('Error creating audit log:', error)
    throw error
  }
}

/**
 * Get audit logs by filters
 */
export async function getAuditLogs(filters?: {
  userId?: string
  userType?: string
  action?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<AuditLog[]> {
  try {
    const queries: string[] = []
    
    if (filters?.userId) {
      queries.push(Query.equal('userId', filters.userId))
    }
    if (filters?.userType) {
      queries.push(Query.equal('userType', filters.userType))
    }
    if (filters?.action) {
      queries.push(Query.equal('action', filters.action))
    }
    if (filters?.status) {
      queries.push(Query.equal('status', filters.status))
    }
    if (filters?.startDate) {
      queries.push(Query.greaterThanEqual('$createdAt', filters.startDate))
    }
    if (filters?.endDate) {
      queries.push(Query.lessThanEqual('$createdAt', filters.endDate))
    }

    queries.push(Query.orderDesc('$createdAt'))
    queries.push(Query.limit(1000))

    const response = await databases.listDocuments(
      DATABASE_ID,
      AUDIT_LOGS_TABLE_ID,
      queries
    )

    return response.documents as unknown as AuditLog[]
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    throw error
  }
}

/**
 * Delete audit log
 */
export async function deleteAuditLog(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'auditLogs', documentId)
  } catch (error) {
    console.error('Error deleting audit log:', error)
    throw error
  }
}

