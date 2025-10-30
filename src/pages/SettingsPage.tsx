export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure system preferences and options
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">School Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">School Name</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter school name"
                defaultValue="Primary School Management System"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter school address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="school@example.com"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Year</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Academic Year</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                defaultValue="2024-2025"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
