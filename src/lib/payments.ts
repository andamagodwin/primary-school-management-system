import { databases, DATABASE_ID, FEE_PAYMENTS_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface FeePayment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  paymentMethod: 'bank' | 'mobile' | 'cash' | 'other';
  paymentDate: string;
  status: 'paid' | 'partial' | 'pending';
  transactionRef?: string;
  processedBy: string;
}

export interface CreateFeePaymentData {
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  amountDue: number;
  amountPaid: number;
  paymentMethod: 'bank' | 'mobile' | 'cash' | 'other';
  paymentDate: string;
  transactionRef?: string;
  processedBy: string;
}

export const createFeePayment = async (data: CreateFeePaymentData): Promise<FeePayment> => {
  const balance = data.amountDue - data.amountPaid;
  const status: 'paid' | 'partial' | 'pending' = 
    balance === 0 ? 'paid' : balance < data.amountDue ? 'partial' : 'pending';
  
  return await databases.createDocument(
    DATABASE_ID,
    FEE_PAYMENTS_TABLE_ID,
    'unique()',
    {
      ...data,
      balance,
      status,
    }
  ) as FeePayment;
};

export const getFeePayments = async (filters?: {
  studentId?: string;
  term?: string;
  status?: string;
}): Promise<FeePayment[]> => {
  const queries: string[] = [];
  
  if (filters?.studentId) {
    queries.push(Query.equal('studentId', filters.studentId));
  }
  
  if (filters?.term) {
    queries.push(Query.equal('term', filters.term));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  queries.push(Query.orderDesc('paymentDate'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    FEE_PAYMENTS_TABLE_ID,
    queries
  );
  
  return response.documents as FeePayment[];
};

export const getFeePayment = async (id: string): Promise<FeePayment> => {
  return await databases.getDocument(
    DATABASE_ID,
    FEE_PAYMENTS_TABLE_ID,
    id
  ) as FeePayment;
};

export const updateFeePayment = async (
  id: string,
  data: Partial<CreateFeePaymentData>
): Promise<FeePayment> => {
  const existing = await getFeePayment(id);
  
  const amountDue = data.amountDue ?? existing.amountDue;
  const amountPaid = data.amountPaid ?? existing.amountPaid;
  const balance = amountDue - amountPaid;
  const status: 'paid' | 'partial' | 'pending' = 
    balance === 0 ? 'paid' : balance < amountDue ? 'partial' : 'pending';
  
  return await databases.updateDocument(
    DATABASE_ID,
    FEE_PAYMENTS_TABLE_ID,
    id,
    {
      ...data,
      balance,
      status,
    }
  ) as FeePayment;
};

export const deleteFeePayment = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, FEE_PAYMENTS_TABLE_ID, id);
};

export const getPaymentSummary = async (term?: string): Promise<{
  totalCollected: number;
  totalDue: number;
  pendingCount: number;
  collectionRate: number;
}> => {
  const queries: string[] = [];
  if (term) {
    queries.push(Query.equal('term', term));
  }
  
  const payments = await getFeePayments({ term });
  
  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalDue = payments.reduce((sum, p) => sum + p.amountDue, 0);
  const pendingCount = payments.filter(p => p.balance > 0).length;
  const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;
  
  return {
    totalCollected,
    totalDue,
    pendingCount,
    collectionRate,
  };
};

