import { ID, Query } from 'appwrite'
import { databases, account, DATABASE_ID, CLASSES_COLLECTION_ID } from './appwrite'

export interface Class {
  $id: string
  $createdAt: string
  $updatedAt: string
  classId: string
  name: string // e.g., "Primary 1", "P1"
  grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
  classTeacherId?: string // Reference to teacher document ID
  classTeacherName?: string // Denormalized for easier display
  roomNumber?: string
  capacity: number
  currentStudents: number // Auto-calculated or manually set
  subjects: string[] // Array of subjects taught in this class
  schedule?: string // JSON string of class schedule
  academicYear: string // e.g., "2025"
  term: 'Term1' | 'Term2' | 'Term3'
  status: 'active' | 'inactive' | 'completed'
  notes?: string
  createdBy: string
}

export interface CreateClassData {
  name: string
  grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
  classTeacherId?: string
  classTeacherName?: string
  roomNumber?: string
  capacity: number
  subjects: string[]
  schedule?: string
  academicYear: string
  term: 'Term1' | 'Term2' | 'Term3'
  notes?: string
}

/**
 * Create a new class in the database
 */
export async function createClass(data: CreateClassData): Promise<Class> {
  try {
    // Get current user ID
    const accountDetails = await account.get()
    
    // Generate unique class ID
    const classId = ID.unique()

    // Create class document
    const classDoc = await databases.createDocument(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      classId,
      {
        classId,
        name: data.name,
        grade: data.grade,
        classTeacherId: data.classTeacherId,
        classTeacherName: data.classTeacherName,
        roomNumber: data.roomNumber,
        capacity: data.capacity,
        currentStudents: 0, // Initialize to 0
        subjects: data.subjects,
        schedule: data.schedule,
        academicYear: data.academicYear,
        term: data.term,
        status: 'active',
        notes: data.notes,
        createdBy: accountDetails.$id,
      }
    )

    return classDoc as unknown as Class
  } catch (error) {
    console.error('Error creating class:', error)
    throw error
  }
}

/**
 * Get all classes
 */
export async function getClasses(): Promise<Class[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      [
        Query.orderAsc('grade'),
        Query.limit(100)
      ]
    )

    return response.documents as unknown as Class[]
  } catch (error) {
    console.error('Error fetching classes:', error)
    throw error
  }
}

/**
 * Get a single class by ID
 */
export async function getClass(classId: string): Promise<Class> {
  try {
    const classDoc = await databases.getDocument(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      classId
    )

    return classDoc as unknown as Class
  } catch (error) {
    console.error('Error fetching class:', error)
    throw error
  }
}

/**
 * Update a class
 */
export async function updateClass(
  documentId: string,
  data: Partial<CreateClassData>
): Promise<Class> {
  try {
    const classDoc = await databases.updateDocument(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      documentId,
      data
    )
    
    return classDoc as unknown as Class
  } catch (error) {
    console.error('Error updating class:', error)
    throw error
  }
}

/**
 * Delete a class
 */
export async function deleteClass(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      documentId
    )
  } catch (error) {
    console.error('Error deleting class:', error)
    throw error
  }
}

/**
 * Update student count for a class
 */
export async function updateClassStudentCount(
  documentId: string,
  count: number
): Promise<Class> {
  try {
    const classDoc = await databases.updateDocument(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      documentId,
      {
        currentStudents: count
      }
    )
    
    return classDoc as unknown as Class
  } catch (error) {
    console.error('Error updating class student count:', error)
    throw error
  }
}

/**
 * Get classes by grade
 */
export async function getClassesByGrade(grade: string): Promise<Class[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      [
        Query.equal('grade', grade),
        Query.orderAsc('section')
      ]
    )

    return response.documents as unknown as Class[]
  } catch (error) {
    console.error('Error fetching classes by grade:', error)
    throw error
  }
}

/**
 * Get classes by teacher
 */
export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      CLASSES_COLLECTION_ID,
      [
        Query.equal('classTeacherId', teacherId)
      ]
    )

    return response.documents as unknown as Class[]
  } catch (error) {
    console.error('Error fetching classes by teacher:', error)
    throw error
  }
}
