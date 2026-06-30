import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../services/authService'
import { getResumeHistory } from '../services/resumeService'

function AnalyticsPage() {
  const [token, setToken] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    analyzedReports: 0,
    averageScore: 0,
    topScore: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    setToken(authToken)
    loadHistory()
  }, [navigate])

  const loadHistory = async () => {
    try {
      const response = await getResumeHistory('', 'desc')
      const reports = response?.data?.reports || []
      setHistory(reports)
      
      // Calculate stats
      const analyzedReports = reports.filter(r => r.status === 'analyzed')
      const scores = analyzedReports.map(r => r.analysis?.overallScore || 0)
      
      setStats({
        totalReports: reports.length,
        analyzedReports: analyzedReports.length,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        topScore: scores.length > 0 ? Math.max(...scores) : 0
      })
    } catch (_error) {
      console.error('Unable to load reports')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Insights</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Analytics</h1>
        <p className="mt-2 text-slate-400">View your resume analysis history and statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Total Reports</p>
          <p className="mt-3 text-3xl font-bold text-white">{stats.totalReports}</p>
          <p className="mt-2 text-xs text-slate-400">Uploaded & Analyzed</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Analyzed</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">{stats.analyzedReports}</p>
          <p className="mt-2 text-xs text-slate-400">Completed Analysis</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Average Score</p>
          <p className="mt-3 text-3xl font-bold text-cyan-400">{stats.averageScore}%</p>
          <p className="mt-2 text-xs text-slate-400">Overall Average</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Best Score</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">{stats.topScore}%</p>
          <p className="mt-2 text-xs text-slate-400">Highest Achievement</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white">📊 Recent Reports</h2>
        <div className="mt-6 space-y-3">
          {history.length === 0 ? (
            <p className="text-slate-400">No reports yet. Upload a resume to get started.</p>
          ) : (
            history.map((item) => (
              <div 
                key={item._id}
                className="rounded-xl border border-white/10 bg-slate-950/50 p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{item.originalName}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                </div>
                
                <div className="text-right">
                  {item.status === 'analyzed' && item.analysis ? (
                    <div>
                      <p className="text-xl font-bold text-cyan-400">{item.analysis.overallScore}%</p>
                      <p className="text-xs text-slate-400">Overall Score</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">{item.status}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
