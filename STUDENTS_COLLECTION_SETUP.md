# Students Collection Setup Guide

## Database Collection: Students

### Collection Information
- **Collection Name**: students
- **Collection ID**: Copy this after creation and add to `.env`

### Attributes to Create

| Attribute Name | Type | Size | Required | Array | Default | Description |
|---------------|------|------|----------|-------|---------|-------------|
| studentId | String | 100 | Yes | No | - | Unique student identifier |
| firstName | String | 100 | Yes | No | - | Student's first name |
| lastName | String | 100 | Yes | No | - | Student's last name |
| dateOfBirth | DateTime | - | Yes | No | - | Student's date of birth |
| gender | Enum | - | Yes | No | - | Student's gender |
| grade | Enum | - | Yes | No | - | Current grade/class |
| avatar | URL | 2000 | No | No | - | Student's profile photo |
| parentName | String | 255 | Yes | No | - | Parent/Guardian full name |
| parentEmail | Email | 320 | No | No | - | Parent/Guardian email |
| parentPhone | String | 20 | Yes | No | - | Parent/Guardian phone |
| parentUserId | String | 255 | No | No | - | Reference to parent's user account |
| address | String | 500 | No | No | - | Home address |
| medicalInfo | String | 1000 | No | No | - | Medical conditions/allergies |
| enrollmentDate | DateTime | - | Yes | No | - | Date student enrolled |
| status | Enum | - | Yes | No | active | Student's current status |
| admissionNumber | String | 50 | Yes | No | - | Unique admission number |
| createdBy | String | 255 | Yes | No | - | User ID of who created record |

**Note:** Appwrite automatically provides `$createdAt` and `$updatedAt` fields, so you don't need to create them manually.

### Enum Values

#### gender
- `Male`
- `Female`

#### grade
- `P1`
- `P2`
- `P3`
- `P4`
- `P5`
- `P6`
- `P7`

#### status
- `active` (Currently enrolled)
- `inactive` (Temporarily not attending)
- `graduated` (Completed P7)
- `transferred` (Moved to another school)
- `withdrawn` (Left school)

## Setup Steps

### 1. Create Collection in Appwrite Console

1. Go to your Appwrite Console → Databases
2. Select your database
3. Click "Create Collection"
4. Name: `students`
5. Click "Create"
6. **Copy the Collection ID**

### 2. Create Attributes

For each attribute in the table above:
1. Click "Create Attribute"
2. Select the type
3. Fill in the details
4. Click "Create"

**Important Notes:**
- Create enum attributes first, then set their elements
- For DateTime attributes, no size is needed
- Make sure `studentId` and `admissionNumber` are unique (add index)

### 3. Create Indexes

Create these indexes for better query performance:

| Index Key | Type | Attributes | Order |
|-----------|------|------------|-------|
| studentId_index | Key | studentId | ASC |
| admissionNumber_index | Key | admissionNumber | ASC |
| grade_index | Key | grade | ASC |
| status_index | Key | status | ASC |
| parent_index | Key | parentUserId | ASC |

### 4. Set Collection Permissions

In the collection Settings → Permissions:

**For Development:**
- **Create**: Role `Users` (Any authenticated user)
- **Read**: Role `Users` (Any authenticated user)
- **Update**: Role `Users` (Any authenticated user)
- **Delete**: Role `Users` (Any authenticated user)

**For Production (Recommended):**
- **Create**: Role `Users` (Teachers and admins only - refine later)
- **Read**: Role `Users` (Any authenticated user can view)
- **Update**: Role `Users` (Teachers and admins only - refine later)
- **Delete**: Role `Users` (Admins only - refine later)

### 5. Update .env File

Add the collection ID to your `.env`:

```env
VITE_APPWRITE_STUDENTS_COLLECTION_ID="your_students_collection_id_here"
```

## Parent User Creation

When creating a student, if the parent doesn't have a user account:

### Option 1: Create Parent User Automatically
- Generate a temporary password
- Send email with login credentials
- Parent can change password on first login

### Option 2: Send Invitation Link
- Create user account with random password
- Send password reset link via email
- Parent sets their own password

### Option 3: Manual Registration
- Admin provides registration link to parent
- Parent registers themselves
- Link student to parent account after registration

## Student Admission Number Format

**Format: `HS-YEAR-GRADE-SEQUENCE`**

Where:
- **HS** = Hillside Schools (school identifier)
- **YEAR** = Current year (e.g., 2025)
- **GRADE** = Student's grade (P1-P7)
- **SEQUENCE** = Sequential number (001, 002, 003, etc.)

### Examples:
- `HS-2025-P1-001` → First P1 student admitted in 2025
- `HS-2025-P1-002` → Second P1 student admitted in 2025
- `HS-2025-P7-045` → 45th P7 student admitted in 2025
- `HS-2026-P3-012` → 12th P3 student admitted in 2026

### Benefits:
- ✅ Unique identifier for each student
- ✅ School branding (HS = Hillside Schools)
- ✅ Easy to identify enrollment year
- ✅ Grade level visible at a glance
- ✅ Sequential tracking per grade per year
- ✅ Sortable and searchable

### Auto-Generation:
The system automatically generates the next available admission number when creating a student:

```javascript
// System automatically:
1. Gets current year: 2025
2. Identifies grade: P1
3. Finds last student in P1 for 2025: HS-2025-P1-015
4. Increments sequence: 016
5. Generates: HS-2025-P1-016
```

### Manual Override:
While the system auto-generates admission numbers, admins can manually edit them if needed (e.g., for transferred students or special cases).

## Required Files to Update

1. `.env` - Add students collection ID
2. `src/lib/appwrite.ts` - Export students collection ID
3. `src/pages/AddStudentPage.tsx` - Add image upload and API calls
4. Create `src/lib/students.ts` - Student management functions
5. Update `src/pages/StudentsPage.tsx` - Fetch and display students

## Next Steps After Setup

1. ✅ Create students collection with all attributes
2. ✅ Create indexes for better performance
3. ✅ Set appropriate permissions
4. ✅ Add collection ID to `.env`
5. ✅ Test student creation
6. 🔄 Implement student list view
7. 🔄 Add edit student functionality
8. 🔄 Add delete student functionality
9. 🔄 Link students to parent users
