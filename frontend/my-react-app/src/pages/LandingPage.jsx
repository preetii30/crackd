import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'

const features = [
  { title: 'ATS-first feedback', body: 'Get actionable scoring and keyword guidance tailored to your target role.' },
  { title: 'AI-powered review', body: 'Gemini analyzes your resume structure, content quality, and experience depth.' },
  { title: 'Clear next steps', body: 'Follow suggestions for projects, certifications, and improvements that lift your profile.' },
]

const steps = ['Upload your PDF', 'Let Gemini review it', 'Improve with real recommendations']

const benefits = ['Faster application prep', 'Sharper resume positioning', 'Higher confidence across interviews']

const faqs = [
  { question: 'What file types are supported?', answer: 'ResumeIQ accepts PDF resumes only for reliable parsing and analysis.' },
  { question: 'How fast is the analysis?', answer: 'Most resumes are reviewed within a few seconds depending on document length.' },
  { question: 'Is my resume stored securely?', answer: 'Your uploaded PDF and generated analysis are stored behind your authenticated account.' },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 font-semibold text-slate-950">RI</div>
          <div>
            <p className="text-lg font-semibold text-white">ResumeIQ</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">AI Resume Analyst</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">Login</Link>
          <Link to="/signup" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Signup</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-300">AI-powered resume feedback for modern applicants</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">Improve your resume with AI.</h1>
            <p className="mt-6 text-xl leading-8 text-slate-400">ResumeIQ analyzes your resume for ATS performance, clarity, and role-fit so you can submit stronger applications with confidence.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Start free</Link>
              <Link to="/login" className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">See dashboard</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
              <span>✓ ATS optimization</span>
              <span>✓ Real AI analysis</span>
              <span>✓ Actionable upgrades</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_35%)]" />
            <div className="relative space-y-6">
              <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Resume score</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-semibold text-white">84</span>
                  <span className="pb-2 text-slate-400">/ 100</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-sm font-medium text-slate-300">ATS score</p>
                  <p className="mt-2 text-2xl font-semibold text-white">91</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-sm font-medium text-slate-300">Keywords</p>
                  <p className="mt-2 text-2xl font-semibold text-white">+12</p>
                </div>
              </div>
            </div>
          </div>
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
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
  )
}

export default LandingPage
