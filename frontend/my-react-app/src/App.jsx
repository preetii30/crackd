import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import LogoIntro from './components/LogoIntro'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ResumeAnalysisPage from './pages/ResumeAnalysisPage'
import AISuggestionsPage from './pages/AISuggestionsPage'
import InterviewQuestionsPage from './pages/InterviewQuestionsPage'
import CoverLetterPage from './pages/CoverLetterPage'
import AnalyticsPage from './pages/AnalyticsPage'
import DownloadReportPage from './pages/DownloadReportPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('crackd_theme') || 'dark')

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light')
    document.body.classList.toggle('theme-dark', theme === 'dark')
    localStorage.setItem('crackd_theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-950'}`}>
        {showIntro ? <LogoIntro onComplete={() => setShowIntro(false)} /> : null}
        <Toaster position="top-right" toastOptions={{ className: theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-950' }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Dashboard Routes with Sidebar Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
            <Route path="/ai-suggestions" element={<AISuggestionsPage />} />
            <Route path="/interview-questions" element={<InterviewQuestionsPage />} />
            <Route path="/cover-letter" element={<CoverLetterPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/download-report" element={<DownloadReportPage />} />
            <Route path="/settings" element={<SettingsPage theme={theme} setTheme={setTheme} />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
