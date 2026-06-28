import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LogoIntro from './components/LogoIntro'

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
