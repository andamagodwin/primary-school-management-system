import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, LESSONPLANS_TABLE_ID, USERS_TABLE_ID, storage, STORAGE_BUCKET_ID, account } from './appwrite'

export interface LessonPlan {
  $id: string
  $createdAt: string
  $updatedAt: string
  lessonPlanId: string
  title: string
  subject: string
  weekNumber: number
  term: string
  academicYear: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  createdBy: string
  createdByName: string
}

export interface CreateLessonPlanData {
  title: string
  subject: string
  weekNumber: number
  term: string
  academicYear: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'
}

/**
 * Upload lesson plan file to storage
 */
export async function uploadLessonPlanFile(file: File): Promise<string> {
  try {
    const fileId = ID.unique()
    const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file)
    return response.$id
  } catch (error) {
    console.error('Error uploading lesson plan file:', error)
    throw error
  }
}

/**
 * Get file URL
 */
export function getLessonPlanFileUrl(fileId: string): string {
  return storage.getFileView(STORAGE_BUCKET_ID, fileId).toString()
}

/**
 * Create a new lesson plan
 */
export async function createLessonPlan(data: CreateLessonPlanData): Promise<LessonPlan> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const lessonPlanId = ID.unique()

    const lessonPlanData = {
      lessonPlanId,
      title: data.title,
      subject: data.subject,
      weekNumber: data.weekNumber,
      term: data.term,
      academicYear: data.academicYear,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      status: data.status || 'draft',
      createdBy: currentUser.$id,
      createdByName,
    }

    const lessonPlan = await databases.createDocument(
      DATABASE_ID,
      LESSONPLANS_TABLE_ID,
      ID.unique(),
      lessonPlanData
    )

    return lessonPlan as unknown as LessonPlan
  } catch (error) {
    console.error('Error creating lesson plan:', error)
    throw error
  }
}

/**
 * Get lesson plans by filters
 */
export async function getLessonPlans(filters?: {
  subject?: string
  term?: string
  academicYear?: string
  weekNumber?: number
  status?: string
  createdBy?: string
}): Promise<LessonPlan[]> {
  try {
    const queries: string[] = []
    
    if (filters?.subject) {
      queries.push(Query.equal('subject', filters.subject))
    }
    if (filters?.term) {
      queries.push(Query.equal('term', filters.term))
    }
    if (filters?.academicYear) {
      queries.push(Query.equal('academicYear', filters.academicYear))
    }
    if (filters?.weekNumber !== undefined) {
      queries.push(Query.equal('weekNumber', filters.weekNumber))
    }
    if (filters?.status) {
      queries.push(Query.equal('status', filters.status))
    }
    if (filters?.createdBy) {
      queries.push(Query.equal('createdBy', filters.createdBy))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      LESSONPLANS_TABLE_ID,
      queries
    )

    return response.documents as unknown as LessonPlan[]
  } catch (error) {
    console.error('Error fetching lesson plans:', error)
    throw error
  }
}

/**
 * Update lesson plan
 */
export async function updateLessonPlan(
  documentId: string,
  data: Partial<CreateLessonPlanData>
): Promise<LessonPlan> {
  try {
    const lessonPlan = await databases.updateDocument(
      DATABASE_ID,
      LESSONPLANS_TABLE_ID,
      documentId,
      data
    )

    return lessonPlan as unknown as LessonPlan
  } catch (error) {
    console.error('Error updating lesson plan:', error)
    throw error
  }
}

/**
 * Delete lesson plan
 */
export async function deleteLessonPlan(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'lessonPlans', documentId)
  } catch (error) {
    console.error('Error deleting lesson plan:', error)
    throw error
  }
}

