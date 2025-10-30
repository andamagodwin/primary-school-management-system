# Primary School Management System - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Appwrite Backend

#### Step 1: Create Appwrite Project
1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
2. Create a new account or sign in
3. Click "Create Project"
4. Name your project (e.g., "School Management System")
5. Copy your **Project ID**

#### Step 2: Configure Web Platform
1. In your project dashboard, click "Settings" → "Platforms"
2. Click "Add Platform" → "Web"
3. Add your app details:
   - **Name**: School Management Web App
   - **Hostname**: `localhost` (for development)
4. Click "Create"

#### Step 3: Create Database
1. Go to "Databases" in the left sidebar
2. Click "Create Database"
3. Name it (e.g., "school_db")
4. Copy your **Database ID**

#### Step 4: Create Users Collection
1. Inside your database, click "Create Collection"
2. Name it "users"
3. Copy your **Collection ID**
4. Configure the following attributes:

| Attribute Name | Type | Size | Required | Array | Default |
|---------------|------|------|----------|-------|---------|
| userId | String | 255 | Yes | No | - |
| email | Email | 320 | Yes | No | - |
| fullName | String | 255 | Yes | No | - |
| userType | Enum | - | Yes | No | - |
| phoneNumber | String | 20 | No | No | - |
| status | Enum | - | Yes | No | active |
| avatar | URL | 2000 | No | No | - |
| employeeId | String | 100 | No | No | - |
| dateJoined | DateTime | - | Yes | No | - |
| lastLogin | DateTime | - | No | No | - |

**Enum Values:**
- `userType`: admin, teacher, staff, parent
- `status`: active, inactive, suspended

**IMPORTANT - Create Index:**
5. Go to the "Indexes" tab of your users collection
6. Click "Create Index"
   - **Key**: userId_index
   - **Type**: Key
   - **Attributes**: userId
   - **Order**: ASC
7. Click "Create"

This index is required for efficient user lookups during login/registration.

#### Step 5: Set Collection Permissions
1. In the "Settings" tab of your users collection
2. Under "Permissions", configure:
   - **Read Access**: 
     - Add role: `Users` (Any authenticated user can read)
   - **Create Access**: 
     - Add role: `Users` (Any authenticated user can create - for registration)
   - **Update Access**: 
     - Add role: `User:*` (Users can update their own documents)
     - Add role: `Users` (For admin updates - you can refine this later)
   - **Delete Access**: 
     - Add role: `Users` (For admin deletion - you can refine this later)

#### Step 6: Enable Authentication
1. Go to "Auth" in the left sidebar
2. Under "Settings", enable:
   - ✅ Email/Password authentication
3. (Optional) Configure session length and other auth settings

### 3. Configure Environment Variables

1. Open the `.env` file in the root directory
2. Fill in your Appwrite credentials:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=your_database_id_here
VITE_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar with logout
│   └── ProtectedRoute.tsx   # Route guard for authentication
├── layouts/
│   └── DashboardLayout.tsx  # Main layout with sidebar and routes
├── pages/
│   ├── LoginPage.tsx        # User login
│   ├── RegisterPage.tsx     # User registration
│   ├── DashboardPage.tsx    # Main dashboard
│   ├── StudentsPage.tsx     # Student management
│   ├── TeachersPage.tsx     # Teacher management
│   ├── ClassesPage.tsx      # Class management
│   ├── AttendancePage.tsx   # Attendance tracking
│   └── SettingsPage.tsx     # Application settings
├── store/
│   └── authStore.ts         # Zustand auth state management
├── lib/
│   ├── appwrite.ts          # Appwrite client configuration
│   └── utils.ts             # Utility functions
└── App.tsx                  # Root component with routing
```

## 🔐 Authentication Flow

### Registration
1. User fills out registration form with:
   - Full Name
   - Email
   - Password
   - User Type (admin/teacher/staff/parent)
2. System creates Appwrite account
3. Creates user profile in users collection
4. Auto-login and redirect to dashboard

### Login
1. User enters email and password
2. System validates credentials via Appwrite
3. Fetches user profile from database
4. Stores auth state in Zustand (persisted to localStorage)
5. Redirects to dashboard

### Protected Routes
- All routes except `/login` and `/register` require authentication
- Unauthenticated users are automatically redirected to login
- Auth state is checked on app mount using `checkAuth()`

## 🎨 Features

- ✅ User authentication (login/register/logout)
- ✅ Role-based user types (admin/teacher/staff/parent)
- ✅ Protected routes with automatic redirection
- ✅ Responsive sidebar navigation
- ✅ Mobile-friendly hamburger menu
- ✅ Persistent auth state (survives page refresh)
- ✅ User profile display in sidebar
- ✅ Tab-based routing with React Router

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (with persist middleware)
- **Routing**: React Router DOM v7
- **Backend**: Appwrite (Auth + Database)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📝 Next Steps

1. **Refine Permissions**: Update collection permissions for proper role-based access control
2. **Add More Fields**: Extend the users collection with additional fields as needed
3. **Implement CRUD**: Add create/read/update/delete functionality for students, teachers, classes
4. **Add Search**: Implement search and filtering across entities
5. **Upload Support**: Add profile picture upload using Appwrite Storage
6. **Reports**: Create attendance reports and analytics
7. **Notifications**: Add email notifications for important events

## 🐛 Troubleshooting

### Import Errors
If you see "Cannot find module '@/...'", restart your TypeScript server:
- In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Appwrite Connection Failed
- Verify your `.env` file has the correct credentials
- Check that your Appwrite project has the web platform configured with `localhost`
- Ensure your database and collection IDs are correct

### Authentication Not Working
- Verify Email/Password auth is enabled in Appwrite console
- Check that collection permissions allow user creation and reading
- Check browser console for detailed error messages

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📚 Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [React Router Documentation](https://reactrouter.com)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Appwrite console for detailed error messages
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly
