import { useState, useEffect } from "react"
import { PlusIcon, EditIcon, TrashIcon, FilterIcon, DownloadIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, type InventoryItem } from "@/lib/inventory"

export default function BursarInventoryPage() {
  const user = useAuthStore((state) => state.user)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [formData, setFormData] = useState({
    itemName: "",
    category: "stationery" as const,
    quantity: 0,
    minLevel: 0,
    unitPrice: 0,
  })

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, categoryFilter, statusFilter])

  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const allItems = await getInventoryItems()
      setItems(allItems)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]
    if (categoryFilter !== "all") {
      filtered = filtered.filter(i => i.category === categoryFilter)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(i => i.status === statusFilter)
    }
    setFilteredItems(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.$id, {
          ...formData,
          createdBy: user?.userId || "",
        })
        toast.success('Inventory item updated')
      } else {
        await createInventoryItem({
          ...formData,
          createdBy: user?.userId || "",
        })
        toast.success('Inventory item added')
      }
      setShowModal(false)
      setEditingItem(null)
      resetForm()
      loadInventory()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      minLevel: item.minLevel,
      unitPrice: item.unitPrice,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await deleteInventoryItem(id)
      toast.success('Item deleted')
      loadInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "stationery",
      quantity: 0,
      minLevel: 0,
      unitPrice: 0,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'border-l-red-600 bg-red-50'
      case 'out': return 'border-l-red-800 bg-red-100'
      default: return 'border-l-green-600 bg-green-50'
    }
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
          <h2 className="text-3xl font-bold tracking-tight">School Materials Inventory</h2>
          <p className="text-muted-foreground">Manage inventory items and stock levels</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingItem(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="stationery">Stationery</option>
            <option value="lab">Lab Equipment</option>
            <option value="sports">Sports Equipment</option>
            <option value="cleaning">Cleaning Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="low">Low Stock</option>
            <option value="adequate">Adequate</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={filterItems}
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div key={item.$id} className={`rounded-lg border p-6 border-l-4 ${getStatusColor(item.status)}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{item.itemName}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <EditIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.$id)}
                  className="p-1 rounded hover:bg-muted text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <span className={`font-bold ${item.status === 'low' ? 'text-red-600' : 'text-green-600'}`}>
                  {item.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Min Level:</span>
                <span className="text-sm">{item.minLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Unit Price:</span>
                <span className="text-sm font-medium">UGX {item.unitPrice.toLocaleString()}</span>
              </div>
              {item.lastRestocked && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Restocked:</span>
                  <span className="text-sm">{new Date(item.lastRestocked).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Item Name</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="stationery">Stationery</option>
                  <option value="lab">Lab Equipment</option>
                  <option value="sports">Sports Equipment</option>
                  <option value="cleaning">Cleaning Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Minimum Level</label>
                <input
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Unit Price (UGX)</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value) })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                  min="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    resetForm()
                  }}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

