import { PlusIcon, UserIcon } from "lucide-react"

const teachers = [
  { id: 1, name: "Mrs. Sarah Smith", subject: "Mathematics", classes: 5, students: 120 },
  { id: 2, name: "Mr. John Johnson", subject: "English", classes: 4, students: 96 },
  { id: 3, name: "Mrs. Emily Davis", subject: "Science", classes: 6, students: 144 },
  { id: 4, name: "Mr. Robert Wilson", subject: "History", classes: 3, students: 72 },
]

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
          <p className="text-muted-foreground">
            Manage teaching staff and assignments
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" />
          Add Teacher
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="rounded-lg border bg-card">
            <div className="flex items-center gap-4 border-b p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{teacher.name}</h3>
                <p className="text-sm text-muted-foreground">{teacher.subject}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold">{teacher.classes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{teacher.students}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
