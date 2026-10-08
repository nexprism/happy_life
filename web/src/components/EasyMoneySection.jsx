import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const problems = [
  "Lack of flexibility",
  "High startup costs",
  "Increased financial risk",
  "Lower profit margins",
  "Work-life imbalance",
  "Complicated workflows",
  "Burnout",
  "Inconsistent income",
]

const outcomes = [
  "A clear action plan for launching your empire.",
  "Ability to use AI tools for 10X Productivity.",
  "Position and price your offers correctly.",
  "A personal brand that attracts clients effortlessly.",
]

const EasyMoneySection = () => {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      const reveal = (selector, fromVars, extraVars = {}) => {
        gsap.fromTo(selector, fromVars, {
          ...{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)', scale: 1 },
          ...extraVars,
          scrollTrigger: { trigger: selector, start: 'top 87%' },
        })
      }

      reveal('.em-title',   { opacity: 0, y: 60, filter: 'blur(16px)' }, { duration: 1.5, ease: 'power4.out', stagger: 0.12 })
      reveal('.em-video',   { opacity: 0, y: 50, scale: 0.96 },          { duration: 1.6, ease: 'power3.out' })
      reveal('.em-desc',    { opacity: 0, y: 30 },                        { duration: 1.1, ease: 'power3.out' })
      reveal('.em-sub',     { opacity: 0, y: 40 },                        { duration: 1.1, ease: 'power3.out' })
      reveal('.em-problem', { opacity: 0, x: -24, scale: 0.95 },          { duration: 0.7, ease: 'power3.out', stagger: 0.08 })
      reveal('.em-outcome', { opacity: 0, x: 24, scale: 0.95 },           { duration: 0.7, ease: 'power3.out', stagger: 0.08 })
      reveal('.em-cta',     { opacity: 0, y: 30 },                        { duration: 1.2, ease: 'power3.out' })

    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="max-w-5xl mx-auto mb-24 px-4 md:px-0">

      {/* ── Top accent line ── */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent mb-10" />

      {/* ══ HEADING ══ */}
      <div className="text-center space-y-4 mb-14">
        <h2 className="em-title font-newsreader italic text-[clamp(2.8rem,7vw,5.5rem)] text-normal font-extralight leading-[0.92] tracking-tight">
          Making <span className="text-accent underline-lime">$2000/month</span> is Easy
        </h2>
        <p className="em-title font-Montserrat text-[11px] text-accent tracking-[0.5em] uppercase font-bold opacity-70">
          Exact Frameworks that works
        </p>
      </div>

      {/* ══ VIDEO ══ */}
      <div className="em-video relative group mb-16">
        {/* Corner brackets */}
        {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} border-accent z-30 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-500`} style={{ transitionDelay: `${i * 60}ms` }} />
        ))}
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-dark/90 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-Montserrat text-[9px] text-description tracking-[0.5em] uppercase">LIVE / Blueprint Session</span>
          </div>
          <span className="font-Montserrat text-[8px] text-accent tracking-[0.4em] uppercase opacity-70">14+ Yrs Experience</span>
        </div>
        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 bg-gradient-to-t from-dark/90 to-transparent pointer-events-none">
          <span className="font-Montserrat text-[8px] text-description/80 tracking-widest italic">Astrology Framework / Happy Life Astro</span>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-accent rounded-full" />
            <span className="font-Montserrat text-[8px] text-accent tracking-[0.4em] uppercase">Happy Life Astro</span>
          </div>
        </div>
        {/* Scanline */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.15) 3px,rgba(255,255,255,0.15) 4px)' }} />
        {/* iframe 16:9 */}
        <div className="relative w-full overflow-hidden border border-white/10 group-hover:border-accent/30 transition-colors duration-700" style={{ paddingTop: '56.25%' }}>
          <iframe
            src="https://www.youtube.com/embed/-ijlKuChjuk?controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&enablejsapi=1"
            title="Happy Life Astro Masterclass Session"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="absolute inset-0 w-full h-full" style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* ══ DESCRIPTION ══ */}
      <p className="em-desc font-Montserrat text-sm text-description leading-[2.1] tracking-wide text-center max-w-3xl mx-auto mb-24">
        Learn the exact astrological principles and comprehensive framework perfected through real-world consultation and practice. Master ancient wisdom tailored for the modern era and achieve your full potential.
      </p>

      {/* ═══ MORE THAN A COURSE ═══ */}
      <div className="em-sub text-center mb-10 space-y-6 border-t border-white/5 pt-10">
        <h3 className="font-newsreader italic text-[clamp(1.8rem,4vw,3.2rem)] text-normal font-extralight">
          It's More Than Just a <span className="text-accent">Course</span>
        </h3>
        <p className="font-Montserrat text-sm text-description leading-[2] tracking-wide max-w-2xl mx-auto">
          It's a transformational blueprint with personalized training and mentorship, you'll gain the skills to become a thought leader and a personal brand.
        </p>
      </div>

      {/* ═══ SOLVE YOUR BIGGEST PROBLEMS ═══ */}
      <div className="mb-10 border-t border-white/5 pt-10">
        <h3 className="em-sub font-newsreader italic text-[clamp(1.8rem,4vw,3rem)] text-normal font-extralight text-center mb-12">
          Solve Your Biggest <span className="text-accent">Problems</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PROBLEMS GRID (Red Glowing) */}
          {problems.map((p, i) => (
            <div key={i} className="em-problem group flex items-center gap-5 px-6 py-5 bg-red-500/[0.06] border-l-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.05)] transition-all duration-500">
              <div className="w-8 h-8 rounded-full border border-red-500/60 flex items-center justify-center shrink-0 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
              <span className="font-Montserrat text-sm text-red-500 font-normal tracking-wide uppercase italic">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ BY PROGRAM'S END (Green Glowing) ═══ */}
      <div className="mb-24 border-t border-white/5 pt-10">
        <h3 className="em-sub font-newsreader italic text-[clamp(1.8rem,4vw,3rem)] text-normal font-extralight text-center mb-12">
          By Program's End, You'll <span className="text-accent">Have</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.map((o, i) => (
            <div key={i} className="em-outcome group flex items-start gap-5 px-6 py-5 bg-accent/[0.05] border-l-2 border-accent shadow-[0_0_30px_rgba(139, 92, 246,0.08)] transition-all duration-500">
              <div className="w-8 h-8 rounded-full border border-accent/60 flex items-center justify-center shrink-0 bg-accent/20 shadow-[0_0_15px_rgba(139, 92, 246,0.5)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <span className="font-Montserrat text-sm text-accent font-normal tracking-wide leading-relaxed uppercase">{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FINAL CTA ═══ */}
      <div className="em-cta text-center space-y-10 border-t border-white/5 pt-10">
        <h3 className="font-newsreader italic text-[clamp(2rem,5vw,4rem)] text-normal font-extralight">
          Stand Out from Your <span className="text-accent underline-lime">Competitors</span>
        </h3>
        <div className="flex items-center justify-center gap-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" className="opacity-30 hidden md:block"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          <button className="group relative bg-accent px-16 py-8 overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-95 flex flex-col items-center gap-2">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 font-Montserrat text-dark text-sm font-black tracking-[0.4em] uppercase">YES, I WANT TO BE CEO OF MY LIFE</span>
            <span className="relative z-10 font-Montserrat text-dark/50 text-[9px] tracking-[0.2em] italic">(with Expert Guidance)</span>
          </button>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" className="opacity-30 hidden md:block rotate-180"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </div>
      </div>

      {/* ── Bottom accent line ── */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent mt-20" />

    </section>
  )
}

export default EasyMoneySection
