import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../services/authService'
import { uploadResume, getResumeReport, getResumeHistory } from '../services/resumeService'
import MetricCard from '../components/MetricCard'

function DashboardPage() {
  const [token, setToken] = useState(null)
  const [userName, setUserName] = useState('Student')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recentStats, setRecentStats] = useState({
    overall: 0,
    ats: 0,
    grammar: 0,
    formatting: 0
  })
  const [loading, setLoading] = useState(true)
  const [pollActive, setPollActive] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const authToken = getAuthToken()
    const storedUser = localStorage.getItem('crackd_user')
    if (!authToken) {
      navigate('/login')
      return
    }
    setToken(authToken)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUserName(parsedUser?.fullName || parsedUser?.email || 'Student')
      } catch (_error) {
        setUserName('Student')
      }
    }
    loadRecentStats()
  }, [navigate])

  const loadRecentStats = async () => {
    try {
      const response = await getResumeHistory('', 'desc')
      const reports = response?.data?.reports || []
      
      if (reports.length > 0) {
        const latestAnalyzed = reports.find(r => r.status === 'analyzed')
        if (latestAnalyzed?.analysis) {
          const analysis = latestAnalyzed.analysis
          setRecentStats({
            overall: analysis.overallScore || 0,
            ats: analysis.atsScore || 0,
            grammar: analysis.grammarScore || 0,
            formatting: analysis.formattingScore || 0
          })
          setPollActive(false)
        }
      }
      setLoading(false)
    } catch (_error) {
      setLoading(false)
    }
  }

  const startPollingStats = () => {
    setPollActive(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeHistory('', 'desc')
        const reports = response?.data?.reports || []
        
        if (reports.length > 0) {
          const latestAnalyzed = reports.find(r => r.status === 'analyzed')
          if (latestAnalyzed?.analysis) {
            const analysis = latestAnalyzed.analysis
            setRecentStats({
              overall: analysis.overallScore || 0,
              ats: analysis.atsScore || 0,
              grammar: analysis.grammarScore || 0,
              formatting: analysis.formattingScore || 0
            })
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setPollActive(false)
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 3000)
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) {
      setError('Please choose a PDF resume first.')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setUploading(true)
      setError('')
      setSuccess('')
      const response = await uploadResume(formData)
      setSuccess(response?.data?.message || 'Resume uploaded and analysis started.')
      setFile(null)
      event.target.reset()
      
      // Start polling for stats
      startPollingStats()
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || 'Resume upload failed.')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Welcome</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Hello, {userName}! 👋</h1>
        <p className="mt-3 text-slate-400">Upload your resume to get AI-powered analysis and improve your chances.</p>
      </div>

      {/* Resume Upload */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">📄 Upload Your Resume</h2>
        <p className="mt-2 text-slate-400">Supported formats: PDF, DOCX. Max size: 5MB</p>
        
        <form onSubmit={handleUpload} className="mt-6 space-y-4">
          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-400/30 transition">
            <input 
              type="file" 
              accept="application/pdf,.docx" 
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
              <p className="text-3xl mb-2">📁</p>
              <p className="text-white font-medium">Click or drag your resume here</p>
              <p className="text-sm text-slate-400 mt-2">{file ? file.name : 'No file selected'}</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              ❌ {error}
            </div>
          ) : null}
          
          {success ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              ✓ {success}
            </div>
          ) : null}

          <button 
            type="submit" 
            disabled={uploading || !file}
            className="w-full rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Uploading & Analyzing...' : '🚀 Upload and Analyze'}
          </button>
        </form>
      </div>

      {/* 4 Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">📊 Latest Analysis Scores</h2>
          {pollActive && (
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              Updating in real-time...
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading your latest scores...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Overall" value={`${recentStats.overall}`} />
            <MetricCard label="ATS" value={`${recentStats.ats}`} />
            <MetricCard label="Grammar" value={`${recentStats.grammar}`} />
            <MetricCard label="Formatting" value={`${recentStats.formatting}`} />
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">🚀 Next Steps</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <a href="/resume-analysis" className="rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <p className="font-semibold text-white">📋 Resume Analysis</p>
            <p className="mt-2 text-sm text-slate-400">View detailed analysis</p>
          </a>
          <a href="/ai-suggestions" className="rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <p className="font-semibold text-white">✨ AI Suggestions</p>
            <p className="mt-2 text-sm text-slate-400">Get improvement tips</p>
          </a>
          <a href="/analytics" className="rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <p className="font-semibold text-white">📊 Analytics</p>
            <p className="mt-2 text-sm text-slate-400">View your progress</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage