import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAuthToken } from '../services/authService'
import { getResumeHistory, getResumeReport, generateInterviewQuestions } from '../services/resumeService'

function InterviewQuestionsPage() {
  const [history, setHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState(null)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const authToken = getAuthToken()
    if (!authToken) {
      navigate('/login')
      return
    }
    loadHistory()
  }, [navigate])

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

  const pollQuestions = (reportId) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          // Stop polling when interviewQuestions data exists
          if (report.interviewQuestions && Object.keys(report.interviewQuestions).length > 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setGenerating(false)
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
      console.error('Error loading report:', error)
    }
  }

  const handleGenerateQuestions = async () => {
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
      await generateInterviewQuestions(selectedReport._id)
      toast.success('Interview questions generation started!')
      // Start polling for questions
      pollQuestions(selectedReport._id)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate questions')
      setGenerating(false)
    }
  }

  const questions = selectedReport?.interviewQuestions || {}
  const isGenerating = generating

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Interview Prep</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Interview Questions</h1>
        <p className="mt-2 text-slate-400">Role-specific interview questions based on your resume and technical skills.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold text-white">Your Reports</h2>
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
                  <p className="text-xs text-slate-400 mt-1">{item.status === 'analyzed' ? '✓ Analyzed' : 'Analyzing...'}</p>
                </button>
              ))
            )}
          </div>
          <button
            onClick={handleGenerateQuestions}
            disabled={!selectedReport || selectedReport.status !== 'analyzed' || generating}
            className="mt-6 w-full rounded-xl bg-cyan-600 text-white px-4 py-3 font-medium hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
                  <path stroke="currentColor" strokeWidth="2" d="M4 12a8 8 0 018-8" strokeLinecap="round"/>
                </svg>
                Generating...
              </>
            ) : 'Generate Questions'}
          </button>
        </div>

        {isGenerating ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block">
                <div className="animate-spin h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
              </div>
              <p className="mt-6 text-slate-300 font-medium">❓ Generating Interview Questions...</p>
              <p className="mt-2 text-sm text-slate-400">Our AI is creating personalized interview questions based on your resume and technical skills.</p>
              <p className="mt-2 text-xs text-slate-500">This may take 30-60 seconds. Please do not refresh.</p>
            </div>
          </div>
        ) : selectedReport && questions && Object.keys(questions).length > 0 ? (
          <div className="space-y-6">
            {questions.technicalQuestions && questions.technicalQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">⚙️ Technical Questions</h3>
                  {selectedReport?.interviewQuestions?.generatedAt && (
                    <span className="text-xs text-slate-400">
                      Generated: {new Date(selectedReport.interviewQuestions.generatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {questions.technicalQuestions.slice(0, 5).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpandedQuestion(expandedQuestion === `tech-${idx}` ? null : `tech-${idx}`)}
                      className="w-full text-left rounded-xl border border-slate-700 bg-slate-950/50 p-4 hover:bg-slate-950/70 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{q.question}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {q.topic} • <span className={`${
                              q.difficulty === 'advanced' ? 'text-red-400' :
                              q.difficulty === 'intermediate' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>{q.difficulty}</span>
                          </p>
                        </div>
                        <span className="text-slate-400">▼</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {questions.projectQuestions && questions.projectQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white">📁 Project-based Questions</h3>
                <div className="mt-4 space-y-2">
                  {questions.projectQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                      <p className="font-medium text-white text-sm">{q.question}</p>
                      {q.expectedAnswer && (
                        <p className="text-xs text-slate-300 mt-3 p-2 bg-slate-900/50 rounded-lg">
                          💡 Expected: {q.expectedAnswer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.systemDesignQuestions && questions.systemDesignQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white">🏗️ System Design Questions</h3>
                <div className="mt-4 space-y-2">
                  {questions.systemDesignQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                      <p className="font-medium text-white text-sm">{q.question}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Complexity: <span className={`${
                          q.complexity === 'hard' ? 'text-red-400' :
                          q.complexity === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>{q.complexity}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.behavioralQuestions && questions.behavioralQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white">🤝 Behavioral Questions</h3>
                <div className="mt-4 space-y-2">
                  {questions.behavioralQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                      <p className="font-medium text-white text-sm">{q.question}</p>
                      <p className="text-xs text-slate-400 mt-2">Related to: {q.relatedTo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-slate-400">{loading ? 'Loading...' : 'Generate questions to get interview prep'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewQuestionsPage
