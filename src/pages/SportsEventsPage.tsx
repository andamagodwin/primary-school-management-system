import { useState, useEffect } from "react"
import { PlusIcon, EditIcon, TrashIcon, TrophyIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getEvents, createEvent, deleteEvent, type Event } from "@/lib/events"

export default function SportsEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    eventType: "sports",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const allEvents = await getEvents()
      const sportsEvents = allEvents.filter(e => 
        e.eventType.toLowerCase().includes('sports') || 
        e.eventType.toLowerCase().includes('cultural') ||
        e.eventType.toLowerCase().includes('academic')
      )
      setEvents(sportsEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createEvent({
        ...formData,
        status: 'upcoming',
      })
      toast.success('Event created successfully')
      setShowAddModal(false)
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        eventType: "sports",
      })
      loadEvents()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent(eventId)
      toast.success('Event deleted successfully')
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sports Events & Activities</h2>
          <p className="text-muted-foreground">Manage sports competitions and school events</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.$id}
            className="rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-6"
          >
            <div className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              {formatDate(event.eventDate)}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{event.title}</h3>
            <div className="mb-2 inline-block rounded-full bg-muted px-2 py-1 text-xs">
              {event.eventType}
            </div>
            {event.description && (
              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
            {event.location && (
              <p className="mb-4 text-xs text-muted-foreground">📍 {event.location}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(event.$id)}
                className="rounded-md border bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
              >
                <TrashIcon className="mr-1 inline h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <TrophyIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No events found. Create your first event!</p>
        </div>
      )}

      {/* Competition Results Section */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Sports Competition Results</h3>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <TrophyIcon className="mr-2 inline h-4 w-4" />
          Add Competition Result
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Annual Sports Day"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="sports">Sports Competition</option>
                  <option value="academic">Academic Event</option>
                  <option value="cultural">Cultural Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Event Date</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Event Time</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., School Grounds"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Event details..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 inline h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

