import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon, UserIcon, Loader2Icon } from "lucide-react"
import { useAuthStore, type User } from "@/store/authStore"
import { uploadFile, deleteFile } from "@/lib/storage"
import type { UploadProgress } from "appwrite"

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || "")
  const [newFileId, setNewFileId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    employeeId: user?.employeeId || "",
    avatar: user?.avatar || "",
  })

  // Update form data when user changes (important for seeing updates after save)
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        employeeId: user.employeeId || "",
        avatar: user.avatar || "",
      })
      setPreviewUrl(user.avatar || "")
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Appwrite Storage
      const { fileId, url } = await uploadFile(file, (progress: UploadProgress) => {
        // Calculate percentage based on chunks uploaded
        const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100)
        setUploadProgress(percentage)
      })

      console.log('Upload successful:', { fileId, url })

      // Store the file ID for later deletion of old avatar
      setNewFileId(fileId)

      // Set preview and form data with the URL
      setPreviewUrl(url)
      setFormData(prev => ({
        ...prev,
        avatar: url,
      }))

      setIsUploading(false)
      console.log('Form data updated with avatar URL:', url)
    } catch (error) {
      setIsUploading(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      setUploadError(errorMessage)
      console.error("Upload error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      console.log('Submitting profile update with data:', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        employeeId: formData.employeeId,
        avatar: formData.avatar,
      })

      // If there's an old avatar and we uploaded a new one, delete the old one
      // Extract file ID from old avatar URL if it exists
      if (user.avatar && newFileId && user.avatar !== formData.avatar) {
        try {
          // Extract file ID from URL (format: .../files/{bucketId}/{fileId}/preview)
          const oldFileId = user.avatar.split('/').slice(-2, -1)[0]
          if (oldFileId && oldFileId !== newFileId) {
            console.log('Deleting old avatar:', oldFileId)
            await deleteFile(oldFileId)
          }
        } catch (error) {
          console.error("Failed to delete old avatar:", error)
          // Continue even if deletion fails
        }
      }

      // Update user profile in database
      const updateData: Partial<User> = {
        fullName: formData.fullName,
      }
      
      if (formData.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber
      }
      
      if (formData.employeeId) {
        updateData.employeeId = formData.employeeId
      }
      
      if (formData.avatar) {
        updateData.avatar = formData.avatar
      }
      
      console.log('Updating user profile with:', updateData)
      await updateUserProfile(user.$id, updateData)

      console.log('Profile updated successfully')
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to update profile:", error)
      setUploadError("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircleIcon className="h-5 w-5" />
          <p className="font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Upload Error Message */}
      {uploadError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{uploadError}</p>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {newFileId && !showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <p className="font-medium">⚠️ New image uploaded! Click "Save Changes" below to update your profile.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Profile Picture</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-16 w-16 text-muted-foreground" />
                  )}
                  {/* Loading overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2Icon className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                  ) : (
                    <CameraIcon className="h-5 w-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
              {/* Upload progress */}
              {isUploading && (
                <div className="w-full">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{user.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(user.dateJoined).toLocaleDateString()}
                </p>
              </div>
              {user.lastLogin && (
                <div>
                  <p className="text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold">Personal Information</h3>
            
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="h-10 w-full rounded-md border bg-muted px-3 text-sm text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="employeeId" className="text-sm font-medium">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    placeholder="Enter employee ID"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
