import { databases } from './appwrite';
import { DATABASE_ID, SCHOOL_SETTINGS_TABLE_ID } from './appwrite';

export interface SchoolSettings {
  $id?: string;
  schoolName: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  currentAcademicYear: string;
  academicYearStart?: string;
  academicYearEnd?: string;
  logo?: string;
  principalName?: string;
  registrationNumber?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

const SETTINGS_ROW_ID = 'main'; // Single row for school settings

/**
 * Get school settings
 */
export async function getSchoolSettings(): Promise<SchoolSettings | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      SCHOOL_SETTINGS_TABLE_ID,
      []
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as SchoolSettings;
    }

    // Return default settings if none exist
    return {
      schoolName: 'Primary School Management System',
      currentAcademicYear: '2024-2025',
      timezone: 'Africa/Kampala',
      language: 'en',
      currency: 'UGX',
    };
  } catch (error) {
    console.error('Error fetching school settings:', error);
    // Return default settings on error
    return {
      schoolName: 'Primary School Management System',
      currentAcademicYear: '2024-2025',
      timezone: 'Africa/Kampala',
      language: 'en',
      currency: 'UGX',
    };
  }
}

/**
 * Create or update school settings
 */
export async function saveSchoolSettings(
  settings: Partial<SchoolSettings>
): Promise<SchoolSettings> {
  try {
    // Check if settings already exist
    const existing = await getSchoolSettings();

    if (existing?.$id) {
      // Update existing settings
      const updated = await databases.updateDocument(
        DATABASE_ID,
        SCHOOL_SETTINGS_TABLE_ID,
        existing.$id,
        settings as Record<string, any>
      );
      return updated as unknown as SchoolSettings;
    } else {
      // Create new settings
      const created = await databases.createDocument(
        DATABASE_ID,
        SCHOOL_SETTINGS_TABLE_ID,
        SETTINGS_ROW_ID,
        {
          schoolName: settings.schoolName || 'Primary School Management System',
          currentAcademicYear: settings.currentAcademicYear || '2024-2025',
          address: settings.address || '',
          contactEmail: settings.contactEmail || '',
          contactPhone: settings.contactPhone || '',
          website: settings.website || '',
          academicYearStart: settings.academicYearStart || '',
          academicYearEnd: settings.academicYearEnd || '',
          logo: settings.logo || '',
          principalName: settings.principalName || '',
          registrationNumber: settings.registrationNumber || '',
          timezone: settings.timezone || 'Africa/Kampala',
          language: settings.language || 'en',
          currency: settings.currency || 'UGX',
        }
      );
      return created as unknown as SchoolSettings;
    }
  } catch (error) {
    console.error('Error saving school settings:', error);
    throw error;
  }
}

