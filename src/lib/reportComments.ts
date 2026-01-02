import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, REPORT_COMMENTS_TABLE_ID, USERS_TABLE_ID, account } from './appwrite'

export interface ReportComment {
  $id: string
  $createdAt: string
  $updatedAt: string
  commentId: string
  studentId: string
  studentName: string
  classId: string
  className: string
  term: string
  academicYear: string
  commentType: 'academic' | 'behavior' | 'improvement' | 'encouragement'
  comment: string
  signature: string
  createdBy: string
  createdByName: string
}

export interface CreateReportCommentData {
  studentId: string
  studentName: string
  classId: string
  className: string
  term: string
  academicYear: string
  commentType: 'academic' | 'behavior' | 'improvement' | 'encouragement'
  comment: string
  signature: string
}

/**
 * Create a new report comment
 */
export async function createReportComment(data: CreateReportCommentData): Promise<ReportComment> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const commentId = ID.unique()

    const commentData = {
      commentId,
      studentId: data.studentId,
      studentName: data.studentName,
      classId: data.classId,
      className: data.className,
      term: data.term,
      academicYear: data.academicYear,
      commentType: data.commentType,
      comment: data.comment,
      signature: data.signature,
      createdBy: currentUser.$id,
      createdByName,
    }

    const comment = await databases.createDocument(
      DATABASE_ID,
      REPORT_COMMENTS_TABLE_ID,
      ID.unique(),
      commentData
    )

    return comment as unknown as ReportComment
  } catch (error) {
    console.error('Error creating report comment:', error)
    throw error
  }
}

/**
 * Get report comments by filters
 */
export async function getReportComments(filters?: {
  studentId?: string
  classId?: string
  term?: string
  academicYear?: string
}): Promise<ReportComment[]> {
  try {
    const queries: string[] = []
    
    if (filters?.studentId) {
      queries.push(Query.equal('studentId', filters.studentId))
    }
    if (filters?.classId) {
      queries.push(Query.equal('classId', filters.classId))
    }
    if (filters?.term) {
      queries.push(Query.equal('term', filters.term))
    }
    if (filters?.academicYear) {
      queries.push(Query.equal('academicYear', filters.academicYear))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      REPORT_COMMENTS_TABLE_ID,
      queries
    )

    return response.documents as unknown as ReportComment[]
  } catch (error) {
    console.error('Error fetching report comments:', error)
    throw error
  }
}

/**
 * Update report comment
 */
export async function updateReportComment(
  documentId: string,
  data: Partial<CreateReportCommentData>
): Promise<ReportComment> {
  try {
    const comment = await databases.updateDocument(
      DATABASE_ID,
      REPORT_COMMENTS_TABLE_ID,
      documentId,
      data
    )

    return comment as unknown as ReportComment
  } catch (error) {
    console.error('Error updating report comment:', error)
    throw error
  }
}

/**
 * Delete report comment
 */
export async function deleteReportComment(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'reportComments', documentId)
  } catch (error) {
    console.error('Error deleting report comment:', error)
    throw error
  }
}

