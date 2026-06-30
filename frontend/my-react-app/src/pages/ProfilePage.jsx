import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, getCurrentUser, updateProfile } from '../services/authService'

function ProfilePage() {
  const [user, setUser] = useState({ fullName: '', username: '', email: '', bio: '', profilePic: '' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const profile = await getCurrentUser()
        setUser({
          fullName: profile.fullName || '',
          username: profile.username || '',
          email: profile.email || '',
          bio: profile.bio || '',
          profilePic: profile.profilePic || '',
        })
      } catch (error) {
        console.error('Unable to fetch profile:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleSave = async () => {
    try {
      await updateProfile(user)
      alert('Profile changes saved.')
    } catch (error) {
      console.error('Profile save failed:', error)
      alert(error?.response?.data?.message || 'Unable to save profile')
    }
  }

  if (loading) {
    return <div className="p-6">Loading profile…</div>
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        setUser((prev) => ({ ...prev, profilePic: reader.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Profile</p>
          <h1 className="text-3xl font-semibold text-inherit">Manage your personal information</h1>
        </div>
      </header>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative inline-flex h-28 w-28 rounded-full overflow-hidden border border-white/10 bg-slate-950">
            <img
              src={
                user.profilePic
                  ? user.profilePic
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=1d2938&color=ffffff&size=128`
              }
              alt="Profile avatar"
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M5 20h14v-2H5v2zm7-18l5 5h-3v4h-4V7H7l5-5z" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            onClick={handlePhotoClick}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
              <path d="M5 20h14v-2H5v2zm7-18l5 5h-3v4h-4V7H7l5-5z" />
            </svg>
            Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        <div className="mt-10 space-y-4">
          <FieldRow
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z" />
              </svg>
            }
            label="Full Name"
            value={user.fullName}
            onChange={(value) => setUser((prev) => ({ ...prev, fullName: value }))}
          />

          <FieldRow
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 4h6v2H9v-2z" />
              </svg>
            }
            label="Username"
            value={user.username}
            onChange={(value) => setUser((prev) => ({ ...prev, username: value }))}
          />

          <FieldRow
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm11 2l-5 3-5-3v2l5 3 5-3V8z" />
              </svg>
            }
            label="Email"
            value={user.email}
            onChange={(value) => setUser((prev) => ({ ...prev, email: value }))}
            type="email"
          />

          <FieldRow
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
                <path d="M5 20h14v-2H5v2zm13-11.59L12.41 14 10 11.59 16.59 5H18v1.41z" />
              </svg>
            }
            label="Bio"
            value={user.bio}
            onChange={(value) => setUser((prev) => ({ ...prev, bio: value }))}
            textarea
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 font-semibold"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current" aria-hidden="true">
            <path d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-4-4zm0 2l3 3h-3V5zM9 13h6v2H9v-2zm0 4h6v2H9v-2zM9 7h6v2H9V7z" />
          </svg>
          Save Changes
        </button>
      </div>
    </div>
  )
}

function FieldRow({ icon, label, value, onChange, textarea, type = 'text' }) {
  return (
    <label className="grid gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-4 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
        />
      )}
    </label>
  )
}

export default ProfilePage
