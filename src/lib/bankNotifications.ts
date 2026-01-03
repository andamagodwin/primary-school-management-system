import { databases, DATABASE_ID, BANK_NOTIFICATIONS_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface BankNotification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  type: 'bank' | 'balance';
  message: string;
  studentId?: string;
  studentName?: string;
  amount?: number;
  status: 'processed' | 'pending' | 'ignored';
  notificationDate: string;
  processedBy?: string;
  processedDate?: string;
}

export interface CreateBankNotificationData {
  type: 'bank' | 'balance';
  message: string;
  studentId?: string;
  studentName?: string;
  amount?: number;
  notificationDate?: string;
}

export const createBankNotification = async (
  data: CreateBankNotificationData
): Promise<BankNotification> => {
  return await databases.createDocument(
    DATABASE_ID,
    BANK_NOTIFICATIONS_TABLE_ID,
    'unique()',
    {
      ...data,
      status: 'pending',
      notificationDate: data.notificationDate || new Date().toISOString(),
    }
  ) as BankNotification;
};

export const getBankNotifications = async (filters?: {
  type?: string;
  status?: string;
}): Promise<BankNotification[]> => {
  const queries: string[] = [];
  
  if (filters?.type && filters.type !== 'all') {
    queries.push(Query.equal('type', filters.type));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  queries.push(Query.orderDesc('notificationDate'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    BANK_NOTIFICATIONS_TABLE_ID,
    queries
  );
  
  return response.documents as BankNotification[];
};

export const getBankNotification = async (id: string): Promise<BankNotification> => {
  return await databases.getDocument(
    DATABASE_ID,
    BANK_NOTIFICATIONS_TABLE_ID,
    id
  ) as BankNotification;
};

export const updateBankNotification = async (
  id: string,
  data: Partial<{
    status: 'processed' | 'pending' | 'ignored';
    processedBy: string;
    processedDate: string;
  }>
): Promise<BankNotification> => {
  return await databases.updateDocument(
    DATABASE_ID,
    BANK_NOTIFICATIONS_TABLE_ID,
    id,
    {
      ...data,
      processedDate: data.processedDate || new Date().toISOString(),
    }
  ) as BankNotification;
};

export const processNotification = async (
  id: string,
  processedBy: string
): Promise<BankNotification> => {
  return await updateBankNotification(id, {
    status: 'processed',
    processedBy,
  });
};

export const ignoreNotification = async (
  id: string,
  processedBy: string
): Promise<BankNotification> => {
  return await updateBankNotification(id, {
    status: 'ignored',
    processedBy,
  });
};

export const deleteBankNotification = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, BANK_NOTIFICATIONS_TABLE_ID, id);
};

