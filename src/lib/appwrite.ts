import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };

// Collection and Database IDs - Update these with your actual IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '6903c51a00278dd27880';

// Table IDs (Appwrite TablesDB uses table names as IDs)
export const USERS_TABLE_ID = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users';
export const STUDENTS_TABLE_ID = import.meta.env.VITE_APPWRITE_STUDENTS_TABLE_ID || 'students';
export const TEACHERS_TABLE_ID = import.meta.env.VITE_APPWRITE_TEACHERS_TABLE_ID || 'teachers';
export const CLASSES_TABLE_ID = import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID || 'classes';
export const EVENTS_TABLE_ID = import.meta.env.VITE_APPWRITE_EVENTS_TABLE_ID || 'events';
export const MARKS_TABLE_ID = import.meta.env.VITE_APPWRITE_MARKS_TABLE_ID || 'marks';
export const EXAMS_TABLE_ID = import.meta.env.VITE_APPWRITE_EXAMS_TABLE_ID || 'exams';
export const ATTENDANCE_TABLE_ID = import.meta.env.VITE_APPWRITE_ATTENDANCE_TABLE_ID || 'attendance';
export const LESSONPLANS_TABLE_ID = import.meta.env.VITE_APPWRITE_LESSONPLANS_TABLE_ID || 'lessonPlans';
export const STAFF_APPLICATIONS_TABLE_ID = import.meta.env.VITE_APPWRITE_STAFF_APPLICATIONS_TABLE_ID || 'staffApplications';
export const REPORT_COMMENTS_TABLE_ID = import.meta.env.VITE_APPWRITE_REPORT_COMMENTS_TABLE_ID || 'reportComments';
export const FINANCIAL_DATA_TABLE_ID = import.meta.env.VITE_APPWRITE_FINANCIAL_DATA_TABLE_ID || 'financialData';
export const AUDIT_LOGS_TABLE_ID = import.meta.env.VITE_APPWRITE_AUDIT_LOGS_TABLE_ID || 'auditLogs';
export const GENERATED_REPORTS_TABLE_ID = import.meta.env.VITE_APPWRITE_GENERATED_REPORTS_TABLE_ID || 'generatedReports';
export const INVENTORY_TABLE_ID = import.meta.env.VITE_APPWRITE_INVENTORY_TABLE_ID || 'inventory';
export const LIBRARY_BOOKS_TABLE_ID = import.meta.env.VITE_APPWRITE_LIBRARY_BOOKS_TABLE_ID || 'libraryBooks';
export const LIBRARY_BORROWING_TABLE_ID = import.meta.env.VITE_APPWRITE_LIBRARY_BORROWING_TABLE_ID || 'libraryBorrowing';
export const FEE_PAYMENTS_TABLE_ID = import.meta.env.VITE_APPWRITE_FEE_PAYMENTS_TABLE_ID || 'feePayments';
export const BANK_NOTIFICATIONS_TABLE_ID = import.meta.env.VITE_APPWRITE_BANK_NOTIFICATIONS_TABLE_ID || 'bankNotifications';
export const SYSTEM_BACKUPS_TABLE_ID = import.meta.env.VITE_APPWRITE_SYSTEM_BACKUPS_TABLE_ID || 'systemBackups';
export const USER_PERMISSIONS_TABLE_ID = import.meta.env.VITE_APPWRITE_USER_PERMISSIONS_TABLE_ID || 'userPermissions';
export const SCHOOL_SETTINGS_TABLE_ID = import.meta.env.VITE_APPWRITE_SCHOOL_SETTINGS_TABLE_ID || 'schoolSettings';

// Storage Bucket ID
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || '';

// Legacy collection IDs (for backward compatibility)
export const USERS_COLLECTION_ID = USERS_TABLE_ID;
export const STUDENTS_COLLECTION_ID = STUDENTS_TABLE_ID;
export const TEACHERS_COLLECTION_ID = TEACHERS_TABLE_ID;
export const CLASSES_COLLECTION_ID = CLASSES_TABLE_ID;
export const EVENTS_COLLECTION_ID = EVENTS_TABLE_ID;
export const MARKS_COLLECTION_ID = MARKS_TABLE_ID;
export const EXAMS_COLLECTION_ID = EXAMS_TABLE_ID;
export const ATTENDANCE_COLLECTION_ID = ATTENDANCE_TABLE_ID;
export const LESSONPLANS_COLLECTION_ID = LESSONPLANS_TABLE_ID;
