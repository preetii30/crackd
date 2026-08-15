import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  HelpCircle, 
  CheckCircle, 
  Code, 
  FolderGit2, 
  Layers, 
  Users, 
  ChevronDown, 
  Lightbulb, 
  Loader2, 
  FileText 
} from 'lucide-react'
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

  const pollQuestions = (reportId) => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          if (report.interviewQuestions && Object.keys(report.interviewQuestions).length > 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setGenerating(false)
            toast.success('Interview questions generated successfully!')
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
      toast.error('Failed to load report details')
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
      pollQuestions(selectedReport._id)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate questions')
      setGenerating(false)
    }
  }

  const questions = selectedReport?.interviewQuestions || {}

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Interview Prep</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Interview Questions</h1>
        <p className="mt-2 text-slate-400">Role-specific interview questions based on your resume and technical skills.</p>
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
            onClick={handleGenerateQuestions}
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
                <HelpCircle className="w-4 h-4" />
                Generate Questions
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
              <p className="mt-6 text-slate-300 font-medium">Generating Interview Questions...</p>
              <p className="mt-2 text-sm text-slate-400">Our AI is creating personalized interview questions based on your resume and technical skills.</p>
              <p className="mt-2 text-xs text-slate-500">This may take 30-60 seconds. Please do not refresh.</p>
            </div>
          </div>
        ) : selectedReport && questions && Object.keys(questions).length > 0 ? (
          <div className="space-y-6">
            {questions.technicalQuestions && questions.technicalQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Technical Questions</h3>
                  </div>
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
                            {q.topic} - <span className={`${
                              q.difficulty === 'advanced' ? 'text-red-400' :
                              q.difficulty === 'intermediate' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>{q.difficulty}</span>
                          </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedQuestion === `tech-${idx}` ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {questions.projectQuestions && questions.projectQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Project-based Questions</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {questions.projectQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
                      <p className="font-medium text-white text-sm">{q.question}</p>
                      {q.expectedAnswer && (
                        <div className="flex items-start gap-2 text-xs text-slate-300 mt-3 p-2 bg-slate-900/50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>Expected: {q.expectedAnswer}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questions.systemDesignQuestions && questions.systemDesignQuestions.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">System Design Questions</h3>
                </div>
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
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Behavioral Questions</h3>
                </div>
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
