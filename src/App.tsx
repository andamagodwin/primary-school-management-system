import { useState } from 'react'
import './App.css'
import { Sidebar } from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import ClassesPage from './pages/ClassesPage'
import AttendancePage from './pages/AttendancePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'students':
        return <StudentsPage />
      case 'teachers':
        return <TeachersPage />
      case 'classes':
        return <ClassesPage />
      case 'attendance':
        return <AttendancePage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      
      <main className="flex-1 lg:ml-64">
        <div className="container mx-auto p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
