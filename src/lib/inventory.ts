import { databases, DATABASE_ID, INVENTORY_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface InventoryItem {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  itemName: string;
  category: 'stationery' | 'lab' | 'sports' | 'cleaning' | 'other';
  quantity: number;
  minLevel: number;
  unitPrice: number;
  lastRestocked?: string;
  status: 'low' | 'adequate' | 'out';
  createdBy: string;
}

export interface CreateInventoryItemData {
  itemName: string;
  category: 'stationery' | 'lab' | 'sports' | 'cleaning' | 'other';
  quantity: number;
  minLevel: number;
  unitPrice: number;
  lastRestocked?: string;
  status?: 'low' | 'adequate' | 'out';
  createdBy: string;
}

export const createInventoryItem = async (data: CreateInventoryItemData): Promise<InventoryItem> => {
  // Auto-determine status based on quantity
  const status = data.status || (data.quantity <= data.minLevel ? 'low' : data.quantity === 0 ? 'out' : 'adequate');
  
  return await databases.createDocument(
    DATABASE_ID,
    INVENTORY_TABLE_ID,
    'unique()',
    {
      ...data,
      status,
      lastRestocked: data.lastRestocked || new Date().toISOString(),
    }
  ) as InventoryItem;
};

export const getInventoryItems = async (filters?: {
  category?: string;
  status?: string;
}): Promise<InventoryItem[]> => {
  const queries: string[] = [];
  
  if (filters?.category && filters.category !== 'all') {
    queries.push(Query.equal('category', filters.category));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  queries.push(Query.orderDesc('$createdAt'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    INVENTORY_TABLE_ID,
    queries
  );
  
  return response.documents as InventoryItem[];
};

export const getInventoryItem = async (id: string): Promise<InventoryItem> => {
  return await databases.getDocument(
    DATABASE_ID,
    INVENTORY_TABLE_ID,
    id
  ) as InventoryItem;
};

export const updateInventoryItem = async (
  id: string,
  data: Partial<CreateInventoryItemData>
): Promise<InventoryItem> => {
  // Auto-update status if quantity changes
  if (data.quantity !== undefined && data.minLevel !== undefined) {
    data.status = data.quantity <= data.minLevel ? 'low' : data.quantity === 0 ? 'out' : 'adequate';
  }
  
  return await databases.updateDocument(
    DATABASE_ID,
    INVENTORY_TABLE_ID,
    id,
    data
  ) as InventoryItem;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, INVENTORY_TABLE_ID, id);
};

