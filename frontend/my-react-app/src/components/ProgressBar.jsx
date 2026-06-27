function ProgressBar({ label, value, tone = 'cyan' }) {
  const colorClass = {
    cyan: 'from-cyan-400 to-sky-500',
    emerald: 'from-emerald-400 to-green-500',
    violet: 'from-violet-400 to-fuchsia-500',
  }[tone]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full bg-gradient-to-r ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
