# Environment Variables Setup

This document explains all the environment variables needed for the Primary School Management System.

## Required Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6901e9f80008ced07f36
VITE_APPWRITE_DATABASE_ID=6903c51a00278dd27880

# Table IDs (Appwrite TablesDB - table names are used as IDs)
VITE_APPWRITE_USERS_TABLE_ID=users
VITE_APPWRITE_STUDENTS_TABLE_ID=students
VITE_APPWRITE_TEACHERS_TABLE_ID=teachers
VITE_APPWRITE_CLASSES_TABLE_ID=classes
VITE_APPWRITE_EVENTS_TABLE_ID=events
VITE_APPWRITE_MARKS_TABLE_ID=marks
VITE_APPWRITE_EXAMS_TABLE_ID=exams
VITE_APPWRITE_ATTENDANCE_TABLE_ID=attendance
VITE_APPWRITE_LESSONPLANS_TABLE_ID=lessonPlans
VITE_APPWRITE_STAFF_APPLICATIONS_TABLE_ID=staffApplications
VITE_APPWRITE_REPORT_COMMENTS_TABLE_ID=reportComments
VITE_APPWRITE_FINANCIAL_DATA_TABLE_ID=financialData
VITE_APPWRITE_AUDIT_LOGS_TABLE_ID=auditLogs
VITE_APPWRITE_GENERATED_REPORTS_TABLE_ID=generatedReports
VITE_APPWRITE_INVENTORY_TABLE_ID=inventory
VITE_APPWRITE_LIBRARY_BOOKS_TABLE_ID=libraryBooks
VITE_APPWRITE_LIBRARY_BORROWING_TABLE_ID=libraryBorrowing
VITE_APPWRITE_FEE_PAYMENTS_TABLE_ID=feePayments
VITE_APPWRITE_BANK_NOTIFICATIONS_TABLE_ID=bankNotifications

# Storage Bucket ID (for file uploads)
VITE_APPWRITE_STORAGE_BUCKET_ID=your-storage-bucket-id
```

## Database Tables

The following tables have been created in your Appwrite database:

1. **users** - User accounts and profiles
2. **students** - Student information
3. **teachers** - Teacher information
4. **classes** - Class/grade information
5. **events** - School events and activities
6. **marks** - Student marks/grades
7. **exams** - Exam papers uploaded by teachers
8. **attendance** - Daily attendance records
9. **lessonPlans** - Lesson plans uploaded by teachers
10. **staffApplications** - Staff job applications
11. **reportComments** - Director of Studies comments on student reports
12. **financialData** - Financial budgets, revenue, and expenses
13. **auditLogs** - System audit logs for all user actions
14. **generatedReports** - Generated PDF reports
15. **inventory** - School materials inventory
16. **libraryBooks** - Library books catalog
17. **libraryBorrowing** - Library borrowing records
18. **feePayments** - Student fee payment records
19. **bankNotifications** - Bank transaction notifications

## Default Values

The application includes default values for all table IDs (using the table names), so if you don't set environment variables, it will still work with the default table names. However, it's recommended to set them explicitly for clarity and flexibility.

## Getting Your Appwrite Credentials

1. **Project ID**: Found in your Appwrite project settings
2. **Database ID**: Found in your Appwrite database settings
3. **Table IDs**: The table names themselves (e.g., "users", "students")
4. **Storage Bucket ID**: Found in your Appwrite storage bucket settings

## Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the Vite application
- The `.env` file should be added to `.gitignore` to keep credentials secure
- Use `.env.example` as a template (without actual credentials) for version control

