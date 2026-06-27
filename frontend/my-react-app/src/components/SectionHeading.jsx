function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={align === 'left' ? 'max-w-2xl text-left' : 'mx-auto max-w-2xl text-center'}>
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-lg leading-8 text-slate-400">{description}</p> : null}
    </div>
  )
}

export default SectionHeading
