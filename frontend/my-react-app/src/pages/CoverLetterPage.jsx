import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Copy, FileText, CheckCircle, Loader2, Sparkles, Check } from 'lucide-react'
import { getAuthToken } from '../services/authService'
import { getResumeHistory, getResumeReport, generateCoverLetter } from '../services/resumeService'

function CoverLetterPage() {
  const [history, setHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [coverLetters, setCoverLetters] = useState([])
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [copied, setCopied] = useState(false)
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

  const pollCoverLetters = (reportId) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setCoverLetters(report.coverLetters || [])
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          if (report.coverLetters && report.coverLetters.length > 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setGenerating(false)
            toast.success('Cover letter generated successfully!')
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
      const fetchedReport = response?.data?.report
      setSelectedReport(fetchedReport)
      setCoverLetters(fetchedReport?.coverLetters || [])
      if (fetchedReport?.coverLetters?.length > 0) {
        setSelectedLetter(fetchedReport.coverLetters[0])
      }
    } catch (error) {
      console.error('Error loading report:', error)
      toast.error('Failed to load report details')
    }
  }

  const handleGenerateCoverLetter = async () => {
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
      await generateCoverLetter(selectedReport._id, jobDescription)
      toast.success('Cover letter generation started!')
      setJobDescription('')
      pollCoverLetters(selectedReport._id)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate cover letter')
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!selectedLetter?.letterContent) return
    navigator.clipboard.writeText(selectedLetter.letterContent)
    setCopied(true)
    toast.success('Cover letter copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Generation</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Cover Letter Generator</h1>
        <p className="mt-2 text-slate-400">Generate personalized cover letters tailored to job descriptions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 space-y-4">
          <div>
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
          </div>

          {selectedReport && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">Job Description (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to tailor the cover letter..."
                className="w-full h-32 rounded-xl border border-slate-700 bg-slate-950/50 text-slate-100 p-3 placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={handleGenerateCoverLetter}
                disabled={!selectedReport || selectedReport.status !== 'analyzed' || generating}
                className="mt-3 w-full rounded-xl bg-cyan-600 text-white px-4 py-3 font-medium hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Cover Letter
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {selectedReport ? (
          <div className="space-y-6">
            {generating ? (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block">
                    <Loader2 className="animate-spin h-12 w-12 text-cyan-400" />
                  </div>
                  <p className="mt-6 text-slate-300 font-medium">Generating Cover Letter...</p>
                  <p className="mt-2 text-sm text-slate-400">Our AI is creating a personalized cover letter based on your resume and job description.</p>
                  <p className="mt-2 text-xs text-slate-500">This may take 30-60 seconds. Please do not refresh.</p>
                </div>
              </div>
            ) : coverLetters.length > 0 ? (
              <>
                <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Generated Letters ({coverLetters.length})</h3>
                  <div className="space-y-2 mb-4">
                    {coverLetters.map((letter, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedLetter(letter)}
                        className={`w-full text-left rounded-xl px-4 py-3 transition border text-sm ${
                          selectedLetter === letter
                            ? 'border-cyan-400/40 bg-cyan-400/10'
                            : 'border-white/10 bg-slate-950/50 hover:bg-slate-950/70'
                        }`}
                      >
                        <p className="font-medium text-white truncate">
                          {letter.tone ? `[${letter.tone}] ` : ''}Letter {idx + 1}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(letter.generatedAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedLetter && (
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">Cover Letter</h3>
                      </div>
                      {selectedLetter.tone && (
                        <span className="text-xs px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300">
                          {selectedLetter.tone}
                        </span>
                      )}
                    </div>

                    {selectedLetter.letterContent && (
                      <div className="bg-slate-950/50 rounded-xl p-6 mb-4 border border-slate-700">
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                          {selectedLetter.letterContent}
                        </div>
                      </div>
                    )}

                    {selectedLetter.sections && (
                      <div className="space-y-3">
                        {selectedLetter.sections.opening && (
                          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Opening</h4>
                            <p className="text-sm text-slate-300">{selectedLetter.sections.opening}</p>
                          </div>
                        )}

                        {selectedLetter.sections.bodyHighlights && selectedLetter.sections.bodyHighlights.length > 0 && (
                          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Key Highlights</h4>
                            <ul className="space-y-2">
                              {selectedLetter.sections.bodyHighlights.map((highlight, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedLetter.sections.closing && (
                          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Closing</h4>
                            <p className="text-sm text-slate-300">{selectedLetter.sections.closing}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleCopy}
                      className="mt-4 w-full rounded-xl bg-cyan-600 text-white px-4 py-2 font-medium hover:bg-cyan-700 transition flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
                <p className="text-slate-400">{loading ? 'Loading...' : 'Generate a cover letter to get started'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
            <p className="text-slate-400">Select a resume first</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoverLetterPage
