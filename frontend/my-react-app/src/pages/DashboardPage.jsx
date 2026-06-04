import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, logout } from '../services/authService'

function DashboardPage() {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    setToken(authToken)
  }, [navigate])

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/50 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="mb-8 rounded-3xl bg-slate-950/80 p-8 shadow-inner shadow-slate-950/20">
            <h1 className="text-3xl font-semibold text-white">Welcome to Crackd</h1>
            <p className="mt-3 text-slate-300">
              You are signed in to the Crackd authentication demo. This dashboard shows a professional SaaS flow with JWT handling and secure navigation.
            </p>
          </div>

          <div className="space-y-6 rounded-3xl bg-slate-950/70 p-8">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-300/90">Auth token</p>
            <p className="mt-4 break-words text-sm text-slate-200">{token}</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex rounded-3xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
