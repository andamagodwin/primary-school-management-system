import { BookOpenIcon, PlusIcon } from "lucide-react"

const classes = [
  { id: 1, name: "Grade 1A", students: 25, teacher: "Mrs. Anderson", room: "101" },
  { id: 2, name: "Grade 1B", students: 24, teacher: "Mr. Thompson", room: "102" },
  { id: 3, name: "Grade 2A", students: 26, teacher: "Mrs. Martinez", room: "201" },
  { id: 4, name: "Grade 2B", students: 25, teacher: "Mr. Lee", room: "202" },
  { id: 5, name: "Grade 3A", students: 28, teacher: "Mrs. White", room: "301" },
  { id: 6, name: "Grade 3B", students: 27, teacher: "Mr. Garcia", room: "302" },
]

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
          <p className="text-muted-foreground">
            Manage class sections and assignments
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" />
          Add Class
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpenIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">Room {cls.room}</p>
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                  {cls.students} students
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Class Teacher</span>
                <span className="font-medium">{cls.teacher}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
