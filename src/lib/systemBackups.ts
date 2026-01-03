import { databases, DATABASE_ID, SYSTEM_BACKUPS_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface SystemBackup {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  backupType: 'full' | 'database' | 'files' | 'incremental';
  backupDate: string;
  backupSize: string;
  status: 'completed' | 'in_progress' | 'failed';
  description?: string;
  fileUrl?: string;
  createdBy: string;
}

export interface CreateBackupData {
  backupType: 'full' | 'database' | 'files' | 'incremental';
  description?: string;
  createdBy: string;
}

export const createBackup = async (data: CreateBackupData): Promise<SystemBackup> => {
  // Calculate backup size (this would be done server-side in production)
  const backupSize = '245 MB'; // Placeholder
  
  return await databases.createDocument(
    DATABASE_ID,
    SYSTEM_BACKUPS_TABLE_ID,
    'unique()',
    {
      ...data,
      backupDate: new Date().toISOString(),
      backupSize,
      status: 'in_progress',
    }
  ) as SystemBackup;
};

export const getBackups = async (filters?: {
  backupType?: string;
  status?: string;
}): Promise<SystemBackup[]> => {
  const queries: string[] = [];
  
  if (filters?.backupType && filters.backupType !== 'all') {
    queries.push(Query.equal('backupType', filters.backupType));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  queries.push(Query.orderDesc('backupDate'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    SYSTEM_BACKUPS_TABLE_ID,
    queries
  );
  
  return response.documents as SystemBackup[];
};

export const getBackup = async (id: string): Promise<SystemBackup> => {
  return await databases.getDocument(
    DATABASE_ID,
    SYSTEM_BACKUPS_TABLE_ID,
    id
  ) as SystemBackup;
};

export const updateBackupStatus = async (
  id: string,
  status: 'completed' | 'in_progress' | 'failed',
  fileUrl?: string
): Promise<SystemBackup> => {
  const updateData: any = { status };
  if (fileUrl) {
    updateData.fileUrl = fileUrl;
  }
  
  return await databases.updateDocument(
    DATABASE_ID,
    SYSTEM_BACKUPS_TABLE_ID,
    id,
    updateData
  ) as SystemBackup;
};

export const deleteBackup = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, SYSTEM_BACKUPS_TABLE_ID, id);
};

