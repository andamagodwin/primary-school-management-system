# Classes Collection Setup Guide

## Collection Information
- **Collection ID**: Create a new collection in Appwrite and save the ID
- **Collection Name**: classes
- **Environment Variable**: `VITE_APPWRITE_CLASSES_COLLECTION_ID`

## Attributes

Create the following attributes in your Appwrite classes collection:

| Attribute Name | Type | Size | Required | Default | Array |
|---------------|------|------|----------|---------|-------|
| classId | String | 255 | Yes | - | No |
| name | String | 100 | Yes | - | No |
| grade | Enum | - | Yes | - | No |
| classTeacherId | String | 255 | No | - | No |
| classTeacherName | String | 200 | No | - | No |
| roomNumber | String | 20 | No | - | No |
| capacity | Integer | - | Yes | - | No |
| currentStudents | Integer | - | Yes | 0 | No |
| subjects | String | 100 | Yes | - | Yes |
| schedule | String | 5000 | No | - | No |
| academicYear | String | 10 | Yes | - | No |
| term | Enum | - | Yes | - | No |
| status | Enum | - | Yes | active | No |
| notes | String | 2000 | No | - | No |
| createdBy | String | 255 | Yes | - | No |

## Enum Values

### grade
- P1
- P2
- P3
- P4
- P5
- P6
- P7

### term
- Term1
- Term2
- Term3

### status
- active
- inactive
- completed

## Indexes

Create these indexes for better query performance:

1. **grade_index**
   - Type: Key
   - Attribute: grade
   - Order: ASC

2. **teacher_index**
   - Type: Key
   - Attribute: classTeacherId
   - Order: ASC

3. **academic_year_index**
   - Type: Key
   - Attribute: academicYear
   - Order: DESC

4. **status_index**
   - Type: Key
   - Attribute: status
   - Order: ASC

5. **created_index**
   - Type: Key
   - Attribute: $createdAt
   - Order: DESC

## Permissions

Set the following permissions:

### Collection Permissions:
- **Create**: Admin or authorized staff only
- **Read**: Any authenticated user can read
- **Update**: Admin or class teacher can update
- **Delete**: Admin only

### Document Security:
Example permission rules:
```
Read: role:all
Create: role:admin, role:staff
Update: role:admin, user:[classTeacherId]
Delete: role:admin
```

## Notes

1. **Class Naming**: Class names should clearly identify the grade level (e.g., "Primary 1", "P1", "Grade 1")

2. **Grade**: Standard primary levels P1 through P7

3. **Class Teacher**: 
   - `classTeacherId`: Reference to the teacher's document ID
   - `classTeacherName`: Denormalized for quick display without joins

4. **Capacity vs Current Students**:
   - `capacity`: Maximum number of students the class can hold
   - `currentStudents`: Actual number of enrolled students (can be auto-calculated)

5. **Subjects Array**: List of subjects taught in this class
   - Example: ["Mathematics", "English", "Science", "Social Studies"]

6. **Schedule**: Optional JSON string containing class timetable
   ```json
   {
     "Monday": {
       "08:00-09:00": "Mathematics",
       "09:00-10:00": "English"
     }
   }
   ```

7. **Academic Year**: Year when the class is active (e.g., "2025")

8. **Term**: School term/semester (Term1, Term2, Term3)
   - Note: Values have no spaces to match Appwrite enum format

9. **Status Values**:
    - `active`: Currently running class
    - `inactive`: Temporarily paused
    - `completed`: Class has finished (end of year)

## Relationships

### With Students Collection:
- Students reference the class they belong to
- Query students by classId to get class roster
- Update `currentStudents` count when students enroll/leave

### With Teachers Collection:
- `classTeacherId` references teacher document
- A teacher can be assigned to multiple classes
- Use `getClassesByTeacher()` to find all classes for a teacher

## Setup Steps

1. Create a new collection in Appwrite Database
2. Copy the Collection ID
3. Add it to your `.env` file as `VITE_APPWRITE_CLASSES_COLLECTION_ID`
4. Create all attributes listed above with exact names and types
5. Set up the enum values for grade, term, and status
6. Create the recommended indexes (especially grade_section for efficient querying)
7. Configure permissions based on your security requirements
8. Test by creating a class through the application

## Environment Variable

Add to your `.env` file:
```
VITE_APPWRITE_CLASSES_COLLECTION_ID=your_classes_collection_id_here
```

## Future Enhancements

Consider adding these features later:
- Link to timetable/schedule management
- Attendance tracking per class
- Performance metrics (average grades, etc.)
- Class resources and materials
- Parent-teacher meeting schedules
- Class announcements
