import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { googleAuth, login } from '../services/authService'
import GoogleButton from '../components/GoogleButton'
import LogoBadge from '../components/LogoBadge'

const initialState = {
  email: '',
  password: '',
  remember: false,
}

function LoginPage() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [form, setForm] = useState(initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError('')

    try {
      setLoading(true)
      await googleAuth({ credential: credentialResponse?.credential })
      toast.success('Welcome back to ResumeIQ')
      navigate('/dashboard')
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Google sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const next = {}

    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      next.password = 'Password is required.'
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError('')

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      await login({ email: form.email, password: form.password })
      toast.success('Signed in successfully')
      navigate('/dashboard')
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
          <LogoBadge className="mx-auto" />

          <h1 className="text-5xl font-bold tracking-tight text-white">cracKd</h1>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Crack Interviews. Build Confidence. Get Hired.</p>
        </div>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-400">
          Sign in to analyze resumes, track interview readiness, and move faster from application to offer.
        </p>

        <form className="mx-auto w-full max-w-md space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            <label htmlFor="email" className="block text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="block w-full rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-sm text-rose-400">{errors.email}</p>}
          </div>

          <div className="space-y-3">
            <label htmlFor="password" className="block text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="block w-full rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3.5 pr-12 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center rounded-full p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1l22 22" />
                    <path d="M17.94 17.94A10.97 10.97 0 0 1 12 19c-5.18 0-9.44-3.28-11-8 1.1-2.95 3.1-5.4 5.66-6.79" />
                    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 3.47-5.97" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-sm text-rose-400">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
              />
              Remember me for 30 days
            </label>
            <Link to="/forgot-password" className="text-sm text-cyan-400 transition hover:text-cyan-300">
              Forgot Password?
            </Link>
          </div>

          {apiError && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{apiError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee, #06b6d4)' }}
          >
            {loading ? 'Signing in…' : 'Continue to Dashboard'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            🚀 AI Resume Analyzer • Mock Interviews • ATS Score
          </p>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">
            Trusted by 1000+ job seekers
          </p>
        </form>

        <div className="flex items-center gap-4 pt-4">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-slate-500">OR</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {googleClientId ? (
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setApiError('Google sign in failed. Please try again.')} />
        ) : (
          <GoogleButton disabled>Continue with Google</GoogleButton>
        )}

        <p className="text-sm text-slate-400">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-cyan-400 transition hover:text-cyan-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
