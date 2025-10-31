import { ID } from 'appwrite'
import type { UploadProgress } from 'appwrite'
import { storage, STORAGE_BUCKET_ID } from './appwrite'

/**
 * Upload a file to Appwrite Storage
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns The file ID and URL
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ fileId: string; url: string }> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided')
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    // Check file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed')
    }

    // Generate unique file ID
    const fileId = ID.unique()

    // Upload file with progress tracking
    const response = await storage.createFile(
      STORAGE_BUCKET_ID,
      fileId,
      file,
      undefined, // permissions - set in bucket settings
      onProgress
    )

    // Get file URL for preview
    const url = storage.getFilePreview(
      STORAGE_BUCKET_ID,
      response.$id,
      2000, // width
      2000, // height
      undefined, // gravity
      100 // quality
    )

    return {
      fileId: response.$id,
      url: url.toString(),
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

/**
 * Delete a file from Appwrite Storage
 * @param fileId - The ID of the file to delete
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    if (!fileId) {
      throw new Error('No file ID provided')
    }

    await storage.deleteFile(STORAGE_BUCKET_ID, fileId)
  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}

/**
 * Get file preview URL
 * @param fileId - The ID of the file
 * @param width - Optional width
 * @param height - Optional height
 * @returns The preview URL
 */
export function getFilePreview(
  fileId: string,
  width: number = 2000,
  height: number = 2000
): string {
  try {
    if (!fileId) {
      throw new Error('No file ID provided')
    }

    const url = storage.getFilePreview(
      STORAGE_BUCKET_ID,
      fileId,
      width,
      height,
      undefined,
      100
    )

    return url.toString()
  } catch (error) {
    console.error('Get file preview error:', error)
    throw error
  }
}

/**
 * Get file download URL
 * @param fileId - The ID of the file
 * @returns The download URL
 */
export function getFileDownload(fileId: string): string {
  try {
    if (!fileId) {
      throw new Error('No file ID provided')
    }

    const url = storage.getFileDownload(STORAGE_BUCKET_ID, fileId)
    return url.toString()
  } catch (error) {
    console.error('Get file download error:', error)
    throw error
  }
}
