# Appwrite Storage Setup Guide

## Creating a Storage Bucket for Profile Images

### Step 1: Create Storage Bucket

1. Go to your [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **"Create Bucket"**
5. Fill in the details:
   - **Name**: `avatars` (or any name you prefer)
   - **Bucket ID**: Leave auto-generated or use a custom ID
   - **Permissions**: We'll configure this next
6. Click **"Create"**
7. **Copy the Bucket ID** - you'll need this for your `.env` file

### Step 2: Configure Bucket Settings

1. Click on your newly created bucket
2. Go to the **"Settings"** tab
3. Configure the following:

#### File Security
- **Maximum File Size**: `10485760` (10MB in bytes)
- **Allowed File Extensions**: `jpg, jpeg, png, gif, webp`
- **Compression**: `gzip` (optional)
- **Encryption**: Enable if needed
- **Antivirus**: Enable if available

### Step 3: Set Permissions

In the **"Settings"** tab, under **Permissions**:

#### For Development (Simple permissions):
- **File Security**: Any
- **Permissions**:
  - **Create**: Role: `Users` (Any authenticated user can upload)
  - **Read**: Role: `Any` (Anyone can view images)
  - **Update**: Role: `Users` (Any authenticated user can update)
  - **Delete**: Role: `Users` (Any authenticated user can delete)

#### For Production (Recommended permissions):
- **Create**: 
  - Role: `Users` (Authenticated users)
- **Read**: 
  - Role: `Any` (Public read access for avatar display)
- **Update**: 
  - Role: `User:[USER_ID]` (Users can only update their own files)
  - You'll need to set file-level permissions in your code
- **Delete**: 
  - Role: `User:[USER_ID]` (Users can only delete their own files)
  - You'll need to set file-level permissions in your code

### Step 4: Update Environment Variables

1. Open your `.env` file
2. Add your bucket ID:

```env
VITE_APPWRITE_STORAGE_BUCKET_ID="your_bucket_id_here"
```

### Step 5: Test the Upload

1. Start your development server: `npm run dev`
2. Log in to your application
3. Navigate to Profile page (click on your name in sidebar)
4. Click the camera icon to upload an image
5. Select an image file (JPEG, PNG, GIF, or WebP)
6. Wait for the upload to complete (you'll see a progress bar)
7. Click "Save Changes" to update your profile

## How It Works

### Upload Process

1. **User selects image** → File validation (type, size)
2. **Upload to Appwrite Storage** → Progress tracking
3. **Get file URL** → Preview generation
4. **Save URL to database** → User profile update
5. **Delete old avatar** → Cleanup (if replacing existing avatar)

### File Validation

The upload function validates:
- ✅ File type: Only images (JPEG, PNG, GIF, WebP)
- ✅ File size: Maximum 10MB
- ✅ File exists: Not null/undefined

### URL Generation

Appwrite generates two types of URLs:
- **Preview URL**: Optimized image with custom dimensions
  - Used for display in the UI
  - Parameters: width, height, quality
  - Example: `.../files/{bucketId}/{fileId}/preview?width=2000&height=2000`
- **Download URL**: Original file
  - Used for downloading the full-resolution image
  - Example: `.../files/{bucketId}/{fileId}/download`

## Storage Utilities

The following utility functions are available in `src/lib/storage.ts`:

### `uploadFile(file, onProgress?)`
Uploads a file to Appwrite Storage with optional progress tracking.

```typescript
const { fileId, url } = await uploadFile(file, (progress) => {
  console.log('Upload progress:', progress)
})
```

### `deleteFile(fileId)`
Deletes a file from Appwrite Storage.

```typescript
await deleteFile(fileId)
```

### `getFilePreview(fileId, width?, height?)`
Gets a preview URL for an image with optional dimensions.

```typescript
const url = getFilePreview(fileId, 500, 500)
```

### `getFileDownload(fileId)`
Gets the download URL for a file.

```typescript
const url = getFileDownload(fileId)
```

## Troubleshooting

### Upload Fails with "Invalid file type"
- Make sure you're uploading an image file (JPEG, PNG, GIF, WebP)
- Check the file extension

### Upload Fails with "File too large"
- Maximum file size is 10MB
- Compress or resize your image before uploading

### Permission Denied Error
- Check your bucket permissions in Appwrite Console
- Make sure "Users" role has "Create" permission
- Verify you're authenticated

### Image Not Displaying
- Check that "Any" role has "Read" permission for public access
- Verify the URL in the database is correct
- Check browser console for CORS errors

### Old Avatar Not Deleted
- Make sure the file ID extraction logic is correct
- Check that you have "Delete" permission
- Verify the old avatar URL format matches expected pattern

## Best Practices

1. **Always validate files** before uploading (type, size)
2. **Show upload progress** for better UX
3. **Handle errors gracefully** with user-friendly messages
4. **Delete old files** when replacing to save storage space
5. **Use preview URLs** instead of full downloads for display
6. **Set appropriate permissions** for security
7. **Compress images** on the client before upload (optional)
8. **Use CDN** for better performance (Appwrite includes CDN)

## Cost Considerations

Appwrite Cloud Free Tier includes:
- **Storage**: 2GB
- **Bandwidth**: 2GB per month

For production apps:
- Monitor storage usage
- Implement file size limits
- Consider image compression
- Clean up unused files periodically

## Next Steps

1. ✅ Create storage bucket
2. ✅ Configure permissions
3. ✅ Add bucket ID to `.env`
4. ✅ Test image upload
5. 🔄 Implement image compression (optional)
6. 🔄 Add file management UI (optional)
7. 🔄 Set up CDN optimization (optional)
