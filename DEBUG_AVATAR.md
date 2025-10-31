# Debug Guide: Avatar Upload Issue

## The Problem

The avatar URL is not being saved to the database even though the upload to storage is successful.

## Root Cause

The `VITE_APPWRITE_USERS_COLLECTION_ID` in your `.env` file is set to `"users"` (the collection name) instead of the actual collection ID.

## Solution

### Step 1: Get Your Collection ID

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Go to **Databases** → Click your database
4. Click on the **users** collection
5. Look at the URL or the collection details - you'll see the Collection ID (it looks like: `6903c51a00278dd27880`)
6. **Copy this ID**

### Step 2: Update .env File

Update your `.env` file:

```env
VITE_APPWRITE_USERS_COLLECTION_ID="your_actual_collection_id_here"
```

**Example:**
```env
VITE_APPWRITE_USERS_COLLECTION_ID="6903c51a00278dd27880"
```

### Step 3: Restart Development Server

After changing the `.env` file:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
npm run dev
```

## How to Verify It's Fixed

1. **Check the console logs** when you upload an image:
   - You should see: `"Updating document:"` with your collection ID
   - If it shows `collectionId: "users"` → ❌ Wrong (it's the name, not ID)
   - If it shows `collectionId: "6903..."` → ✓ Correct (actual ID)

2. **After upload and save:**
   - Check browser console for `"Document updated successfully:"`
   - Go to Appwrite Console → Database → Users collection
   - Find your user document
   - The `avatar` field should now have the URL

## Still Not Working?

If the collection ID is correct but it's still not working, check:

### 1. Collection Permissions

Go to Appwrite Console → Your Database → users collection → Settings tab:

**Update Permissions should include:**
- Role: `Users` (Any authenticated user)
- OR Role: `User:[USER_ID]` (Specific user can update their own)

### 2. Attribute Exists

Make sure the `avatar` attribute exists in your users collection:
- Go to Appwrite Console → Database → users collection → Attributes tab
- Look for `avatar` attribute
- Type should be: **URL** or **String**
- If it doesn't exist, create it:
  - Click "Create Attribute"
  - Type: **URL**
  - Key: `avatar`
  - Size: 2000
  - Required: No
  - Array: No

### 3. Check Browser Console

Open DevTools (F12) and look for errors:

**Expected successful flow:**
```
Upload successful: { fileId: "...", url: "..." }
Form data updated with avatar URL: https://...
Submitting profile update with data: { avatar: "https://..." }
Updating document: { collectionId: "6903...", data: { avatar: "..." } }
Document updated successfully: { avatar: "https://..." }
Profile updated successfully
```

**Common errors:**
- `"Document not found"` → Wrong collection ID or user ID
- `"Missing required attribute"` → The avatar attribute doesn't exist
- `"Unauthorized"` → Permission issue
- `"Invalid URL"` → URL format issue

## Quick Test

Run this in your browser console while on the profile page:

```javascript
// Get the current user from Zustand store
const user = JSON.parse(localStorage.getItem('auth-storage')).state.user

console.log('User ID:', user.$id)
console.log('Current avatar:', user.avatar)
console.log('Collection ID from env:', import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID)
```

This will show you if the collection ID is being read correctly.
