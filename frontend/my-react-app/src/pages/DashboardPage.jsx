import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken, logout } from '../services/authService'
import {
  LayoutDashboard,
  Map,
  CheckSquare,
  FileText,
  Video,
  BarChart2,
  User,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Circle,
  Heart,
} from 'lucide-react'

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Roadmap', icon: Map },
  { label: 'Tasks', icon: CheckSquare },
  { label: 'Resume Analyzer', icon: FileText },
  { label: 'Mock Interview', icon: Video },
  { label: 'Analytics', icon: BarChart2 },
  { label: 'Profile', icon: User },
]

const stats = [
  { label: 'Tasks Done', value: '12', delta: '↑ 25% this week' },
  { label: 'Questions Solved', value: '45', delta: '↑ 8 today' },
  { label: 'Mock Score', value: '8.5/10', delta: '↑ 0.5' },
  { label: 'Resume Score', value: '78/100', delta: '↑ 10% this week' },
]

const initialTasks = [
  { id: 1, text: 'Solve 3 Array Questions', done: false },
  { id: 2, text: 'Revise Binary Search', done: false },
  { id: 3, text: 'Resume Review', done: true },
]

const aiSuggestions = [
  { id: 1, text: 'Focus on Trees this week', priority: 'High' },
  { id: 2, text: 'Improve SQL knowledge', priority: 'Medium' },
  { id: 3, text: 'Solve medium-level DSA', priority: 'Medium' },
]

const roadmap = [
  { topic: 'Arrays', progress: 100 },
  { topic: 'Strings', progress: 80 },
  { topic: 'Trees', progress: 20 },
  { topic: 'Graphs', progress: 10 },
]

function Ring({ value = 78, size = 96 }) {
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * c
  return (
    <svg width={size} height={size} className="block bg-transparent" style={{ background: 'transparent' }}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle
          r={r}
          fill="transparent"
          stroke="url(#g1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={-c * 0.25}
          transform={`rotate(-90)`}
        />
        <foreignObject x={-r} y={-r} width={size} height={size}>
          <div className="flex h-full w-full items-center justify-center bg-transparent" style={{ background: 'transparent' }}>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">{value}%</div>
              <div className="text-xs text-slate-400">Ready</div>
            </div>
          </div>
        </foreignObject>
      </g>
    </svg>
  )
}

function Heatmap({ data = [] }) {
  return (
    <div className="grid grid-cols-7 gap-2 w-fit">
      {data.map((v, i) => (
        <div
          key={i}
          className={`h-5 w-5 rounded transition-transform transform hover:scale-110 ${
            v === 0
              ? 'bg-slate-800'
              : v === 1
              ? 'bg-emerald-600/30'
              : v === 2
              ? 'bg-emerald-500/50'
              : v === 3
              ? 'bg-emerald-500/80'
              : 'bg-emerald-400'
          } border border-white/10`}
          title={`Activity: ${v}`}
        />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [token, setToken] = useState(null)
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // const t = getAuthToken()
    // if (!t) return navigate('/login')
    // setToken(t)
    setToken('demo-token') // Demo mode - show dashboard without auth
  }, [navigate])

  const toggleTask = (id) => {
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks((s) => [{ id: Date.now(), text: newTask.trim(), done: false }, ...s])
    setNewTask('')
  }

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const heatData = Array.from({ length: 35 }).map(() => Math.floor(Math.random() * 5))

  return (
    <div className="h-auto min-h-fit flex bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-slate-900/60 backdrop-blur-md px-5 py-6 flex flex-col">
        <div className="mb-6">
          <div className="text-2xl font-bold tracking-tight text-cyan-300">Crackd</div>
          <div className="mt-2 text-xs text-slate-400">Interview Prep</div>
        </div>

        <nav className="space-y-2 flex-1">
          {sidebarItems.map((it, idx) => (
            <button
              key={it.label}
              className={`w-full flex items-center gap-3 py-3 px-3 rounded-2xl text-sm hover:bg-white/3 transition ${
                idx === 0 ? 'bg-white/3 text-cyan-300' : 'text-slate-300'
              }`}
            >
              <it.icon size={18} />
              <span className="font-medium">{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/5">
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 py-3 px-3 rounded-2xl text-sm text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 transition">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="w-full max-w-3xl mx-auto px-4">
            <label className="flex items-center bg-slate-900/60 border border-white/5 rounded-3xl px-2 py-1.5 shadow-sm">
              <Search size={18} className="text-cyan-300 mr-3" />
              <input className="bg-transparent outline-none w-full text-sm text-slate-200" placeholder="Search anything..." />
            </label>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button className="text-slate-200 hover:text-white"><Bell size={20} /></button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/50 border border-white/5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-slate-900 font-bold">D</div>
              <div className="text-sm">Dhawal</div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-2 mb-2">
          <div className="col-span-8 self-start rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 p-6 pb-4 h-fit ring-1 ring-white/5 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-cyan-300">Amazon SDE Internship | Dec 2026</div>
                <h1 className="mt-0.5 text-4xl font-bold">Welcome back, Dhawal 👋</h1>
                <p className="mt-0.5 text-slate-400 max-w-2xl text-base">Your prep rhythm is strong — focus on high-impact practice and keep the streak alive.</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-xs">
                    <Heart size={12} className="text-rose-400" />
                    <span className="text-slate-200">Streak: 12 Days</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-xs">
                    <span className="text-slate-200">Days Remaining: 180</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-28 h-28 bg-transparent">
                  <Ring value={78} size={112} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4 self-start grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md hover:scale-105 transition">
                <div className="flex flex-col items-start">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</div>
                  <div className="mt-0.5 text-lg font-bold text-white">{s.value}</div>
                  <div className="mt-0.5 text-xs text-emerald-400">{s.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 items-stretch">
          <div className="col-span-8 flex flex-col gap-2">
            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Today's Tasks</h3>
                <button className="text-cyan-300 text-sm font-medium hover:text-cyan-400">+ Add Task</button>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-slate-800/30 rounded-md transition">
                    <button onClick={() => toggleTask(t.id)} className="p-0 flex-shrink-0">
                      {t.done ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} className="text-slate-500" />}
                    </button>
                    <div className={`text-sm ${t.done ? 'line-through text-slate-400' : 'text-slate-100'}`}>{t.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-slate-400">View All Tasks →</div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">AI Suggestions</h3>
                <div className="text-sm text-slate-400">Recommended by Crackd</div>
              </div>
              <div className="grid gap-2">
                {aiSuggestions.map((a) => (
                  <div key={a.id} className="p-2 rounded-lg bg-gradient-to-r from-slate-900/50 to-slate-800/30 border border-purple-600/10 shadow-inner hover:translate-y-[-2px] transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{a.text}</div>
                        <div className="text-xs text-slate-400 mt-1">AI-driven next step</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                          a.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : a.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/20 text-slate-200'
                        }`}>{a.priority}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Preparation Activity</h3>
                <div className="text-sm text-slate-400">Last 30 Days</div>
              </div>
              <div className="mt-2">
                <Heatmap data={heatData} />
              </div>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-2">
            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Roadmap Progress</h3>
                <div className="text-sm text-slate-400">Updated 12m ago</div>
              </div>
              <div className="space-y-2">
                {roadmap.map((r) => (
                  <div key={r.topic}>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{r.topic}</span>
                      <span className="font-semibold text-white text-xs">{r.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Upcoming Deadlines</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Resume Review with Mentor</div>
                    <div className="text-xs text-slate-400">Due: 12 Jun 2026</div>
                  </div>
                  <div className="text-xs text-amber-300">2 days</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Coding Contest</div>
                    <div className="text-xs text-slate-400">Due: 20 Jun 2026</div>
                  </div>
                  <div className="text-xs text-cyan-300">15 days</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 p-2 ring-1 ring-white/5 shadow-md flex flex-col flex-1">
              <h3 className="text-lg font-semibold mb-2">Activity Timeline</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs flex-shrink-0">1</div>
                  <div className="pt-0.5">
                    <div className="font-medium text-sm">Solved: Two Sum</div>
                    <div className="text-xs text-slate-400">10 mins ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs flex-shrink-0">2</div>
                  <div className="pt-0.5">
                    <div className="font-medium text-sm">Uploaded resume</div>
                    <div className="text-xs text-slate-400">Yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
