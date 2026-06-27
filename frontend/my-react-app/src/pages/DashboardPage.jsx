import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, logout } from '../services/authService'
// 🌟 FIX 1: getResumeReport ko yahan import add kiya hai
import { deleteResumeReport, getResumeHistory, uploadResume, getResumeReport } from '../services/resumeService'
import MetricCard from '../components/MetricCard'
import ProgressBar from '../components/ProgressBar'

function DashboardPage() {
  const [token, setToken] = useState(null)
  const [userName, setUserName] = useState('Student')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  
  // Active intervals ko clear karne ke liye Ref repository
  const intervalRef = useRef(null)

  const loadHistory = async () => {
    try {
      const response = await getResumeHistory(search, sort)
      const reports = response?.data?.reports || []
      setHistory(reports)
      
      // Pehle se selected report ko active rakhein ya fir list ki latest report select karein
      if (reports.length > 0) {
        const currentActive = reports.find(r => r._id === selectedReport?._id) || reports[0];
        setSelectedReport(currentActive);
        
        // FIX 2: Agar page load hone par latest report processing state me hai toh polling shuru karein
        if ((currentActive.status === 'uploaded' || currentActive.status === 'analyzing') && !intervalRef.current) {
          pollReport(currentActive._id);
        }
      }
    } catch (_error) {
      setError('Unable to load analysis history right now.')
    }
  }

  const pollReport = (reportId) => {
    // Agar pehle se koi interval chal raha ho toh use band karo
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const response = await getResumeReport(reportId)
        const report = response?.data?.report
        if (report) {
          setSelectedReport(report)
          setHistory((current) => current.map((item) => (item._id === report._id ? report : item)))
          
          if (report.status === 'analyzed' || report.status === 'failed') {
            clearInterval(intervalRef.current)
            intervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(intervalRef.current)
        intervalRef.current = null;
      }
    }, 3000) // Har 3 second me background worker check karega
  }

  // Cleanup component on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
    loadHistory()
  }, [navigate, search, sort])

  const activeAnalysis = useMemo(() => selectedReport?.analysis || null, [selectedReport])

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
      
      // Report creation response check
      const newReport = response?.data?.report;
      if (newReport) {
        setSelectedReport(newReport);
        setHistory(prev => [newReport, ...prev]);
        pollReport(newReport._id);
      } else {
        await loadHistory();
      }
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || 'Resume upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (id) => {
    try {
      if (selectedReport?._id === id && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      await deleteResumeReport(id)
      setSuccess('Report removed.')
      setSelectedReport(null)
      await loadHistory()
    } catch (_error) {
      setError('Unable to delete this report.')
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">ResumeIQ dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back, {userName}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Upload a PDF resume and get a live AI analysis with ATS, skills, and improvement guidance.</p>
          </div>
          <button onClick={handleSignOut} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Logout</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{userName}</h2>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">Authenticated</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6">
              <h2 className="text-xl font-semibold text-white">Resume Upload</h2>
              <p className="mt-2 text-sm text-slate-400">Upload a PDF only. Files larger than 5MB are rejected.</p>
              <form onSubmit={handleUpload} className="mt-6 space-y-4">
                <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300" />
                {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
                {success ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</p> : null}
                <button type="submit" disabled={uploading} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70">{uploading ? 'Uploading…' : 'Upload and analyze'}</button>
              </form>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Analysis history</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Recent reports</h2>
              </div>
              <div className="flex items-center gap-3">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 outline-none" />
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 outline-none">
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {history.length === 0 ? <p className="text-sm text-slate-400">No reports yet. Upload a resume to get started.</p> : history.map((item) => (
                <button key={item._id} onClick={() => { setSelectedReport(item); if(item.status === 'uploaded' || item.status === 'analyzing') { pollReport(item._id); } }} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${selectedReport?._id === item._id ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-slate-950/70'}`}>
                  <div>
                    <p className="font-medium text-white">{item.originalName}</p>
                    <p className="mt-1 text-sm text-slate-400">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{item.status}</span>
                    <button type="button" onClick={(event) => { event.stopPropagation(); handleRemove(item._id) }} className="text-sm text-rose-300">Delete</button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedReport ? (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live resume report</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedReport?.originalName}</h2>
                <p className="mt-2 text-slate-400">
                  {selectedReport.status === 'analyzing' || selectedReport.status === 'uploaded' 
                    ? '🔄 Gemini AI processing running... Data will populate automatically.' 
                    : (activeAnalysis?.finalSummary || 'No summary available.')}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300 uppercase">
                Status: {selectedReport?.status}
              </div>
            </div>

            {selectedReport.status === 'analyzed' && activeAnalysis ? (
              <>
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Overall" value={`${activeAnalysis.overallScore ?? 0}`} />
                  <MetricCard label="ATS" value={`${activeAnalysis.atsScore ?? 0}`} />
                  <MetricCard label="Grammar" value={`${activeAnalysis.grammarScore ?? 0}`} />
                  <MetricCard label="Formatting" value={`${activeAnalysis.formattingScore ?? 0}`} />
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <div className="space-y-5 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <ProgressBar label="Technical Skills" value={activeAnalysis.technicalSkillsScore ?? 0} tone="violet" />
                    <ProgressBar label="Projects" value={activeAnalysis.projectsScore ?? 0} tone="emerald" />
                    <ProgressBar label="Experience" value={activeAnalysis.experienceScore ?? 0} />
                    <ProgressBar label="Education" value={activeAnalysis.educationScore ?? 0} tone="emerald" />
                  </div>
                  <div className="space-y-5 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Strengths</h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-400">
                        {(activeAnalysis.strengths || []).map((item) => <li key={item} className="rounded-2xl bg-slate-900/70 px-3 py-2">• {item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Weaknesses</h3>
                      <ul className="mt-3 space-y-2 text-sm text-slate-400">
                        {(activeAnalysis.weaknesses || []).map((item) => <li key={item} className="rounded-2xl bg-slate-900/70 px-3 py-2">• {item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <h3 className="text-lg font-semibold text-white">Suggested keywords</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(activeAnalysis.missingKeywords || []).map((item) => <span key={item} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">{item}</span>)}
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <h3 className="text-lg font-semibold text-white">Missing skills</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(activeAnalysis.missingTechnicalSkills || []).map((item) => <span key={item} className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-sm text-violet-300">{item}</span>)}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <h3 className="text-lg font-semibold text-white">Recommended certifications</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-400">
                      {(activeAnalysis.suggestedCertifications || []).map((item) => <li key={item} className="rounded-2xl bg-slate-900/70 px-3 py-2">• {item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                    <h3 className="text-lg font-semibold text-white">Project ideas</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-400">
                      {(activeAnalysis.suggestedProjects || []).map((item) => <li key={item} className="rounded-2xl bg-slate-900/70 px-3 py-2">• {item}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                  <h3 className="text-lg font-semibold text-white">AI recommendations</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-400">
                    {(activeAnalysis.suggestedImprovements || []).map((item) => <li key={item} className="rounded-2xl bg-slate-900/70 px-3 py-2">• {item}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
                <p className="mt-4 text-base text-slate-300 font-medium">Analyzing your resume content via Gemini AI...</p>
                <p className="mt-1 text-sm text-slate-500">This usually takes around 5-10 seconds. Please wait.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardPage