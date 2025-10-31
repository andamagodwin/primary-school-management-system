# Teachers Collection Setup Guide

## Collection Information
- **Collection ID**: Create a new collection in Appwrite and save the ID
- **Collection Name**: teachers
- **Environment Variable**: `VITE_APPWRITE_TEACHERS_COLLECTION_ID`

## Attributes

Create the following attributes in your Appwrite teachers collection:

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| teacherId | String | 255 | Yes | - | No |
| firstName | String | 100 | Yes | - | No |
| lastName | String | 100 | Yes | - | No |
| email | Email | 255 | Yes | - | No |
| phone | String | 20 | Yes | - | No |
| dateOfBirth | String | 10 | Yes | - | No |
| gender | Enum | - | Yes | - | No |
| address | String | 500 | No | - | No |
| avatar | URL | 2000 | No | - | No |
| employeeNumber | String | 50 | Yes | - | No |
| dateOfJoining | String | 10 | Yes | - | No |
| qualification | String | 255 | Yes | - | No |
| specialization | String | 255 | Yes | - | No |
| subjects | String | 100 | Yes | - | Yes |
| classes | String | 10 | Yes | - | Yes |
| employmentType | Enum | - | Yes | - | No |
| status | Enum | - | Yes | active | No |
| salary | Float | - | No | - | No |
| bankDetails | String | 500 | No | - | No |
| emergencyContact | String | 1000 | No | - | No |
| notes | String | 2000 | No | - | No |
| createdBy | String | 255 | Yes | - | No |

## Enum Values

### gender
- Male
- Female

### employmentType
- Full-time
- Part-time
- Contract

### status
- active
- inactive
- on-leave
- terminated

## Indexes

Create these indexes for better query performance:

1. **employeeNumber_index**
   - Type: Key
   - Attribute: employeeNumber
   - Order: ASC

2. **email_index**
   - Type: Key
   - Attribute: email
   - Order: ASC

3. **status_index**
   - Type: Key
   - Attribute: status
   - Order: ASC

4. **specialization_index**
   - Type: Key
   - Attribute: specialization
   - Order: ASC

5. **created_index**
   - Type: Key
   - Attribute: $createdAt
   - Order: DESC

## Permissions

Set the following permissions:

### Collection Permissions:
- **Create**: Any authenticated user can create (or restrict to admin only)
- **Read**: Any authenticated user can read
- **Update**: Document creator or admin can update
- **Delete**: Admin only

### Document Security:
You can use Appwrite's permission system to ensure:
- Teachers can view their own profile
- Admins can view and edit all teachers
- Staff can view teacher information

Example permission rules:
```
Read: role:all
Create: role:admin
Update: role:admin, user:[userId]
Delete: role:admin
```

## Notes

1. **Employee Number Format**: Auto-generated in format `TS-YEAR-SEQUENCE` (e.g., TS-2025-001)
   - TS = Teacher/Staff
   - YEAR = Current year
   - SEQUENCE = 3-digit sequential number

2. **Subjects Array**: Stores multiple subjects the teacher can teach (e.g., ["Mathematics", "Science"])

3. **Classes Array**: Stores class levels assigned to the teacher (e.g., ["P1", "P2", "P5"])

4. **Emergency Contact**: Stored as JSON string containing:
   ```json
   {
     "name": "Contact Name",
     "phone": "Phone Number",
     "relationship": "Relationship"
   }
   ```

5. **Avatar**: URL to the teacher's profile photo stored in Appwrite Storage

6. **Status Values**:
   - `active`: Currently employed and working
   - `inactive`: Temporarily not working
   - `on-leave`: On approved leave
   - `terminated`: No longer employed

## Setup Steps

1. Create a new collection in Appwrite Database
2. Copy the Collection ID
3. Add it to your `.env` file as `VITE_APPWRITE_TEACHERS_COLLECTION_ID`
4. Create all attributes listed above with exact names and types
5. Set up the enum values for gender, employmentType, and status
6. Create the recommended indexes
7. Configure permissions based on your security requirements
8. Test by creating a teacher through the application

## Environment Variable

Add to your `.env` file:
```
VITE_APPWRITE_TEACHERS_COLLECTION_ID=your_teachers_collection_id_here
```
