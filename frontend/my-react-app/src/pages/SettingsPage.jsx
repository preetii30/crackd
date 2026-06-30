import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, logout } from '../services/authService'

function SettingsPage() {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    setToken(authToken)
    
    const storedUser = localStorage.getItem('crackd_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (_error) {
        console.error('Error parsing user')
      }
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Account Settings</h1>
        <p className="mt-2 text-slate-400">Manage your account preferences and security.</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white"> Security & Privacy</h2>
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left text-white hover:bg-slate-950/70 transition">
            Change Password
          </button>
          <button className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left text-white hover:bg-slate-950/70 transition">
            Two-Factor Authentication
          </button>
          <button className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-left text-white hover:bg-slate-950/70 transition">
            View Activity Log
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white">⚙️ Preferences</h2>
        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Email notifications for analysis updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Weekly progress digest</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-slate-300">Marketing emails</span>
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white">🚪 Session</h2>
        <p className="mt-2 text-slate-400 text-sm">Sign out from your account.</p>
        <button 
          onClick={handleLogout}
          className="mt-4 w-full rounded-full bg-rose-500/20 border border-rose-400/30 px-6 py-3 text-rose-300 font-semibold hover:bg-rose-500/30 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
