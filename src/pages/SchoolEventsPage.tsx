import { useState, useEffect } from "react"
import { PlusIcon, CalendarIcon, MapPinIcon, ClockIcon, XIcon, Loader2Icon } from "lucide-react"
import { createEvent, getEvents, deleteEvent, type Event } from "@/lib/events"
import { toast } from "sonner"

export default function SchoolEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    eventType: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await getEvents()
      // Sort by event date (upcoming first)
      const sorted = data.sort((a, b) => 
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      )
      setEvents(sorted)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load events"
      setError(errorMessage)
      console.error("Error fetching events:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createEvent(formData)
      toast.success("Event created successfully")
      setShowCreateForm(false)
      setFormData({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        location: "",
        eventType: "",
        status: "upcoming",
      })
      fetchEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create event"
      toast.error(errorMessage)
      console.error("Error creating event:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await deleteEvent(eventId)
      toast.success("Event deleted successfully")
      fetchEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event"
      toast.error(errorMessage)
      console.error("Error deleting event:", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <h2 className="text-3xl font-bold tracking-tight">School Events</h2>
          <p className="text-muted-foreground">Manage and view all school events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="h-4 w-4" />
          {showCreateForm ? "Cancel" : "Create Event"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create Event Form */}
      {showCreateForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Event Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Parent-Teacher Conference"
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium mb-2">
                  Event Type *
                </label>
                <input
                  id="eventType"
                  type="text"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Meeting, Sports, Academic"
                />
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                  Event Date *
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium mb-2">
                  Event Time
                </label>
                <input
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Main Hall, School Grounds"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Event details and information..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.$id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.eventType}</p>
                </div>
                <button
                  onClick={() => handleDelete(event.$id)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete event"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                {event.eventTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{event.eventTime}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <p className="text-xs text-muted-foreground">
                  Created by {event.createdByName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

