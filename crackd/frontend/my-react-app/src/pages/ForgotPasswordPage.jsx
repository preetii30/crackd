import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    setMessage('If this email is registered, a password reset link has been sent.')
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-slate-950/90 p-10 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">cracKd</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Forgot password?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter your email and we’ll send you a link to reset your password securely.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 block w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
              placeholder="name@example.com"
            />
            {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
            {message && <p className="mt-2 text-sm text-cyan-300">{message}</p>}
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-cyan-300 transition hover:text-white">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
