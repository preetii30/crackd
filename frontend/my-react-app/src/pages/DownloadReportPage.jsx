import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, Download, CheckCircle, Package, Loader2 } from 'lucide-react'
import { getAuthToken } from '../services/authService'
import { getResumeHistory, downloadResumeReport } from '../services/resumeService'

function DownloadReportPage() {
  const [history, setHistory] = useState([])
  const [downloading, setDownloading] = useState({})
  const navigate = useNavigate()

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
      const response = await getResumeHistory('', 'desc')
      const reports = response?.data?.reports || []
      setHistory(reports)
    } catch (_error) {
      console.error('Unable to load reports')
      toast.error('Unable to load reports list')
    }
  }

  const handleDownloadPDF = async (reportId, fileName) => {
    setDownloading((prev) => ({ ...prev, [reportId]: true }))
    try {
      const response = await downloadResumeReport(reportId)
      const fileBlob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error(error?.response?.data?.message || 'Unable to download the report.')
    } finally {
      setDownloading((prev) => ({ ...prev, [reportId]: false }))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Export</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Download Reports</h1>
        <p className="mt-2 text-slate-400">Download your analysis reports as PDF documents.</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Available Reports</h2>
        </div>
        
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    item.status === 'analyzed' && !downloading[item._id]
                      ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {downloading[item._id] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">What's Included</h2>
        </div>
        <ul className="mt-4 space-y-3 text-slate-300">
          {[
            'Complete analysis metrics and scores',
            'Strengths and weaknesses breakdown',
            'Actionable improvement suggestions',
            'Recommended skills and certifications',
            'Professional formatting for sharing'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-1" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DownloadReportPage
