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
import DOSDashboardPage from '@/pages/DOSDashboardPage'
import ExamsManagementPage from '@/pages/ExamsManagementPage'
import StudentResultsPage from '@/pages/StudentResultsPage'
import AttendanceOverviewPage from '@/pages/AttendanceOverviewPage'
import StaffApplicationsPage from '@/pages/StaffApplicationsPage'
import SportsEventsPage from '@/pages/SportsEventsPage'
import ReportCommentsPage from '@/pages/ReportCommentsPage'
import DirectorDashboardPage from '@/pages/DirectorDashboardPage'
import FinancialOverviewPage from '@/pages/FinancialOverviewPage'
import CreateAdminAccountsPage from '@/pages/CreateAdminAccountsPage'
import ViewPortalsPage from '@/pages/ViewPortalsPage'
import AuditLogsPage from '@/pages/AuditLogsPage'
import GenerateReportsPage from '@/pages/GenerateReportsPage'
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
            {/* DOS routes */}
            <Route path="/dos/exams" element={<ExamsManagementPage />} />
            <Route path="/dos/results" element={<StudentResultsPage />} />
            <Route path="/dos/attendance" element={<AttendanceOverviewPage />} />
            <Route path="/dos/applications" element={<StaffApplicationsPage />} />
            <Route path="/dos/sports-events" element={<SportsEventsPage />} />
            <Route path="/dos/report-comments" element={<ReportCommentsPage />} />
            {/* Director (School Director) routes */}
            <Route path="/director/financial" element={<FinancialOverviewPage />} />
            <Route path="/director/create-accounts" element={<CreateAdminAccountsPage />} />
            <Route path="/director/view-dos" element={<ViewPortalsPage portalType="dos" />} />
            <Route path="/director/view-bursar" element={<ViewPortalsPage portalType="bursar" />} />
            <Route path="/director/view-headteacher" element={<ViewPortalsPage portalType="headteacher" />} />
            <Route path="/director/view-it" element={<ViewPortalsPage portalType="it" />} />
            <Route path="/director/audit-logs" element={<AuditLogsPage />} />
            <Route path="/director/reports" element={<GenerateReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
