import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
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

function App() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {showIntro ? <LogoIntro onComplete={() => setShowIntro(false)} /> : null}
        <Toaster position="top-right" toastOptions={{ className: 'bg-slate-900 text-slate-100' }} />
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
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
