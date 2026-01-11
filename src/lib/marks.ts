import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, MARKS_TABLE_ID, USERS_TABLE_ID, account } from './appwrite'

export interface Mark {
  $id: string
  $createdAt: string
  $updatedAt: string
  markId: string
  studentId: string
  studentName: string
  classId: string
  className: string
  subject: string
  term: 'Term1' | 'Term2' | 'Term3'
  academicYear: string
  assessmentType: 'Test1' | 'Test2' | 'Midterm' | 'Endterm'
  marks: number
  maxMarks: number
  grade?: string
  remarks?: string
  status: 'draft' | 'saved' | 'submitted'
  createdBy: string
  createdByName: string
}

export interface CreateMarkData {
  studentId: string
  studentName: string
  classId: string
  className: string
  subject: string
  term: 'Term1' | 'Term2' | 'Term3'
  academicYear: string
  assessmentType: 'Test1' | 'Test2' | 'Midterm' | 'Endterm'
  marks: number
  maxMarks: number
  grade?: string
  remarks?: string
  status?: 'draft' | 'saved' | 'submitted'
}

/**
 * Calculate grade from marks
 */
export function calculateGrade(marks: number, maxMarks: number): string {
  const percentage = (marks / maxMarks) * 100
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}

/**
 * Create a new mark entry
 */
export async function createMark(data: CreateMarkData): Promise<Mark> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const markId = ID.unique()
    const grade = data.grade || calculateGrade(data.marks, data.maxMarks)

    const markData = {
      markId,
      studentId: data.studentId,
      studentName: data.studentName,
      classId: data.classId,
      className: data.className,
      subject: data.subject,
      term: data.term,
      academicYear: data.academicYear,
      assessmentType: data.assessmentType,
      marks: data.marks,
      maxMarks: data.maxMarks,
      grade,
      remarks: data.remarks || null,
      status: data.status || 'draft',
      createdBy: currentUser.$id,
      createdByName,
    }

    const mark = await databases.createDocument(
      DATABASE_ID,
      MARKS_TABLE_ID,
      ID.unique(),
      markData
    )

    return mark as unknown as Mark
  } catch (error) {
    console.error('Error creating mark:', error)
    throw error
  }
}

/**
 * Create multiple marks at once
 */
export async function createMarks(marksData: CreateMarkData[]): Promise<Mark[]> {
  try {
    const marks = await Promise.all(marksData.map(data => createMark(data)))
    return marks
  } catch (error) {
    console.error('Error creating marks:', error)
    throw error
  }
}

/**
 * Get marks by filters
 */
export async function getMarks(filters?: {
  classId?: string
  subject?: string
  term?: string
  academicYear?: string
  assessmentType?: string
  studentId?: string
}): Promise<Mark[]> {
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
    if (filters?.assessmentType) {
      queries.push(Query.equal('assessmentType', filters.assessmentType))
    }
    if (filters?.studentId) {
      queries.push(Query.equal('studentId', filters.studentId))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      MARKS_TABLE_ID,
      queries
    )

    return response.documents as unknown as Mark[]
  } catch (error) {
    console.error('Error fetching marks:', error)
    throw error
  }
}

/**
 * Update mark
 */
export async function updateMark(
  documentId: string,
  data: Partial<CreateMarkData>
): Promise<Mark> {
  try {
    const updateData: any = { ...data }
    
    // Recalculate grade if marks changed
    if (data.marks !== undefined && data.maxMarks !== undefined) {
      updateData.grade = calculateGrade(data.marks, data.maxMarks)
    }

    const mark = await databases.updateDocument(
      DATABASE_ID,
      MARKS_TABLE_ID,
      documentId,
      updateData
    )

    return mark as unknown as Mark
  } catch (error) {
    console.error('Error updating mark:', error)
    throw error
  }
}

/**
 * Delete mark
 */
export async function deleteMark(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, MARKS_TABLE_ID, documentId)
  } catch (error) {
    console.error('Error deleting mark:', error)
    throw error
  }
}

