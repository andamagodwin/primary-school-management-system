import { databases, DATABASE_ID, USER_PERMISSIONS_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface UserPermission {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  userType: string;
  canEnterMarks: boolean;
  canRecordAttendance: boolean;
  canUploadExams: boolean;
  canUploadLessonPlans: boolean;
  canGenerateReports: boolean;
  portalAccess: 'full' | 'limited' | 'marks_only';
  updatedBy: string;
}

export interface CreateUserPermissionData {
  userId: string;
  userType: string;
  canEnterMarks?: boolean;
  canRecordAttendance?: boolean;
  canUploadExams?: boolean;
  canUploadLessonPlans?: boolean;
  canGenerateReports?: boolean;
  portalAccess?: 'full' | 'limited' | 'marks_only';
  updatedBy: string;
}

export const getUserPermissions = async (userId: string): Promise<UserPermission | null> => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    USER_PERMISSIONS_TABLE_ID,
    [Query.equal('userId', userId)]
  );
  
  return response.documents.length > 0 ? (response.documents[0] as UserPermission) : null;
};

export const createUserPermissions = async (data: CreateUserPermissionData): Promise<UserPermission> => {
  return await databases.createDocument(
    DATABASE_ID,
    USER_PERMISSIONS_TABLE_ID,
    'unique()',
    {
      canEnterMarks: data.canEnterMarks ?? true,
      canRecordAttendance: data.canRecordAttendance ?? true,
      canUploadExams: data.canUploadExams ?? false,
      canUploadLessonPlans: data.canUploadLessonPlans ?? true,
      canGenerateReports: data.canGenerateReports ?? false,
      portalAccess: data.portalAccess || 'full',
      ...data,
    }
  ) as UserPermission;
};

export const updateUserPermissions = async (
  userId: string,
  data: Partial<CreateUserPermissionData>
): Promise<UserPermission> => {
  const existing = await getUserPermissions(userId);
  
  if (!existing) {
    // Create new permissions if they don't exist
    return await createUserPermissions({
      userId,
      userType: data.userType || 'teacher',
      ...data,
      updatedBy: data.updatedBy || '',
    });
  }
  
  return await databases.updateDocument(
    DATABASE_ID,
    USER_PERMISSIONS_TABLE_ID,
    existing.$id,
    {
      ...data,
      updatedBy: data.updatedBy || existing.updatedBy,
    }
  ) as UserPermission;
};

export const getAllUserPermissions = async (): Promise<UserPermission[]> => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    USER_PERMISSIONS_TABLE_ID,
    [Query.orderDesc('$updatedAt')]
  );
  
  return response.documents as UserPermission[];
};

