import { ID, Query } from 'appwrite'
import { databases, account, DATABASE_ID, TEACHERS_COLLECTION_ID } from './appwrite'

export interface Teacher {
  $id: string
  $createdAt: string
  $updatedAt: string
  teacherId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'Male' | 'Female'
  address?: string
  avatar?: string
  employeeNumber: string
  dateOfJoining: string
  qualification: string
  specialization: string
  subjects: string[] // Array of subjects they teach
  classes: string[] // Array of classes they teach (e.g., ['P1', 'P2'])
  employmentType: 'Full-time' | 'Part-time' | 'Contract'
  status: 'active' | 'inactive' | 'on-leave' | 'terminated'
  salary?: number
  bankDetails?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
  createdBy: string
}

export interface CreateTeacherData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'Male' | 'Female'
  address?: string
  avatar?: string
  dateOfJoining: string
  qualification: string
  specialization: string
  subjects: string[]
  classes: string[]
  employmentType: 'Full-time' | 'Part-time' | 'Contract'
  salary?: number
  bankDetails?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
}

/**
 * Generate a unique employee number for a teacher
 * Format: TS-YEAR-SEQUENCE (e.g., TS-2025-001)
 */
async function generateEmployeeNumber(): Promise<string> {
  const year = new Date().getFullYear()
  
  try {
    // Get all teachers to determine the next sequence number
    const teachers = await databases.listDocuments(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(1)
      ]
    )

    let sequence = 1
    
    if (teachers.documents.length > 0) {
      const lastTeacher = teachers.documents[0] as unknown as Teacher
      const lastEmployeeNumber = lastTeacher.employeeNumber
      
      // Extract sequence from last employee number (e.g., TS-2025-001 -> 001)
      const parts = lastEmployeeNumber.split('-')
      if (parts.length === 3 && parts[1] === year.toString()) {
        sequence = parseInt(parts[2]) + 1
      }
    }

    // Format: TS-YEAR-XXX (e.g., TS-2025-001)
    return `TS-${year}-${sequence.toString().padStart(3, '0')}`
  } catch (error) {
    console.error('Error generating employee number:', error)
    // Fallback to timestamp-based ID
    return `TS-${year}-${Date.now().toString().slice(-3)}`
  }
}

/**
 * Create a new teacher in the database
 */
export async function createTeacher(data: CreateTeacherData): Promise<Teacher> {
  try {
    // Get current user ID
    const accountDetails = await account.get()
    
    // Generate unique IDs
    const teacherId = ID.unique()
    const employeeNumber = await generateEmployeeNumber()

    // Create teacher document
    const teacher = await databases.createDocument(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      teacherId,
      {
        teacherId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        avatar: data.avatar,
        employeeNumber,
        dateOfJoining: data.dateOfJoining,
        qualification: data.qualification,
        specialization: data.specialization,
        subjects: data.subjects,
        classes: data.classes,
        employmentType: data.employmentType,
        status: 'active',
        salary: data.salary,
        bankDetails: data.bankDetails,
        emergencyContact: data.emergencyContact ? JSON.stringify(data.emergencyContact) : undefined,
        notes: data.notes,
        createdBy: accountDetails.$id,
      }
    )

    return teacher as unknown as Teacher
  } catch (error) {
    console.error('Error creating teacher:', error)
    throw error
  }
}

/**
 * Get all teachers
 */
export async function getTeachers(): Promise<Teacher[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    )

    return response.documents as unknown as Teacher[]
  } catch (error) {
    console.error('Error fetching teachers:', error)
    throw error
  }
}

/**
 * Get a single teacher by ID
 */
export async function getTeacher(teacherId: string): Promise<Teacher> {
  try {
    const teacher = await databases.getDocument(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      teacherId
    )

    return teacher as unknown as Teacher
  } catch (error) {
    console.error('Error fetching teacher:', error)
    throw error
  }
}

/**
 * Update a teacher
 */
export async function updateTeacher(
  documentId: string,
  data: Partial<CreateTeacherData>
): Promise<Teacher> {
  try {
    const updateData: Record<string, unknown> = { ...data }
    
    // Handle emergency contact serialization
    if (data.emergencyContact) {
      updateData.emergencyContact = JSON.stringify(data.emergencyContact)
    }

    const teacher = await databases.updateDocument(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      documentId,
      updateData
    )
    
    return teacher as unknown as Teacher
  } catch (error) {
    console.error('Error updating teacher:', error)
    throw error
  }
}

/**
 * Delete a teacher
 */
export async function deleteTeacher(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TEACHERS_COLLECTION_ID,
      documentId
    )
  } catch (error) {
    console.error('Error deleting teacher:', error)
    throw error
  }
}
