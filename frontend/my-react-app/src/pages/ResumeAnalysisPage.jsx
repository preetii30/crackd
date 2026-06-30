import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAuthToken } from '../services/authService'
import { getResumeReport, getResumeHistory, deleteResumeReport } from '../services/resumeService'
import MetricCard from '../components/MetricCard'
import ProgressBar from '../components/ProgressBar'

function ResumeAnalysisPage() {
  const [token, setToken] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    setToken(authToken)
    loadHistory()
  }, [navigate, search, sort])

  const loadHistory = async () => {
    try {
      const response = await getResumeHistory(search, sort)
      const reports = response?.data?.reports || []
      setHistory(reports)
      
      if (reports.length > 0) {
        const currentActive = reports[0]
        setSelectedReport(currentActive)
        
        if ((currentActive.status === 'uploaded' || currentActive.status === 'analyzing') && !intervalRef.current) {
          pollReport(currentActive._id)
        }
      }
    } catch (_error) {
      setError('Unable to load analysis history.')
    }
  }

  const pollReport = (reportId) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          if (report.status === 'analyzed' || report.status === 'failed') {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      await deleteResumeReport(reportId)
      toast.success('Resume deleted successfully')
      await loadHistory()
      setSelectedReport(null)
    } catch (err) {
      toast.error('Failed to delete resume')
    }
  }

  const activeAnalysis = selectedReport?.analysis || null

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Analysis</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Resume Analysis</h1>
        <p className="mt-2 text-slate-400">View detailed analysis and metrics for your resumes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">History</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Your Reports</h2>
            </div>
            <div className="flex items-center gap-3">
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search reports..." 
                className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 outline-none focus:border-cyan-400/30" 
              />
              <select 
                value={sort} 
                onChange={(event) => setSort(event.target.value)} 
                className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">No reports yet.</p>
            ) : (
              history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setSelectedReport(item)
                    if(item.status === 'uploaded' || item.status === 'analyzing') {
                      pollReport(item._id)
                    }
                  }}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                    selectedReport?._id === item._id 
                      ? 'border-cyan-400/40 bg-cyan-400/10' 
                      : 'border-white/10 bg-slate-950/50 hover:bg-slate-950/70'
                  }`}
                >
                  <p className="font-medium text-white">{item.originalName}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Status</p>
          {selectedReport ? (
            <>
              <h2 className="mt-2 text-xl font-semibold text-white">{selectedReport.originalName}</h2>
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 inline-block">
                <p className="text-sm text-cyan-300 uppercase font-semibold">{selectedReport.status}</p>
              </div>
              {selectedReport.failureReason ? (
                <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <p className="font-semibold">Reason for failure:</p>
                  <p className="mt-2 text-slate-100">{selectedReport.failureReason}</p>
                </div>
              ) : null}
              {selectedReport.analyzedAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Analyzed: {new Date(selectedReport.analyzedAt).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => handleDeleteReport(selectedReport._id)}
                className="mt-4 w-full rounded-xl bg-red-600/20 text-red-300 px-4 py-2 font-medium hover:bg-red-600/30 transition border border-red-500/30"
              >
                🗑️ Delete Resume
              </button>
            </>
          ) : (
            <p className="mt-2 text-slate-400">No report selected.</p>
          )}
        </div>
      </div>

      {selectedReport && selectedReport.status === 'analyzed' && activeAnalysis ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
            <h2 className="text-2xl font-semibold text-white">Analysis Metrics</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Overall" value={`${activeAnalysis.overallScore ?? 0}`} />
              <MetricCard label="ATS" value={`${activeAnalysis.atsScore ?? 0}`} />
              <MetricCard label="Grammar" value={`${activeAnalysis.grammarScore ?? 0}`} />
              <MetricCard label="Formatting" value={`${activeAnalysis.formattingScore ?? 0}`} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 space-y-5">
              <ProgressBar label="Technical Skills" value={activeAnalysis.technicalSkillsScore ?? 0} tone="violet" />
              <ProgressBar label="Projects" value={activeAnalysis.projectsScore ?? 0} tone="emerald" />
              <ProgressBar label="Experience" value={activeAnalysis.experienceScore ?? 0} />
              <ProgressBar label="Education" value={activeAnalysis.educationScore ?? 0} tone="emerald" />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Strengths</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {(activeAnalysis.strengths || []).map((item) => (
                    <li key={item} className="rounded-xl bg-slate-900/70 px-3 py-2">• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Weaknesses</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {(activeAnalysis.weaknesses || []).map((item) => (
                    <li key={item} className="rounded-xl bg-slate-900/70 px-3 py-2">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white">Suggested keywords</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(activeAnalysis.missingKeywords || []).map((item) => (
                  <span key={item} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">{item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white">Missing skills</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {(activeAnalysis.missingTechnicalSkills || []).map((item) => (
                  <span key={item} className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-sm text-violet-300">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white">Recommended certifications</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {(activeAnalysis.suggestedCertifications || []).map((item) => (
                  <li key={item} className="rounded-xl bg-slate-900/70 px-3 py-2">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-white">Project ideas</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {(activeAnalysis.suggestedProjects || []).map((item) => (
                  <li key={item} className="rounded-xl bg-slate-900/70 px-3 py-2">• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white">Improvements</h3>
            <div className="mt-4 space-y-3">
              {(activeAnalysis.suggestedImprovements || []).map((item, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/50 px-4 py-3 text-slate-300">
                  <p>• {item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white">Top Priority Improvements</h3>
            <div className="mt-4 space-y-3">
              {(activeAnalysis.topPriorityImprovements || []).map((item, idx) => (
                <div key={idx} className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                  <p>⚠️ {item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white">Final Summary</h3>
            <p className="mt-4 text-slate-400">{activeAnalysis.finalSummary}</p>
          </div>
        </div>
      ) : selectedReport && (selectedReport.status === 'analyzing' || selectedReport.status === 'uploaded') ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4 text-slate-300">🔄 Gemini AI is analyzing your resume...</p>
            <p className="mt-2 text-sm text-slate-400">This usually takes a few seconds.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ResumeAnalysisPage
