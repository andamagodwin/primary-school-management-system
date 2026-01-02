import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, STAFF_APPLICATIONS_TABLE_ID, USERS_TABLE_ID, storage, STORAGE_BUCKET_ID, account } from './appwrite'

export interface StaffApplication {
  $id: string
  $createdAt: string
  $updatedAt: string
  applicationId: string
  applicantName: string
  email: string
  phone: string
  position: string
  qualification: string
  experience: number
  cvUrl?: string
  cvFileName?: string
  status: 'pending' | 'approved' | 'rejected' | 'interview-scheduled'
  reviewedBy?: string
  reviewedByName?: string
  reviewDate?: string
  reviewComments?: string
}

export interface CreateApplicationData {
  applicantName: string
  email: string
  phone: string
  position: string
  qualification: string
  experience: number
  cvUrl?: string
  cvFileName?: string
}

/**
 * Upload CV file to storage
 */
export async function uploadCVFile(file: File): Promise<string> {
  try {
    const fileId = ID.unique()
    const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file)
    return response.$id
  } catch (error) {
    console.error('Error uploading CV file:', error)
    throw error
  }
}

/**
 * Create a new staff application
 */
export async function createApplication(data: CreateApplicationData): Promise<StaffApplication> {
  try {
    const applicationId = ID.unique()

    const applicationData = {
      applicationId,
      applicantName: data.applicantName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      qualification: data.qualification,
      experience: data.experience,
      cvUrl: data.cvUrl || null,
      cvFileName: data.cvFileName || null,
      status: 'pending' as const,
    }

    const application = await databases.createDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      ID.unique(),
      applicationData
    )

    return application as unknown as StaffApplication
  } catch (error) {
    console.error('Error creating application:', error)
    throw error
  }
}

/**
 * Get applications by filters
 */
export async function getApplications(filters?: {
  status?: string
  position?: string
}): Promise<StaffApplication[]> {
  try {
    const queries: string[] = []
    
    if (filters?.status) {
      queries.push(Query.equal('status', filters.status))
    }
    if (filters?.position) {
      queries.push(Query.equal('position', filters.position))
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      queries
    )

    return response.documents as unknown as StaffApplication[]
  } catch (error) {
    console.error('Error fetching applications:', error)
    throw error
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  documentId: string,
  status: 'pending' | 'approved' | 'rejected' | 'interview-scheduled',
  reviewComments?: string
): Promise<StaffApplication> {
  try {
    const currentUser = await account.get()
      const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const reviewedByName = user?.fullName || currentUser.name || 'Unknown'

    const updateData: any = {
      status,
      reviewedBy: currentUser.$id,
      reviewedByName,
      reviewDate: new Date().toISOString(),
    }

    if (reviewComments) {
      updateData.reviewComments = reviewComments
    }

    const application = await databases.updateDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      documentId,
      updateData
    )

    return application as unknown as StaffApplication
  } catch (error) {
    console.error('Error updating application:', error)
    throw error
  }
}

/**
 * Delete application
 */
export async function deleteApplication(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, 'staffApplications', documentId)
  } catch (error) {
    console.error('Error deleting application:', error)
    throw error
  }
}

