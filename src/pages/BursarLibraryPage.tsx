import { useState, useEffect } from "react"
import { PlusIcon, EditIcon, TrashIcon, FilterIcon, HandIcon, Loader2Icon, RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { 
  getLibraryBooks, 
  createLibraryBook, 
  updateLibraryBook, 
  deleteLibraryBook,
  getBorrowingRecords,
  createBorrowingRecord,
  returnBook,
  type LibraryBook,
  type BorrowingRecord
} from "@/lib/library"
import { getStudents } from "@/lib/students"

export default function BursarLibraryPage() {
  const user = useAuthStore((state) => state.user)
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [borrowingRecords, setBorrowingRecords] = useState<BorrowingRecord[]>([])
  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>([])
  const [filteredRecords, setFilteredRecords] = useState<BorrowingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [students, setStudents] = useState<any[]>([])
  
  const [bookFormData, setBookFormData] = useState({
    bookId: "",
    title: "",
    author: "",
    isbn: "",
    category: "academic" as const,
    totalCopies: 1,
  })
  
  const [borrowFormData, setBorrowFormData] = useState({
    bookId: "",
    borrowerId: "",
    borrowerName: "",
    borrowerType: "student" as const,
    dueDate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterBooks()
    filterRecords()
  }, [books, borrowingRecords, statusFilter, categoryFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [booksData, recordsData, studentsData] = await Promise.all([
        getLibraryBooks(),
        getBorrowingRecords(),
        getStudents()
      ])
      setBooks(booksData)
      setBorrowingRecords(recordsData)
      setStudents(studentsData)
    } catch (error) {
      console.error('Error loading library data:', error)
      toast.error('Failed to load library data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = [...books]
    if (categoryFilter !== "all") {
      filtered = filtered.filter(b => b.category === categoryFilter)
    }
    if (statusFilter !== "all") {
      if (statusFilter === "available") {
        filtered = filtered.filter(b => b.availableCopies > 0)
      } else if (statusFilter === "borrowed") {
        filtered = filtered.filter(b => b.availableCopies < b.totalCopies)
      }
    }
    setFilteredBooks(filtered)
  }

  const filterRecords = () => {
    let filtered = [...borrowingRecords]
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter)
    }
    setFilteredRecords(filtered)
  }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBook) {
        await updateLibraryBook(editingBook.$id, {
          ...bookFormData,
          createdBy: user?.userId || "",
        })
        toast.success('Book updated successfully')
      } else {
        await createLibraryBook({
          ...bookFormData,
          createdBy: user?.userId || "",
        })
        toast.success('Book added successfully')
      }
      setShowBookModal(false)
      setEditingBook(null)
      resetBookForm()
      loadData()
    } catch (error) {
      console.error('Error saving book:', error)
      toast.error('Failed to save book')
    }
  }

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const book = books.find(b => b.$id === borrowFormData.bookId)
      if (!book) {
        toast.error('Book not found')
        return
      }
      
      await createBorrowingRecord({
        bookId: book.bookId,
        bookTitle: book.title,
        borrowerId: borrowFormData.borrowerId,
        borrowerName: borrowFormData.borrowerName,
        borrowerType: borrowFormData.borrowerType,
        borrowedDate: new Date().toISOString(),
        dueDate: new Date(borrowFormData.dueDate).toISOString(),
        processedBy: user?.userId || "",
      })
      toast.success('Book borrowed successfully')
      setShowBorrowModal(false)
      resetBorrowForm()
      loadData()
    } catch (error: any) {
      console.error('Error borrowing book:', error)
      toast.error(error.message || 'Failed to borrow book')
    }
  }

  const handleReturn = async (recordId: string) => {
    try {
      await returnBook(recordId)
      toast.success('Book returned successfully')
      loadData()
    } catch (error) {
      console.error('Error returning book:', error)
      toast.error('Failed to return book')
    }
  }

  const handleEdit = (book: LibraryBook) => {
    setEditingBook(book)
    setBookFormData({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      category: book.category,
      totalCopies: book.totalCopies,
    })
    setShowBookModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      await deleteLibraryBook(id)
      toast.success('Book deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const resetBookForm = () => {
    setBookFormData({
      bookId: "",
      title: "",
      author: "",
      isbn: "",
      category: "academic",
      totalCopies: 1,
    })
  }

  const resetBorrowForm = () => {
    setBorrowFormData({
      bookId: "",
      borrowerId: "",
      borrowerName: "",
      borrowerType: "student",
      dueDate: "",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Library Management System</h2>
          <p className="text-muted-foreground">Manage library books and borrowing records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetBookForm()
              setEditingBook(null)
              setShowBookModal(true)
            }}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Book
          </button>
          <button
            onClick={() => {
              resetBorrowForm()
              setShowBorrowModal(true)
            }}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <HandIcon className="h-4 w-4" />
            Borrow Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Books</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="fiction">Fiction</option>
            <option value="reference">Reference</option>
            <option value="children">Children</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Library Books</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Book ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total Copies</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Available</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{book.bookId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{book.title}</td>
                  <td className="px-4 py-3 text-sm">{book.author}</td>
                  <td className="px-4 py-3 text-sm capitalize">{book.category}</td>
                  <td className="px-4 py-3 text-sm">{book.totalCopies}</td>
                  <td className="px-4 py-3 text-sm">{book.availableCopies}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="p-1 rounded hover:bg-muted"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.$id)}
                        className="p-1 rounded hover:bg-muted text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrowing Records */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Borrowing Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Borrower</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Book Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Borrowed Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Return Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.$id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{record.borrowerName}</td>
                  <td className="px-4 py-3 text-sm font-medium">{record.bookTitle}</td>
                  <td className="px-4 py-3 text-sm">{new Date(record.borrowedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{new Date(record.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">
                    {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'Not returned'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'returned' 
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {record.status !== 'returned' && (
                      <button
                        onClick={() => handleReturn(record.$id)}
                        className="px-3 py-1 rounded-md bg-green-100 text-green-800 text-xs hover:bg-green-200"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h3>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Book ID</label>
                <input
                  type="text"
                  value={bookFormData.bookId}
                  onChange={(e) => setBookFormData({ ...bookFormData, bookId: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Author</label>
                <input
                  type="text"
                  value={bookFormData.author}
                  onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">ISBN</label>
                <input
                  type="text"
                  value={bookFormData.isbn}
                  onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select
                  value={bookFormData.category}
                  onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="academic">Academic</option>
                  <option value="fiction">Fiction</option>
                  <option value="reference">Reference</option>
                  <option value="children">Children</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Total Copies</label>
                <input
                  type="number"
                  value={bookFormData.totalCopies}
                  onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: parseInt(e.target.value) })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookModal(false)
                    setEditingBook(null)
                    resetBookForm()
                  }}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                >
                  {editingBook ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Book Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Borrow Library Book</h3>
            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Select Book</label>
                <select
                  value={borrowFormData.bookId}
                  onChange={(e) => {
                    const book = books.find(b => b.$id === e.target.value)
                    setBorrowFormData({ ...borrowFormData, bookId: e.target.value })
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a book</option>
                  {books.filter(b => b.availableCopies > 0).map(book => (
                    <option key={book.$id} value={book.$id}>
                      {book.title} (Available: {book.availableCopies})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Borrower Type</label>
                <select
                  value={borrowFormData.borrowerType}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowerType: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Borrower Name</label>
                <input
                  type="text"
                  value={borrowFormData.borrowerName}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowerName: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Borrower ID</label>
                <input
                  type="text"
                  value={borrowFormData.borrowerId}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowerId: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  value={borrowFormData.dueDate}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, dueDate: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowBorrowModal(false)
                    resetBorrowForm()
                  }}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                >
                  Process Borrowing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

