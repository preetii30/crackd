export default function LogoBadge({ className }) {
  return (
    <div className={`inline-flex h-20 w-20 items-center justify-center rounded-[30px] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_60px_rgba(34,211,238,0.45)] ${className}`}>
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="44" height="44" rx="16" fill="currentColor" opacity="0.12"/>
        <path d="M20.5 9L14 24.5H21.5L13.5 39L29 20.5H20.5L28.5 9H20.5Z" fill="currentColor"/>
      </svg>
    </div>
  )
}
