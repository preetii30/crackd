import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../services/authService'

function ProfileDropdown() {
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

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
            console.error('Error parsing user')
          }
        }
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/50 hover:bg-slate-900/70 transition px-3 py-2"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-slate-800">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{getInitials()}</span>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-white hidden sm:inline">{user?.fullName || user?.email || 'Profile'}</span>
        <svg className={`w-4 h-4 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-white/10 bg-slate-900 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-4 border-b border-white/10">
            <p className="text-sm font-semibold text-white">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              navigate('/settings')
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-3 text-sm text-slate-100 hover:bg-slate-900/50 transition"
          >
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
