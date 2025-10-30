import { PlusIcon, SearchIcon, PhoneIcon } from "lucide-react"

const students = [
  { id: 1, name: "John Doe", grade: "5A", age: 11, parent: "Mary Doe", contact: "+1234567890" },
  { id: 2, name: "Jane Smith", grade: "4B", age: 10, parent: "Robert Smith", contact: "+1234567891" },
  { id: 3, name: "Michael Brown", grade: "6C", age: 12, parent: "Sarah Brown", contact: "+1234567892" },
  { id: 4, name: "Emily Davis", grade: "5A", age: 11, parent: "James Davis", contact: "+1234567893" },
  { id: 5, name: "David Wilson", grade: "3A", age: 9, parent: "Linda Wilson", contact: "+1234567894" },
]

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records and information
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search students..."
            className="h-10 w-full rounded-md border bg-background pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Class</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Age</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Parent/Guardian</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-sm">{student.grade}</td>
                  <td className="px-4 py-3 text-sm">{student.age}</td>
                  <td className="px-4 py-3 text-sm">{student.parent}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                      {student.contact}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
