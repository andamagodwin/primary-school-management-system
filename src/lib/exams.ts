import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, storage, STORAGE_BUCKET_ID, account } from './appwrite'

export interface Exam {
  $id: string
  $createdAt: string
  $updatedAt: string
  examId: string
  title: string
  classId: string
  className: string
  subject: string
  term: string
  academicYear: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  status: 'draft' | 'submitted' | 'approved'
  createdBy: string
  createdByName: string
}

export interface CreateExamData {
  title: string
  classId: string
  className: string
  subject: string
  term: string
  academicYear: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  status?: 'draft' | 'submitted' | 'approved'
}

/**
 * Upload exam file to storage
 */
export async function uploadExamFile(file: File): Promise<string> {
  try {
    const fileId = ID.unique()
    const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file)
    return response.$id
  } catch (error) {
    console.error('Error uploading exam file:', error)
    throw error
  }
}

/**
 * Get file URL
 */
export function getExamFileUrl(fileId: string): string {
  return storage.getFileView(STORAGE_BUCKET_ID, fileId).toString()
}

/**
 * Create a new exam
 */
export async function createExam(data: CreateExamData): Promise<Exam> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, 'users', [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const examId = ID.unique()

    const examData = {
      examId,
      title: data.title,
      classId: data.classId,
      className: data.className,
      subject: data.subject,
      term: data.term,
      academicYear: data.academicYear,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      status: data.status || 'draft',
      createdBy: currentUser.$id,
      createdByName,
    }

    const exam = await databases.createDocument(
      DATABASE_ID,
      'exams',
      ID.unique(),
      examData
    )

    return exam as unknown as Exam
  } catch (error) {
    console.error('Error creating exam:', error)
    throw error
  }
}

/**
 * Get exams by filters
 */
export async function getExams(filters?: {
  classId?: string
  subject?: string
  term?: string
  academicYear?: string
  status?: string
  createdBy?: string
}): Promise<Exam[]> {
  try {
    const queries: string[] = []
    
    if (filters?.classId) {
      queries.push(Query.equal('classId', filters.classId))
    }
    if (filters?.subject) {
      queries.push(Query.equal('subject', filters.subject))
    }
    if (filters?.term) {
      queries.push(Query.equal('term', filters.term))
    }
    if (filters?.academicYear) {
      queries.push(Query.equal('academicYear', filters.academicYear))
    }
    if (filters?.status) {
      queries.push(Query.equal('status', filters.status))
    }
    if (filters?.createdBy) {
      queries.push(Query.equal('createdBy', filters.createdBy))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      'exams',
      queries
    )

    return response.documents as unknown as Exam[]
  } catch (error) {
    console.error('Error fetching exams:', error)
    throw error
  }
}

/**
 * Update exam
 */
export async function updateExam(
  documentId: string,
  data: Partial<CreateExamData>
): Promise<Exam> {
  try {
    const exam = await databases.updateDocument(
      DATABASE_ID,
      'exams',
      documentId,
      data
    )

    return exam as unknown as Exam
  } catch (error) {
    console.error('Error updating exam:', error)
    throw error
  }
}

/**
 * Delete exam
 */
export async function deleteExam(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'exams', documentId)
  } catch (error) {
    console.error('Error deleting exam:', error)
    throw error
  }
}

