import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Lock } from 'lucide-react'
import { googleAuth, signup } from '../services/authService'
import GoogleButton from '../components/GoogleButton'
import LogoBadge from '../components/LogoBadge'

const initialState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

function SignupPage() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [form, setForm] = useState(initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    setApiError('')

    try {
      setLoading(true)
      await googleAuth({ credential: credentialResponse?.credential })
      navigate('/dashboard')
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Google sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const next = {}

    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'

    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'

    if (!form.acceptTerms) next.acceptTerms = 'You must accept the terms and conditions.'

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
      await signup({ fullName: form.fullName, email: form.email, password: form.password })
      toast.success('Account created successfully')
      navigate('/dashboard')
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950/90 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10 backdrop-blur-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.14),_transparent_22%)]" />
        <div className="relative px-6 py-12 lg:px-12 lg:py-16">
          <div className="mb-10 text-center">
            <LogoBadge className="mx-auto" />
            <p className="mt-4 text-sm uppercase tracking-[0.35em] text-cyan-300">Analyze. Improve. Get Hired.</p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Land More Interviews with AI
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Upload your resume and get instant ATS scoring, job recommendations, and personalized improvement suggestions.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[1.75rem] bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/60 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Join Crackd Today</h2>
              <p className="mt-1 text-sm text-slate-400">Create your Crackd account and start your AI-powered career journey.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-3 block w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="mt-2 text-sm text-rose-400">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-3 block w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative mt-3">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center rounded-full p-2 text-slate-400 transition hover:text-white"
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
                {errors.password && <p className="mt-2 text-sm text-rose-400">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                  Confirm password
                </label>
                <div className="relative mt-3">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="block w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center rounded-full p-2 text-slate-400 transition hover:text-white"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
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
                {errors.confirmPassword && <p className="mt-2 text-sm text-rose-400">{errors.confirmPassword}</p>}
              </div>

              <label className="inline-flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="leading-6">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-cyan-300 hover:text-white">
                    terms and conditions
                  </a>
                  .
                </span>
              </label>
              {errors.acceptTerms && <p className="text-sm text-rose-400">{errors.acceptTerms}</p>}

              {apiError && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{apiError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}
              >
                {loading ? 'Creating account…' : 'Start My Journey'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-px flex-1 bg-white/5" />
              <span>OR</span>
              <span className="h-px flex-1 bg-white/5" />
            </div>

            {googleClientId ? (
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setApiError('Google sign up failed. Please try again.')} />
            ) : (
              <GoogleButton disabled>Sign up with Google</GoogleButton>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <Lock className="h-4 w-4 text-cyan-400" />
              Your resume data is encrypted and secure.
            </p>
            <p className="mt-2 text-center text-sm text-slate-400">Trusted by 1000+ students and job seekers</p>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-white">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
