function MetricCard({ label, value, accent = 'from-cyan-400 to-sky-500' }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
      <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm font-medium uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}

export default MetricCard
