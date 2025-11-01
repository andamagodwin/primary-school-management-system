import { ID } from 'appwrite'
import { databases, DATABASE_ID, STUDENTS_COLLECTION_ID, account } from './appwrite'

export interface Student {
  $id: string
  $createdAt: string
  $updatedAt: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'Male' | 'Female'
  grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
  avatar?: string
  classId?: string // Reference to class document
  className?: string // Denormalized for quick display
  parentName: string
  parentEmail?: string
  parentPhone: string
  parentUserId?: string
  address?: string
  medicalInfo?: string
  enrollmentDate: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'withdrawn'
  admissionNumber: string
  createdBy: string
}

export interface CreateStudentData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'Male' | 'Female'
  grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
  avatar?: string
  classId?: string
  className?: string
  parentName: string
  parentEmail?: string
  parentPhone: string
  address?: string
  medicalInfo?: string
}

/**
 * Generate admission number for a student
 * Format: HS-YEAR-GRADE-SEQUENCE (e.g., HS-2025-P1-001)
 * HS = Hillside Schools
 */
async function generateAdmissionNumber(grade: string): Promise<string> {
  const year = new Date().getFullYear()
  
  try {
    // Get count of students in this grade for this year
    const students = await databases.listDocuments(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID,
      // Query for students with admission numbers starting with current year and grade
    )
    
    // Extract sequence numbers and find the highest
    const sequences = students.documents
      .map(doc => {
        const studentDoc = doc as unknown as Student
        const admNum = studentDoc.admissionNumber
        if (admNum && admNum.startsWith(`HS-${year}-${grade}-`)) {
          return parseInt(admNum.split('-')[3] || '0')
        }
        return 0
      })
      .filter(num => !isNaN(num))
    
    const nextSequence = sequences.length > 0 ? Math.max(...sequences) + 1 : 1
    const sequence = String(nextSequence).padStart(3, '0')
    
    return `HS-${year}-${grade}-${sequence}`
  } catch (error) {
    console.error('Error generating admission number:', error)
    // Fallback to timestamp-based number if query fails
    const timestamp = Date.now().toString().slice(-6)
    return `HS-${year}-${grade}-${timestamp}`
  }
}

/**
 * Create a new student record
 */
export async function createStudent(data: CreateStudentData): Promise<Student> {
  try {
    // Get current user (who is creating the student)
    const currentUser = await account.get()
    
    // Generate unique student ID and admission number
    const studentId = ID.unique()
    const admissionNumber = await generateAdmissionNumber(data.grade)
    const now = new Date().toISOString()
    
    // Create student document
    const studentData = {
      studentId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      grade: data.grade,
      avatar: data.avatar || null,
      classId: data.classId || null,
      className: data.className || null,
      parentName: data.parentName,
      parentEmail: data.parentEmail || null,
      parentPhone: data.parentPhone,
      parentUserId: null, // To be linked when parent creates account
      address: data.address || null,
      medicalInfo: data.medicalInfo || null,
      enrollmentDate: now,
      status: 'active',
      admissionNumber,
      createdBy: currentUser.$id,
    }
    
    console.log('Creating student with data:', studentData)
    
    const student = await databases.createDocument(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID,
      ID.unique(),
      studentData
    )
    
    console.log('Student created successfully:', student)
    
    return student as unknown as Student
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}

/**
 * Get all students
 */
export async function getStudents(): Promise<Student[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID
    )
    
    return response.documents as unknown as Student[]
  } catch (error) {
    console.error('Error fetching students:', error)
    throw error
  }
}

/**
 * Get student by ID
 */
export async function getStudent(studentId: string): Promise<Student> {
  try {
    const student = await databases.getDocument(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID,
      studentId
    )
    
    return student as unknown as Student
  } catch (error) {
    console.error('Error fetching student:', error)
    throw error
  }
}

/**
 * Update student
 */
export async function updateStudent(
  documentId: string,
  data: Partial<CreateStudentData>
): Promise<Student> {
  try {
    const student = await databases.updateDocument(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID,
      documentId,
      data
    )
    
    return student as unknown as Student
  } catch (error) {
    console.error('Error updating student:', error)
    throw error
  }
}

/**
 * Delete student
 */
export async function deleteStudent(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      STUDENTS_COLLECTION_ID,
      documentId
    )
  } catch (error) {
    console.error('Error deleting student:', error)
    throw error
  }
}
