import { databases, DATABASE_ID, LIBRARY_BOOKS_TABLE_ID, LIBRARY_BORROWING_TABLE_ID } from './appwrite';
import { Query } from 'appwrite';

export interface LibraryBook {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  bookId: string;
  title: string;
  author: string;
  isbn?: string;
  category: 'academic' | 'fiction' | 'reference' | 'children';
  totalCopies: number;
  availableCopies: number;
  status: 'available' | 'out';
  createdBy: string;
}

export interface CreateLibraryBookData {
  bookId: string;
  title: string;
  author: string;
  isbn?: string;
  category: 'academic' | 'fiction' | 'reference' | 'children';
  totalCopies: number;
  availableCopies?: number;
  status?: 'available' | 'out';
  createdBy: string;
}

export interface BorrowingRecord {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  bookId: string;
  bookTitle: string;
  borrowerId: string;
  borrowerName: string;
  borrowerType: 'student' | 'staff';
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  processedBy: string;
}

export interface CreateBorrowingRecordData {
  bookId: string;
  bookTitle: string;
  borrowerId: string;
  borrowerName: string;
  borrowerType: 'student' | 'staff';
  borrowedDate: string;
  dueDate: string;
  processedBy: string;
}

// Book Management
export const createLibraryBook = async (data: CreateLibraryBookData): Promise<LibraryBook> => {
  const availableCopies = data.availableCopies ?? data.totalCopies;
  const status = data.status || (availableCopies > 0 ? 'available' : 'out');
  
  return await databases.createDocument(
    DATABASE_ID,
    LIBRARY_BOOKS_TABLE_ID,
    'unique()',
    {
      ...data,
      availableCopies,
      status,
    }
  ) as LibraryBook;
};

export const getLibraryBooks = async (filters?: {
  category?: string;
  status?: string;
}): Promise<LibraryBook[]> => {
  const queries: string[] = [];
  
  if (filters?.category && filters.category !== 'all') {
    queries.push(Query.equal('category', filters.category));
  }
  
  if (filters?.status && filters.status !== 'all') {
    if (filters.status === 'available') {
      queries.push(Query.greaterThan('availableCopies', 0));
    } else if (filters.status === 'borrowed') {
      queries.push(Query.lessThan('availableCopies', Query.attribute('totalCopies')));
    }
  }
  
  queries.push(Query.orderDesc('$createdAt'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    LIBRARY_BOOKS_TABLE_ID,
    queries
  );
  
  return response.documents as LibraryBook[];
};

export const getLibraryBook = async (id: string): Promise<LibraryBook> => {
  return await databases.getDocument(
    DATABASE_ID,
    LIBRARY_BOOKS_TABLE_ID,
    id
  ) as LibraryBook;
};

export const getLibraryBookByBookId = async (bookId: string): Promise<LibraryBook | null> => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    LIBRARY_BOOKS_TABLE_ID,
    [Query.equal('bookId', bookId)]
  );
  
  return response.documents.length > 0 ? (response.documents[0] as LibraryBook) : null;
};

export const updateLibraryBook = async (
  id: string,
  data: Partial<CreateLibraryBookData>
): Promise<LibraryBook> => {
  if (data.availableCopies !== undefined && data.totalCopies !== undefined) {
    data.status = data.availableCopies > 0 ? 'available' : 'out';
  }
  
  return await databases.updateDocument(
    DATABASE_ID,
    LIBRARY_BOOKS_TABLE_ID,
    id,
    data
  ) as LibraryBook;
};

export const deleteLibraryBook = async (id: string): Promise<void> => {
  await databases.deleteDocument(DATABASE_ID, LIBRARY_BOOKS_TABLE_ID, id);
};

// Borrowing Management
export const createBorrowingRecord = async (data: CreateBorrowingRecordData): Promise<BorrowingRecord> => {
  // Check if book is available
  const book = await getLibraryBookByBookId(data.bookId);
  if (!book || book.availableCopies <= 0) {
    throw new Error('Book is not available for borrowing');
  }
  
  // Create borrowing record
  const record = await databases.createDocument(
    DATABASE_ID,
    LIBRARY_BORROWING_TABLE_ID,
    'unique()',
    {
      ...data,
      status: 'borrowed',
    }
  ) as BorrowingRecord;
  
  // Update book available copies
  await updateLibraryBook(book.$id, {
    availableCopies: book.availableCopies - 1,
  });
  
  return record;
};

export const getBorrowingRecords = async (filters?: {
  borrowerId?: string;
  bookId?: string;
  status?: string;
}): Promise<BorrowingRecord[]> => {
  const queries: string[] = [];
  
  if (filters?.borrowerId) {
    queries.push(Query.equal('borrowerId', filters.borrowerId));
  }
  
  if (filters?.bookId) {
    queries.push(Query.equal('bookId', filters.bookId));
  }
  
  if (filters?.status && filters.status !== 'all') {
    queries.push(Query.equal('status', filters.status));
  }
  
  queries.push(Query.orderDesc('borrowedDate'));
  
  const response = await databases.listDocuments(
    DATABASE_ID,
    LIBRARY_BORROWING_TABLE_ID,
    queries
  );
  
  return response.documents as BorrowingRecord[];
};

export const returnBook = async (recordId: string): Promise<BorrowingRecord> => {
  const record = await databases.getDocument(
    DATABASE_ID,
    LIBRARY_BORROWING_TABLE_ID,
    recordId
  ) as BorrowingRecord;
  
  // Update record
  const updatedRecord = await databases.updateDocument(
    DATABASE_ID,
    LIBRARY_BORROWING_TABLE_ID,
    recordId,
    {
      returnDate: new Date().toISOString(),
      status: 'returned',
    }
  ) as BorrowingRecord;
  
  // Update book available copies
  const book = await getLibraryBookByBookId(record.bookId);
  if (book) {
    await updateLibraryBook(book.$id, {
      availableCopies: book.availableCopies + 1,
    });
  }
  
  return updatedRecord;
};

export const markOverdueBooks = async (): Promise<void> => {
  const today = new Date().toISOString();
  const records = await getBorrowingRecords({ status: 'borrowed' });
  
  for (const record of records) {
    if (new Date(record.dueDate) < new Date(today) && record.status === 'borrowed') {
      await databases.updateDocument(
        DATABASE_ID,
        LIBRARY_BORROWING_TABLE_ID,
        record.$id,
        { status: 'overdue' }
      );
    }
  }
};

