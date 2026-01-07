import { useState, useEffect } from "react"
import { SaveIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getSchoolSettings, saveSchoolSettings, type SchoolSettings } from "@/lib/settings"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: '',
    currentAcademicYear: '2024-2025',
    timezone: 'Africa/Kampala',
    language: 'en',
    currency: 'UGX',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await getSchoolSettings()
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await saveSchoolSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure system preferences and school information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* School Information */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">School Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={settings.schoolName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter school name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={settings.address || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Enter school address"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail || ''}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="school@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={settings.contactPhone || ''}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="+256 XXX XXX XXX"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Website</label>
              <input
                type="url"
                name="website"
                value={settings.website || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="https://www.example.com"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Principal Name</label>
                <input
                  type="text"
                  name="principalName"
                  value={settings.principalName || ''}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Enter principal name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={settings.registrationNumber || ''}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Enter registration number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Year */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Year</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Current Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="currentAcademicYear"
                value={settings.currentAcademicYear}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="2024-2025"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Academic Year Start</label>
                <input
                  type="date"
                  name="academicYearStart"
                  value={settings.academicYearStart ? settings.academicYearStart.split('T')[0] : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value ? `${e.target.value}T00:00:00.000Z` : ''
                    setSettings((prev) => ({ ...prev, academicYearStart: dateValue }))
                  }}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Academic Year End</label>
                <input
                  type="date"
                  name="academicYearEnd"
                  value={settings.academicYearEnd ? settings.academicYearEnd.split('T')[0] : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value ? `${e.target.value}T00:00:00.000Z` : ''
                    setSettings((prev) => ({ ...prev, academicYearEnd: dateValue }))
                  }}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone || 'Africa/Kampala'}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                <select
                  name="language"
                  value={settings.language || 'en'}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  name="currency"
                  value={settings.currency || 'UGX'}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="UGX">UGX (Ugandan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
