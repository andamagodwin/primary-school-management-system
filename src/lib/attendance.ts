import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, account } from './appwrite'

export interface Attendance {
  $id: string
  $createdAt: string
  $updatedAt: string
  attendanceId: string
  studentId: string
  studentName: string
  classId: string
  className: string
  date: string
  status: 'present' | 'absent' | 'late'
  timeIn?: string
  remarks?: string
  createdBy: string
  createdByName: string
}

export interface CreateAttendanceData {
  studentId: string
  studentName: string
  classId: string
  className: string
  date: string
  status: 'present' | 'absent' | 'late'
  timeIn?: string
  remarks?: string
}

/**
 * Create attendance record
 */
export async function createAttendance(data: CreateAttendanceData): Promise<Attendance> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, 'users', [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'

    const attendanceId = ID.unique()

    const attendanceData = {
      attendanceId,
      studentId: data.studentId,
      studentName: data.studentName,
      classId: data.classId,
      className: data.className,
      date: data.date,
      status: data.status,
      timeIn: data.timeIn || null,
      remarks: data.remarks || null,
      createdBy: currentUser.$id,
      createdByName,
    }

    const attendance = await databases.createDocument(
      DATABASE_ID,
      'attendance',
      ID.unique(),
      attendanceData
    )

    return attendance as unknown as Attendance
  } catch (error) {
    console.error('Error creating attendance:', error)
    throw error
  }
}

/**
 * Create multiple attendance records
 */
export async function createAttendanceRecords(
  records: CreateAttendanceData[]
): Promise<Attendance[]> {
  try {
    const attendances = await Promise.all(
      records.map(data => createAttendance(data))
    )
    return attendances
  } catch (error) {
    console.error('Error creating attendance records:', error)
    throw error
  }
}

/**
 * Get attendance by filters
 */
export async function getAttendance(filters?: {
  classId?: string
  studentId?: string
  date?: string
  startDate?: string
  endDate?: string
  status?: 'present' | 'absent' | 'late'
}): Promise<Attendance[]> {
  try {
    const queries: string[] = []
    
    if (filters?.classId) {
      queries.push(Query.equal('classId', filters.classId))
    }
    if (filters?.studentId) {
      queries.push(Query.equal('studentId', filters.studentId))
    }
    if (filters?.date) {
      queries.push(Query.equal('date', filters.date))
    }
    if (filters?.startDate && filters?.endDate) {
      queries.push(Query.greaterThanEqual('date', filters.startDate))
      queries.push(Query.lessThanEqual('date', filters.endDate))
    }
    if (filters?.status) {
      queries.push(Query.equal('status', filters.status))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      'attendance',
      queries
    )

    return response.documents as unknown as Attendance[]
  } catch (error) {
    console.error('Error fetching attendance:', error)
    throw error
  }
}

/**
 * Update attendance
 */
export async function updateAttendance(
  documentId: string,
  data: Partial<CreateAttendanceData>
): Promise<Attendance> {
  try {
    const attendance = await databases.updateDocument(
      DATABASE_ID,
      'attendance',
      documentId,
      data
    )

    return attendance as unknown as Attendance
  } catch (error) {
    console.error('Error updating attendance:', error)
    throw error
  }
}

/**
 * Delete attendance
 */
export async function deleteAttendance(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'attendance', documentId)
  } catch (error) {
    console.error('Error deleting attendance:', error)
    throw error
  }
}

/**
 * Calculate attendance percentage for a student
 */
export async function getAttendancePercentage(
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  try {
    const queries: string[] = [Query.equal('studentId', studentId)]
    
    if (startDate && endDate) {
      queries.push(Query.greaterThanEqual('date', startDate))
      queries.push(Query.lessThanEqual('date', endDate))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      'attendance',
      queries
    )

    const records = response.documents as unknown as Attendance[]
    if (records.length === 0) return 0

    const presentCount = records.filter(r => r.status === 'present').length
    return (presentCount / records.length) * 100
  } catch (error) {
    console.error('Error calculating attendance percentage:', error)
    return 0
  }
}

