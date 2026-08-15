import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  Upload, 
  FileText, 
  Sparkles, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  Loader2 
} from 'lucide-react'
import { getAuthToken } from '../services/authService'
import { uploadResume, getResumeHistory } from '../services/resumeService'
import MetricCard from '../components/MetricCard'

function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
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

  useEffect(() => {
    const authToken = getAuthToken()
    const storedUser = localStorage.getItem('crackd_user')
    if (!authToken) {
      navigate('/login')
      return
    }
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
            toast.success('Resume analysis completed!')
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
      toast.error('Please choose a PDF resume first.')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setUploading(true)
      const response = await uploadResume(formData)
      toast.success(response?.data?.message || 'Resume uploaded and analysis started.')
      setFile(null)
      event.target.reset()
      
      startPollingStats()
    } catch (uploadError) {
      toast.error(uploadError?.response?.data?.message || 'Resume upload failed.')
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
        <h1 className="mt-3 text-4xl font-bold text-white">Hello, {userName}!</h1>
        <p className="mt-3 text-slate-400">Upload your resume to get AI-powered analysis and improve your interview chances.</p>
      </div>

      {/* Resume Upload */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-semibold text-white">Upload Your Resume</h2>
        </div>
        <p className="mt-2 text-slate-400">Supported format: PDF. Max size: 5MB</p>
        
        <form onSubmit={handleUpload} className="mt-6 space-y-4">
          <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-400/30 transition">
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-cyan-400 mb-2" />
              <p className="text-white font-medium">Click or drag your resume here</p>
              <p className="text-sm text-slate-400 mt-2">{file ? file.name : 'No file selected'}</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading || !file}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading & Analyzing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload and Analyze
              </>
            )}
          </button>
        </form>
      </div>

      {/* 4 Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Latest Analysis Scores</h2>
          </div>
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
        <h2 className="text-xl font-semibold text-white">Next Steps</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link to="/resume-analysis" className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <p className="font-semibold text-white">Resume Analysis</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-400">View detailed analysis</p>
          </Link>
          <Link to="/ai-suggestions" className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <p className="font-semibold text-white">AI Suggestions</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-400">Get improvement tips</p>
          </Link>
          <Link to="/analytics" className="flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition hover:border-cyan-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <p className="font-semibold text-white">Analytics</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-400">View your progress</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage