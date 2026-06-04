export default function GoogleButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 ${className}`}
      {...props}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 shadow-inner shadow-white/5">
        <svg viewBox="0 0 46 46" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M23 9.5c3.5 0 6.3 1.2 8.2 2.3l6-6C34.6 2.9 29.5 0 23 0 14.7 0 7.4 4.6 3.4 11.5l6.9 5.4C12.5 12.9 17.4 9.5 23 9.5z" />
          <path fill="#34A853" d="M44.5 20H23v6.5h12.1c-1.1 3.3-3.7 6-7.1 7.8l7.1 5.5c4.2-3.9 6.8-9.7 6.8-16.3 0-1.1-.1-2.2-.4-3.5z" />
          <path fill="#FBBC05" d="M9.8 26.9c-.6-1.8-.9-3.7-.9-5.7s.3-3.9.9-5.7L2.9 14.1C1 17.9 0 21.9 0 26s1 8.1 2.9 11.9l6.9-5z" />
          <path fill="#EA4335" d="M23 46c6.2 0 11.4-2 15.2-5.4l-7.1-5.5c-2 1.4-4.6 2.2-8.1 2.2-5.6 0-10.5-3.4-12.3-8.3l-6.9 5C7.4 41.4 14.7 46 23 46z" />
        </svg>
      </span>
      {children}
    </button>
  )
}
