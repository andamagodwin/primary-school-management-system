import { ID, Query } from 'appwrite'
import { databases, DATABASE_ID, STAFF_APPLICATIONS_TABLE_ID, USERS_TABLE_ID, storage, STORAGE_BUCKET_ID, account } from './appwrite'

export interface EducationHistory {
  institution: string
  qualification: string
  yearCompleted: string
  grade?: string
}

export interface EmploymentHistory {
  employer: string
  position: string
  startDate: string
  endDate?: string
  responsibilities?: string
  currentlyWorking: boolean
}

export interface Reference {
  name: string
  position: string
  organization: string
  phone: string
  email: string
  relationship: string
}

export interface StaffApplication {
  $id: string
  $createdAt: string
  $updatedAt: string
  applicationId: string
  referenceNumber: string
  applicantName: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: 'Male' | 'Female' | 'Other'
  address?: string
  city?: string
  country?: string
  nationalId?: string
  passportNumber?: string
  position: string
  qualification: string
  experience: number
  educationHistory?: EducationHistory[]
  employmentHistory?: EmploymentHistory[]
  references?: Reference[]
  coverLetter?: string
  skills?: string[]
  availabilityDate?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  cvUrl?: string
  cvFileName?: string
  cvFileSize?: number
  status: 'pending' | 'approved' | 'rejected' | 'interview-scheduled' | 'on-hold'
  interviewDate?: string
  interviewTime?: string
  interviewLocation?: string
  interviewNotes?: string
  reviewedBy?: string
  reviewedByName?: string
  reviewDate?: string
  reviewComments?: string
  internalNotes?: string
  salaryExpectation?: number
  expectedStartDate?: string
}

export interface CreateApplicationData {
  applicantName: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: 'Male' | 'Female' | 'Other'
  address?: string
  city?: string
  country?: string
  nationalId?: string
  passportNumber?: string
  position: string
  qualification: string
  experience: number
  educationHistory?: EducationHistory[]
  employmentHistory?: EmploymentHistory[]
  references?: Reference[]
  coverLetter?: string
  skills?: string[]
  availabilityDate?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  cvUrl?: string
  cvFileName?: string
  cvFileSize?: number
  salaryExpectation?: number
  expectedStartDate?: string
}

/**
 * Upload CV file to storage
 */
export async function uploadCVFile(file: File): Promise<{ fileId: string; fileName: string; fileSize: number }> {
  try {
    const fileId = ID.unique()
    const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file)
    return {
      fileId: response.$id,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Error uploading CV file:', error)
    throw error
  }
}

/**
 * Get CV file download URL
 */
export function getCVFileUrl(fileId: string): string {
  return storage.getFileView(STORAGE_BUCKET_ID, fileId).toString()
}

/**
 * Generate application reference number
 */
function generateReferenceNumber(): string {
  const prefix = 'APP'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Create a new staff application
 */
export async function createApplication(data: CreateApplicationData): Promise<StaffApplication> {
  try {
    const applicationId = ID.unique()
    const referenceNumber = generateReferenceNumber()

    const applicationData: any = {
      applicationId,
      referenceNumber,
      applicantName: data.applicantName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      qualification: data.qualification,
      experience: data.experience,
      status: 'pending' as const,
    }

    // Add optional fields
    if (data.dateOfBirth) applicationData.dateOfBirth = data.dateOfBirth
    if (data.gender) applicationData.gender = data.gender
    if (data.address) applicationData.address = data.address
    if (data.city) applicationData.city = data.city
    if (data.country) applicationData.country = data.country
    if (data.nationalId) applicationData.nationalId = data.nationalId
    if (data.passportNumber) applicationData.passportNumber = data.passportNumber
    if (data.educationHistory && data.educationHistory.length > 0) {
      applicationData.educationHistory = JSON.stringify(data.educationHistory)
    }
    if (data.employmentHistory && data.employmentHistory.length > 0) {
      applicationData.employmentHistory = JSON.stringify(data.employmentHistory)
    }
    if (data.references && data.references.length > 0) {
      applicationData.references = JSON.stringify(data.references)
    }
    if (data.coverLetter) applicationData.coverLetter = data.coverLetter
    if (data.skills && data.skills.length > 0) {
      applicationData.skills = JSON.stringify(data.skills)
    }
    if (data.availabilityDate) applicationData.availabilityDate = data.availabilityDate
    if (data.emergencyContactName) applicationData.emergencyContactName = data.emergencyContactName
    if (data.emergencyContactPhone) applicationData.emergencyContactPhone = data.emergencyContactPhone
    if (data.emergencyContactRelationship) applicationData.emergencyContactRelationship = data.emergencyContactRelationship
    if (data.cvUrl) applicationData.cvUrl = data.cvUrl
    if (data.cvFileName) applicationData.cvFileName = data.cvFileName
    if (data.cvFileSize) applicationData.cvFileSize = data.cvFileSize
    if (data.salaryExpectation) applicationData.salaryExpectation = data.salaryExpectation
    if (data.expectedStartDate) applicationData.expectedStartDate = data.expectedStartDate

    const application = await databases.createDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      ID.unique(),
      applicationData
    )

    return parseApplication(application)
  } catch (error) {
    console.error('Error creating application:', error)
    throw error
  }
}

/**
 * Parse application data from database (handles JSON fields)
 */
function parseApplication(doc: any): StaffApplication {
  const app = doc as unknown as StaffApplication
  if (app.educationHistory && typeof app.educationHistory === 'string') {
    try {
      app.educationHistory = JSON.parse(app.educationHistory)
    } catch (e) {
      app.educationHistory = undefined
    }
  }
  if (app.employmentHistory && typeof app.employmentHistory === 'string') {
    try {
      app.employmentHistory = JSON.parse(app.employmentHistory)
    } catch (e) {
      app.employmentHistory = undefined
    }
  }
  if (app.references && typeof app.references === 'string') {
    try {
      app.references = JSON.parse(app.references)
    } catch (e) {
      app.references = undefined
    }
  }
  if (app.skills && typeof app.skills === 'string') {
    try {
      app.skills = JSON.parse(app.skills)
    } catch (e) {
      app.skills = undefined
    }
  }
  return app
}

/**
 * Get applications by filters
 */
export async function getApplications(filters?: {
  status?: string
  position?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}): Promise<StaffApplication[]> {
  try {
    const queries: string[] = []
    
    if (filters?.status && filters.status !== 'all') {
      queries.push(Query.equal('status', filters.status))
    }
    if (filters?.position && filters.position !== 'all') {
      queries.push(Query.equal('position', filters.position))
    }
    if (filters?.dateFrom) {
      queries.push(Query.greaterThanEqual('$createdAt', filters.dateFrom))
    }
    if (filters?.dateTo) {
      queries.push(Query.lessThanEqual('$createdAt', filters.dateTo))
    }

    // Order by creation date (newest first)
    queries.push(Query.orderDesc('$createdAt'))

    const response = await databases.listDocuments(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      queries
    )

    let applications = response.documents.map(doc => parseApplication(doc)) as StaffApplication[]

    // Client-side search if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      applications = applications.filter(app => 
        app.applicantName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm) ||
        app.phone.includes(searchTerm) ||
        app.position.toLowerCase().includes(searchTerm) ||
        app.referenceNumber.toLowerCase().includes(searchTerm) ||
        (app.nationalId && app.nationalId.toLowerCase().includes(searchTerm))
      )
    }

    return applications
  } catch (error) {
    console.error('Error fetching applications:', error)
    throw error
  }
}

/**
 * Get application by reference number (for public tracking)
 */
export async function getApplicationByReference(referenceNumber: string): Promise<StaffApplication | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      [Query.equal('referenceNumber', referenceNumber)]
    )

    if (response.documents.length === 0) {
      return null
    }

    return parseApplication(response.documents[0])
  } catch (error) {
    console.error('Error fetching application by reference:', error)
    throw error
  }
}

/**
 * Get application by ID
 */
export async function getApplicationById(documentId: string): Promise<StaffApplication> {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      documentId
    )

    return parseApplication(response)
  } catch (error) {
    console.error('Error fetching application:', error)
    throw error
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  documentId: string,
  status: 'pending' | 'approved' | 'rejected' | 'interview-scheduled' | 'on-hold',
  reviewComments?: string,
  internalNotes?: string
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
    if (internalNotes) {
      updateData.internalNotes = internalNotes
    }

    const application = await databases.updateDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      documentId,
      updateData
    )

    return parseApplication(application)
  } catch (error) {
    console.error('Error updating application:', error)
    throw error
  }
}

/**
 * Schedule interview for application
 */
export async function scheduleInterview(
  documentId: string,
  interviewDate: string,
  interviewTime: string,
  interviewLocation: string,
  interviewNotes?: string
): Promise<StaffApplication> {
  try {
    const currentUser = await account.get()
    const userProfile = await databases.listDocuments(DATABASE_ID, USERS_TABLE_ID, [])
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const reviewedByName = user?.fullName || currentUser.name || 'Unknown'

    const updateData: any = {
      status: 'interview-scheduled' as const,
      interviewDate,
      interviewTime,
      interviewLocation,
      reviewedBy: currentUser.$id,
      reviewedByName,
      reviewDate: new Date().toISOString(),
    }

    if (interviewNotes) {
      updateData.interviewNotes = interviewNotes
    }

    const application = await databases.updateDocument(
      DATABASE_ID,
      STAFF_APPLICATIONS_TABLE_ID,
      documentId,
      updateData
    )

    return parseApplication(application)
  } catch (error) {
    console.error('Error scheduling interview:', error)
    throw error
  }
}

/**
 * Delete application
 */
export async function deleteApplication(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, STAFF_APPLICATIONS_TABLE_ID, documentId)
  } catch (error) {
    console.error('Error deleting application:', error)
    throw error
  }
}

/**
 * Export applications to CSV format
 */
export function exportApplicationsToCSV(applications: StaffApplication[]): string {
  const headers = [
    'Reference Number',
    'Applicant Name',
    'Email',
    'Phone',
    'Position',
    'Qualification',
    'Experience (Years)',
    'Status',
    'Applied Date',
    'Review Date',
    'Reviewed By'
  ]

  const rows = applications.map(app => [
    app.referenceNumber || app.applicationId,
    app.applicantName,
    app.email,
    app.phone,
    app.position,
    app.qualification,
    app.experience.toString(),
    app.status,
    new Date(app.$createdAt).toLocaleDateString(),
    app.reviewDate ? new Date(app.reviewDate).toLocaleDateString() : '',
    app.reviewedByName || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}
