import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import DashboardPage from '@/pages/DashboardPage'
import StudentsPage from '@/pages/StudentsPage'
import AddStudentPage from '@/pages/AddStudentPage'
import TeachersPage from '@/pages/TeachersPage'
import AddTeacherPage from '@/pages/AddTeacherPage'
import ClassesPage from '@/pages/ClassesPage'
import AddClassPage from '@/pages/AddClassPage'
import AttendancePage from '@/pages/AttendancePage'
import TeacherAttendancePage from '@/pages/TeacherAttendancePage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'
import SchoolEventsPage from '@/pages/SchoolEventsPage'
import StaffManagementPage from '@/pages/StaffManagementPage'
import SchoolReportsPage from '@/pages/SchoolReportsPage'
import UNEBCommunicationsPage from '@/pages/UNEBCommunicationsPage'
import MarksEntryPage from '@/pages/MarksEntryPage'
import ExamsUploadPage from '@/pages/ExamsUploadPage'
import LessonPlansPage from '@/pages/LessonPlansPage'
import MyStudentsPage from '@/pages/MyStudentsPage'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user)
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      
      <main className="flex-1 lg:ml-64">
        <div className="container mx-auto p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/add" element={<AddStudentPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/teachers/add" element={<AddTeacherPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/add" element={<AddClassPage />} />
            <Route 
              path="/attendance" 
              element={user?.userType === 'teacher' ? <TeacherAttendancePage /> : <AttendancePage />} 
            />
            <Route path="/events" element={<SchoolEventsPage />} />
            <Route path="/staff-management" element={<StaffManagementPage />} />
            <Route path="/reports" element={<SchoolReportsPage />} />
            <Route path="/uneb-communications" element={<UNEBCommunicationsPage />} />
            {/* Teacher routes */}
            <Route path="/marks" element={<MarksEntryPage />} />
            <Route path="/exams" element={<ExamsUploadPage />} />
            <Route path="/lesson-plans" element={<LessonPlansPage />} />
            <Route path="/my-students" element={<MyStudentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
