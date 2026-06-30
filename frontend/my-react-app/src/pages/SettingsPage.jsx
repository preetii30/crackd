import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, logout, getCurrentUser, updateProfile } from '../services/authService'

function SettingsPage({ theme, setTheme }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('crackd_notifications')
    return stored ? stored === 'true' : true
  })
  const [activeSection, setActiveSection] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        localStorage.setItem('crackd_user', JSON.stringify(currentUser))
      } catch (error) {
        console.error('Failed to load user profile:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  useEffect(() => {
    localStorage.setItem('crackd_notifications', String(notificationsEnabled))
  }, [notificationsEnabled])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleThemeChange = (themeValue) => {
    setTheme(themeValue)
    setStatusType('success')
    setStatusMessage(`Switched to ${themeValue} theme.`)
  }

  const handlePasswordSave = async () => {
    try {
      setStatusMessage('')
      setStatusType('')
      await updateProfile({ currentPassword: passwordForm.currentPassword, password: passwordForm.newPassword })
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setStatusType('success')
      setStatusMessage('Password updated successfully.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update password.'
      setStatusType('error')
      setStatusMessage(message)
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings…</div>
  }

  const items = [
    { id: 'profile', title: 'Profile', description: 'Edit your profile information', icon: 'user' },
    { id: 'security', title: 'Security', description: 'Update your password', icon: 'shield' },
    { id: 'appearance', title: 'Appearance', description: 'Switch your dashboard theme', icon: 'palette' },
    { id: 'notifications', title: 'Notifications', description: 'Manage alerts and emails', icon: 'bell' },
    { id: 'logout', title: 'Logout', description: 'Sign out from your account', icon: 'logout', hideChevron: true },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <section className="space-y-2 rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Settings</p>
        <h1 className="text-3xl font-semibold">Manage your account preferences</h1>
        <p className="text-sky-300">Choose a section to update your profile, security, theme, or notifications.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'logout') {
                  handleLogout()
                } else {
                  setActiveSection(item.id)
                }
              }}
              className={`flex w-full items-center gap-4 rounded-[2rem] border px-5 py-4 text-left transition ${
                activeSection === item.id
                  ? 'border-sky-400 bg-sky-500/10 text-sky-100'
                  : 'border-white/10 bg-slate-950 text-slate-100 hover:border-sky-400 hover:bg-slate-900/80'
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950">
                {item.icon === 'user' && <UserIcon />}
                {item.icon === 'shield' && <ShieldIcon />}
                {item.icon === 'palette' && <PaletteIcon />}
                {item.icon === 'bell' && <BellIcon />}
                {item.icon === 'logout' && <LogoutIcon />}
              </span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-sky-300">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6">
          {activeSection === 'profile' && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Profile</p>
                <h2 className="text-2xl font-semibold">Update your personal information</h2>
                <p className="text-sky-300">Use the profile page to edit your full details and contact info.</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FieldLabel label="Full Name" value={user.fullName} />
                <FieldLabel label="Email" value={user.email} />
                <FieldLabel label="Username" value={user.username || 'Not set'} />
                <FieldLabel label="Bio" value={user.bio || 'Add a short bio on your profile page'} />
              </div>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Open Profile Page
              </button>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Security</p>
                <h2 className="text-2xl font-semibold">Change your password</h2>
                <p className="text-sky-300">Enter your current password and choose a new secure password.</p>
              </div>
              <div className="mt-6 space-y-4">
                <label className="space-y-2 text-sm text-slate-100">
                  <span>Current Password</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-100">
                  <span>New Password</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                    className="w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-400"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sky-300">A stronger password keeps your account safer.</p>
                <button
                  type="button"
                  onClick={handlePasswordSave}
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Save Password
                </button>
              </div>
            </>
          )}

          {activeSection === 'appearance' && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Appearance</p>
                <h2 className="text-2xl font-semibold">Theme preferences</h2>
                <p className="text-sky-300">Switch between dark and light mode for the dashboard.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <ThemeButton selected={theme === 'dark'} label="Dark" onClick={() => handleThemeChange('dark')} />
                <ThemeButton selected={theme === 'light'} label="Light" onClick={() => handleThemeChange('light')} />
              </div>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Notifications</p>
                <h2 className="text-2xl font-semibold">Alert settings</h2>
                <p className="text-sky-300">Toggle whether you want to receive updates and alerts.</p>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950 px-5 py-4">
                <div>
                  <p className="font-medium text-white">Email notifications</p>
                  <p className="text-sm text-sky-300">Enabled for new reports and announcements.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
                    notificationsEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </>
          )}

          {statusMessage ? (
            <p className={`mt-6 text-sm ${statusType === 'error' ? 'text-rose-400' : 'text-sky-300'}`}>
              {statusMessage}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function FieldLabel({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-4">
      <p className="text-sm uppercase tracking-[0.3em] text-sky-300">{label}</p>
      <p className="mt-2 text-slate-100">{value}</p>
    </div>
  )
}

function ThemeButton({ selected, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl px-5 py-3 text-sm font-semibold transition ${
        selected ? 'bg-sky-500 text-slate-950' : 'bg-slate-950 text-slate-100 hover:bg-slate-900'
      }`}
    >
      {label}
    </button>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5.25-3.5 10.74-8 12-4.5-1.26-8-6.75-8-12V6l8-4z" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M12 2C7.58 2 4 5.58 4 10c0 3.5 2.5 6.5 6 7-1 .5-1.5 1.5-1.5 2.5 0 1 .75 1.5 1.5 1.5 5.5 0 10-4.5 10-10S16.5 2 12 2z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export default SettingsPage
