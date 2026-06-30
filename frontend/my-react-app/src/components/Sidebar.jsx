import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { id: 'resume-analysis', label: 'Resume Analysis', path: '/resume-analysis', icon: '📋' },
    { id: 'ai-suggestions', label: 'AI Suggestions', path: '/ai-suggestions', icon: '✨' },
    { id: 'interview', label: 'Interview Questions', path: '/interview-questions', icon: '❓' },
    { id: 'cover-letter', label: 'Cover Letter', path: '/cover-letter', icon: '📝' },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: '📊' },
    { id: 'download', label: 'Download Report', path: '/download-report', icon: '⬇️' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-slate-900 p-2 md:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900/95 border-r border-white/10 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-lg font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Resume</p>
                <p className="text-xs text-slate-400">Analyzer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
