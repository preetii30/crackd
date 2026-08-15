import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles, CheckCircle, ListOrdered, Target, Zap, TrendingUp, ArrowRight, Loader2, FileText } from 'lucide-react'
import { getAuthToken } from '../services/authService'
import { getResumeHistory, getResumeReport, generateAISuggestions } from '../services/resumeService'

function AISuggestionsPage() {
  const [history, setHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await getResumeHistory('', 'desc')
      const reports = response?.data?.reports || []
      setHistory(reports)
      if (reports.length > 0) {
        setSelectedReport(reports[0])
      }
    } catch (_error) {
      toast.error('Unable to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    loadHistory()
  }, [navigate])

  const pollSuggestions = (reportId) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          if (report.aiSuggestions && Object.keys(report.aiSuggestions).length > 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setGenerating(false)
            toast.success('AI Suggestions generated successfully!')
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setGenerating(false)
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleSelectReport = async (report) => {
    setSelectedReport(report)
    try {
      const response = await getResumeReport(report._id)
      setSelectedReport(response?.data?.report)
    } catch (error) {
      console.error('Error loading report details:', error)
      toast.error('Failed to load report details')
    }
  }

  const handleGenerateSuggestions = async () => {
    if (!selectedReport) {
      toast.error('Please select a resume first')
      return
    }

    if (selectedReport.status !== 'analyzed') {
      toast.error('Resume must be analyzed first')
      return
    }

    try {
      setGenerating(true)
      await generateAISuggestions(selectedReport._id)
      toast.success('AI suggestions generation started!')
      pollSuggestions(selectedReport._id)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate suggestions')
      setGenerating(false)
    }
  }

  const suggestions = selectedReport?.aiSuggestions || {}

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Suggestions</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">AI Suggestions</h1>
        <p className="mt-2 text-slate-400">Get personalized AI recommendations to improve your resume.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Your Reports</h2>
          </div>
          <div className="mt-4 space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">No reports yet.</p>
            ) : (
              history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleSelectReport(item)}
                  className={`w-full text-left rounded-xl px-4 py-3 transition border ${
                    selectedReport?._id === item._id
                      ? 'border-cyan-400/40 bg-cyan-400/10'
                      : 'border-white/10 bg-slate-950/50 hover:bg-slate-950/70'
                  }`}
                >
                  <p className="font-medium text-white text-sm truncate">{item.originalName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {item.status === 'analyzed' ? (
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />
                    )}
                    <span className="text-xs text-slate-400">{item.status === 'analyzed' ? 'Analyzed' : 'Analyzing...'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={!selectedReport || selectedReport.status !== 'analyzed' || generating}
            className="mt-6 w-full rounded-xl bg-cyan-600 text-white px-4 py-3 font-medium hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Suggestions
              </>
            )}
          </button>
        </div>

        {generating ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block">
                <Loader2 className="animate-spin h-12 w-12 text-cyan-400" />
              </div>
              <p className="mt-6 text-slate-300 font-medium">Generating AI Suggestions...</p>
              <p className="mt-2 text-sm text-slate-400">Our AI is analyzing your resume and creating personalized recommendations.</p>
              <p className="mt-2 text-xs text-slate-500">This may take 30-60 seconds. Please do not refresh.</p>
            </div>
          </div>
        ) : selectedReport && suggestions && Object.keys(suggestions).length > 0 ? (
          <div className="space-y-6">
            {suggestions.sections && suggestions.sections.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Improvement Areas</h3>
                  </div>
                  {selectedReport?.aiSuggestions?.generatedAt && (
                    <span className="text-xs text-slate-400">
                      Generated: {new Date(selectedReport.aiSuggestions.generatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  {suggestions.sections.map((section, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{section.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          section.priority === 'high' ? 'bg-red-400/20 text-red-300' :
                          section.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
                          'bg-green-400/20 text-green-300'
                        }`}>
                          {section.priority}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {section.suggestions.map((sug, sidx) => (
                          <li key={sidx} className="text-sm text-slate-300 flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.quickWins && suggestions.quickWins.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Quick Wins</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {suggestions.quickWins.map((win, idx) => (
                    <li key={idx} className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.longTermStrategy && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Long-term Strategy</h3>
                </div>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">{suggestions.longTermStrategy}</p>
              </div>
            )}

            {suggestions.estimatedImpact && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Estimated Impact</h3>
                </div>
                <p className="mt-3 text-slate-300 text-sm">{suggestions.estimatedImpact}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-slate-400">{loading ? 'Loading...' : 'Generate suggestions to see recommendations'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISuggestionsPage
