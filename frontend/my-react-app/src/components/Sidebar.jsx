import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Mail, 
  BarChart3, 
  Download, 
  Settings,
  ChevronDown,
  Menu,
  LogOut,
  User
} from 'lucide-react'
import { getCurrentUser, logout } from '../services/authService'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home },
    { id: 'resume-analysis', label: 'Resume Analysis', path: '/resume-analysis', icon: FileText },
    { id: 'ai-suggestions', label: 'AI Suggestions', path: '/ai-suggestions', icon: Sparkles },
    { id: 'interview', label: 'Interview Questions', path: '/interview-questions', icon: HelpCircle },
    { id: 'cover-letter', label: 'Cover Letter', path: '/cover-letter', icon: Mail },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { id: 'download', label: 'Download Report', path: '/download-report', icon: Download },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  ]

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (_error) {
        const storedUser = localStorage.getItem('crackd_user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (_error2) {
            // ignore
          }
        }
      }
    }
    loadUser()
  }, [])

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
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900/95 border-r border-white/10 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-950">cr</span>
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-wide">
                  crackd
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-slate-400 mt-0.5">
                  ai resume analyst
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={() => setOpenProfile(!openProfile)}
              className="w-full flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-left transition hover:bg-slate-900/80"
            >
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.fullName ? user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User Name'}</p>
                <p className="text-xs text-slate-400">Keep Coding</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-white transition-transform ${openProfile ? 'rotate-180' : ''}`} />
            </button>

            {openProfile ? (
              <div className="mt-3 space-y-2 rounded-3xl border border-white/10 bg-slate-950/90 p-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile')
                    setOpenProfile(false)
                  }}
                  className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-slate-100 hover:bg-slate-900/50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
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
