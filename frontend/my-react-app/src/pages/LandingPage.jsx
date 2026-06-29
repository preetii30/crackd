import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Github, Linkedin } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'

const dashboardVariants = {
  hidden: { opacity: 0, y: 150, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 180,
      mass: 0.9,
    },
  },
  float: {
    y: [0, -12, 0],
    rotate: [0, 1, 0, -1, 0],
    scale: [1, 1.01, 1],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

const heroStyles = `
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`

const features = [
  { title: 'ATS-first feedback', body: 'Get actionable scoring and keyword guidance tailored to your target role.' },
  { title: 'AI-powered review', body: 'Gemini analyzes your resume structure, content quality, and experience depth.' },
  { title: 'Clear next steps', body: 'Follow suggestions for projects, certifications, and improvements that lift your profile.' },
]

const steps = ['Upload your PDF', 'Let Gemini review it', 'Improve with real recommendations']

const benefits = ['Faster application prep', 'Sharper resume positioning', 'Higher confidence across interviews']

const developers = [
  {
    name: 'Preeti Patidar',
    role: "MCA'28",
    institute: 'Motilal Nehru National Institute of Technology',
    linkedin: 'https://www.linkedin.com/in/preeti-patidar-783607308/',
    github: 'https://github.com/preetii30',
  },
  {
    name: 'Dhawal Gilke',
    role: "MCA'28",
    institute: 'Motilal Nehru National Institute of Technology',
    linkedin: 'https://www.linkedin.com/in/dhawal-gilke-346a24230/',
    github: 'https://github.com/pureDhawal',
  },
]

const stackItems = ['MERN Stack', 'Gemini AI', 'Cloudinary']

function AnimatedCounter({ value, prefix = '', suffix = '', className }) {
  const motionValue = useMotionValue(0)
  const displayValue = useTransform(motionValue, (latest) => `${prefix}${Math.round(latest)}${suffix}`)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.4,
      delay: 1.8,
      ease: [0.22, 1, 0.36, 1],
    })

    return controls.stop
  }, [motionValue, value])

  return <motion.span className={className}>{displayValue}</motion.span>
}

function LandingPage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  const rotateX = useTransform(smoothY, [-30, 30], [4, -4])
  const rotateY = useTransform(smoothX, [-30, 30], [-4, 4])

  const handleMouseMove = (event) => {
    const { clientX, clientY, currentTarget } = event
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    const x = ((clientX - left) / width - 0.5) * 60
    const y = ((clientY - top) / height - 0.5) * 60
    mouseX.set(x)
    mouseY.set(y)
  }

  return (
    <>
      <style>{heroStyles}</style>
      <div className="min-h-screen bg-[#030712] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="group flex items-center gap-3 cursor-pointer">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 transition-transform duration-300 group-hover:animate-floating">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/25">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <div className="transition-transform duration-300 group-hover:animate-floating">
            <p className="text-lg font-semibold text-white">cracKd</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">AI Resume Analyst</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">Login</Link>
          <Link to="/signup" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Get Started</Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <motion.div
            className="absolute inset-0 -z-10 overflow-hidden rounded-[2.5rem]"
            style={{
              background: 'linear-gradient(135deg, #020617 0%, #061c2f 45%, #0a2745 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradientMove 12s ease infinite',
            }}
          >
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <motion.div
              className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[150px]"
              animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[-15%] left-[10%] h-80 w-80 rounded-full bg-sky-500/15 blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, 25, 0], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>

          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300"
            >
              AI-powered resume feedback for modern applicants
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-5xl font-black leading-[0.88] tracking-[-0.06em] text-white sm:text-6xl md:text-8xl"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}
            >
              Improve your resume
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                with AI.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-xl leading-8 text-slate-400"
            >
              ResumeIQ analyzes your resume for ATS performance, clarity, and role-fit so you can submit stronger applications with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/signup" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Get Started</Link>
              <Link to="/login" className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">Watch Demo</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400"
            >
              <span>✓ ATS optimization</span>
              <span>✓ Real AI analysis</span>
              <span>✓ Actionable upgrades</span>
            </motion.div>
          </div>

          <motion.div
            className="relative min-h-[420px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mouseX.set(0)
              mouseY.set(0)
            }}
            style={{ x: smoothX, y: smoothY, rotateX, rotateY, transformPerspective: 1200 }}
          >
            <motion.div
              variants={dashboardVariants}
              initial="hidden"
              animate={['visible', 'float']}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_80px_rgba(2,132,199,0.25)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%)]" />
              <div className="relative space-y-6">
                <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-6">
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Resume score</p>
                  <div className="mt-4 flex items-end gap-3">
                    <AnimatedCounter value={84} className="text-5xl font-semibold text-white" />
                    <span className="pb-2 text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '84%' }}
                      transition={{ delay: 1.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                    <p className="text-sm font-medium text-slate-300">ATS score</p>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      <AnimatedCounter value={91} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                    <p className="text-sm font-medium text-slate-300">Keywords</p>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      <AnimatedCounter value={12} prefix="+" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Features" title="Everything you need to sharpen your resume" description="A focused experience for candidates who want real feedback and practical next steps." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/30">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How it works" title="From upload to insight in minutes" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/20 text-sm font-semibold text-cyan-300">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step}</h3>
                <p className="mt-3 text-slate-400">ResumeIQ takes your PDF and turns it into a professional review grounded in AI analysis.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Benefits" title="Get the clarity you need before sending your next application" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8 text-slate-200">
                <p className="text-lg font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Testimonials" title="Trusted by candidates preparing for their next move" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {['“ResumeIQ helped me rework my summary and align my skills for product roles.”', '“The suggestions were specific and easy to apply immediately.”', '“I finally understood why my applications were getting ignored.”'].map((quote) => (
              <div key={quote} className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">
                <p>{quote}</p>
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mb-10 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Built with intent</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">Developed By</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {developers.map((developer, index) => (
                <motion.div
                  key={developer.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, scale: 1.01, boxShadow: '0 0 0 1px rgba(34,211,238,0.18), 0 20px 50px rgba(34,211,238,0.16)' }}
                  className="rounded-[24px] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,132,199,0.12)] backdrop-blur-xl transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-lg font-semibold text-cyan-300">
                    {developer.name.charAt(0)}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{developer.name}</h3>
                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">{developer.role}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{developer.institute}</p>
                  <div className="mt-8 flex items-center gap-3">
                    <a href={developer.linkedin} className="rounded-full border border-white/10 p-2.5 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300" aria-label="LinkedIn">
                      <Linkedin size={18} />
                    </a>
                    <a href={developer.github} className="rounded-full border border-white/10 p-2.5 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300" aria-label="GitHub">
                      <Github size={18} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(2,132,199,0.12)] backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold text-white">Technology Stack</h3>
              <div className="mt-8 space-y-4">
                {stackItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ResumeIQ. Built for real job seekers.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-cyan-300">About</a>
            <a href="#" className="transition hover:text-cyan-300">Contact</a>
            <a href="#" className="transition hover:text-cyan-300">Privacy Policy</a>
            <a href="#" className="transition hover:text-cyan-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

export default LandingPage
