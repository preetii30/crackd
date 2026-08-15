import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Camera, User, AtSign, Mail, FileText, Save } from 'lucide-react'
import { getAuthToken, getCurrentUser, updateProfile } from '../services/authService'

function ProfilePage() {
  const [user, setUser] = useState({ fullName: '', username: '', email: '', bio: '', profilePic: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        toast.error('Session expired. Please log in again.')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateProfile(user)
      toast.success('Profile changes saved successfully!')
    } catch (error) {
      console.error('Profile save failed:', error)
      toast.error(error?.response?.data?.message || 'Unable to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-400">Loading profile...</div>
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
        toast.success('Photo selected! Click Save Changes to apply.')
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white hover:bg-slate-800 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Profile</p>
          <h1 className="text-3xl font-semibold text-white">Manage your personal information</h1>
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
            <button
              type="button"
              onClick={handlePhotoClick}
              className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-cyan-400 hover:text-white transition"
              aria-label="Upload new photo"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handlePhotoClick}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <Camera className="h-4 w-4 text-cyan-400" />
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
            icon={<User className="h-5 w-5 text-cyan-400" />}
            label="Full Name"
            value={user.fullName}
            onChange={(value) => setUser((prev) => ({ ...prev, fullName: value }))}
          />

          <FieldRow
            icon={<AtSign className="h-5 w-5 text-cyan-400" />}
            label="Username"
            value={user.username}
            onChange={(value) => setUser((prev) => ({ ...prev, username: value }))}
          />

          <FieldRow
            icon={<Mail className="h-5 w-5 text-cyan-400" />}
            label="Email"
            value={user.email}
            onChange={(value) => setUser((prev) => ({ ...prev, email: value }))}
            type="email"
          />

          <FieldRow
            icon={<FileText className="h-5 w-5 text-cyan-400" />}
            label="Bio"
            value={user.bio}
            onChange={(value) => setUser((prev) => ({ ...prev, bio: value }))}
            textarea
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition disabled:opacity-70"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function FieldRow({ icon, label, value, onChange, textarea, type = 'text' }) {
  return (
    <label className="grid gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950">
          {icon}
        </span>
        <span className="font-medium text-white">{label}</span>
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-4 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-4 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
        />
      )}
    </label>
  )
}

export default ProfilePage
