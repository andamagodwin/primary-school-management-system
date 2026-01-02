import { useState } from "react"
import { MessageSquareIcon, SendIcon, FileTextIcon, CalendarIcon, UserIcon } from "lucide-react"

export default function UNEBCommunicationsPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  const communications = [
    {
      id: "1",
      subject: "P7 Mock Examination Results Submission",
      from: "UNEB Secretariat",
      date: "2025-11-01",
      status: "pending",
      priority: "high",
    },
    {
      id: "2",
      subject: "Registration Deadline Reminder",
      from: "UNEB Registration Office",
      date: "2025-10-28",
      status: "read",
      priority: "high",
    },
    {
      id: "3",
      subject: "Examination Center Allocation",
      from: "UNEB Secretariat",
      date: "2025-10-25",
      status: "read",
      priority: "medium",
    },
    {
      id: "4",
      subject: "Updated Examination Guidelines",
      from: "UNEB Academic Affairs",
      date: "2025-10-20",
      status: "read",
      priority: "medium",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">UNEB Communications</h2>
          <p className="text-muted-foreground">Manage communications with Uganda National Examinations Board</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <SendIcon className="h-4 w-4" />
          New Communication
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-3xl font-bold">{communications.length}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquareIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold">
                {communications.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <MessageSquareIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <p className="text-3xl font-bold">
                {communications.filter((c) => c.status === "read").length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <MessageSquareIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-3xl font-bold">
                {communications.filter((c) => c.priority === "high").length}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <MessageSquareIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Communications List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h3 className="font-semibold">Messages</h3>
            </div>
            <div className="divide-y">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => setSelectedMessage(comm.id)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-muted ${
                    selectedMessage === comm.id ? "bg-muted" : ""
                  } ${comm.status === "pending" ? "border-l-4 border-primary" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{comm.subject}</p>
                    {comm.status === "pending" && (
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{comm.from}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{comm.date}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                        comm.priority
                      )}`}
                    >
                      {comm.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  {communications.find((c) => c.id === selectedMessage)?.subject}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{communications.find((c) => c.id === selectedMessage)?.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{communications.find((c) => c.id === selectedMessage)?.date}</span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-muted-foreground">
                  This is a placeholder for the message content. In a real implementation, this
                  would display the full communication from UNEB, including any attachments,
                  deadlines, and required actions.
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
                  <FileTextIcon className="h-4 w-4" />
                  Download Attachment
                </button>
                <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <SendIcon className="h-4 w-4" />
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-12 text-center">
              <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a message</h3>
              <p className="text-muted-foreground">Choose a communication from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

