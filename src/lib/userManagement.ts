import { databases, DATABASE_ID, USERS_COLLECTION_ID, account } from './appwrite';
import { Query, ID } from 'appwrite';
import { getTeachers } from './teachers';
import { getStudents } from './students';

export interface SystemUser {
  $id: string;
  userId: string;
  email: string;
  fullName: string;
  userType: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  phoneNumber?: string;
  avatar?: string;
}

export const getAllUsers = async (filters?: {
  userType?: string;
  status?: string;
  search?: string;
}): Promise<SystemUser[]> => {
  const queries: string[] = [];
  
  if (filters?.userType && filters.userType !== 'all') {
    queries.push(Query.equal('userType', filters.userType));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  if (filters?.search) {
    // Note: Appwrite doesn't support full-text search directly, so we'll filter client-side
  }
  
  queries.push(Query.orderDesc('$createdAt'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    queries
  );
  
  let users = response.documents as SystemUser[];
  
  // Client-side search if provided
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    users = users.filter(u => 
      u.fullName?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.userId?.toLowerCase().includes(searchLower)
    );
  }
  
  return users;
};

export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'suspended'
): Promise<void> => {
  // Find the user document
  const users = await databases.listDocuments(
    DATABASE_ID,
    USERS_COLLECTION_ID,
    [Query.equal('userId', userId)]
  );
  
  if (users.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      users.documents[0].$id,
      { status }
    );
  }
};

export const resetUserPassword = async (userId: string): Promise<string> => {
  // This would typically send a password reset email
  // For now, we'll just return a message
  return 'Password reset email sent';
};

export const getSystemStats = async (): Promise<{
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  pendingIssues: number;
}> => {
  const [users, teachers, students] = await Promise.all([
    getAllUsers(),
    getTeachers(),
    getStudents()
  ]);
  
  return {
    totalUsers: users.length,
    totalTeachers: teachers.length,
    totalStudents: students.length,
    pendingIssues: 0, // This would come from a separate issues table
  };
};

