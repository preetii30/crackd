import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../services/authService'
import { getResumeHistory } from '../services/resumeService'

function DownloadReportPage() {
  const [token, setToken] = useState(null)
  const [history, setHistory] = useState([])
  const [downloading, setDownloading] = useState({})
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
    } catch (_error) {
      console.error('Unable to load reports')
    }
  }

  const handleDownloadPDF = (reportId, fileName) => {
    setDownloading(prev => ({ ...prev, [reportId]: true }))
    
    // Simulate download
    setTimeout(() => {
      setDownloading(prev => ({ ...prev, [reportId]: false }))
      console.log(`Downloading report: ${fileName}`)
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Export</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Download Reports</h1>
        <p className="mt-2 text-slate-400">Download your analysis reports as PDF documents.</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white">📋 Available Reports</h2>
        
        <div className="mt-6 space-y-3">
          {history.length === 0 ? (
            <p className="text-slate-400">No reports available for download.</p>
          ) : (
            history.map((item) => (
              <div 
                key={item._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition"
              >
                <div>
                  <p className="font-medium text-white">{item.originalName}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-xs">
                    <span className={`rounded-full px-2 py-1 ${
                      item.status === 'analyzed' 
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : item.status === 'analyzing'
                        ? 'bg-yellow-400/20 text-yellow-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                  </p>
                </div>
                
                <button
                  onClick={() => handleDownloadPDF(item._id, item.originalName)}
                  disabled={item.status !== 'analyzed' || downloading[item._id]}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    item.status === 'analyzed' && !downloading[item._id]
                      ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {downloading[item._id] ? '⬇️ Downloading...' : '⬇️ Download PDF'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold text-white">📦 What's Included</h2>
        <ul className="mt-4 space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-cyan-300 mt-1">✓</span>
            <span>Complete analysis metrics and scores</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-300 mt-1">✓</span>
            <span>Strengths and weaknesses breakdown</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-300 mt-1">✓</span>
            <span>Actionable improvement suggestions</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-300 mt-1">✓</span>
            <span>Recommended skills and certifications</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-cyan-300 mt-1">✓</span>
            <span>Professional formatting for sharing</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DownloadReportPage
