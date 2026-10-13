import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const bonuses = [
  {
    title: "One On One 30 Minute Business Consultation",
    price: "20,000/-",
  },
  {
    title: "1 Year Complimentary Access To All Happy Life Astro Beta Tools",
    price: "4,999/-",
  },
  {
    title: "Access to 4 Offline 1 Day Workshops",
    price: "1,999/-",
  },
  {
    title: "12 Exclusive Live FAQs Session",
    price: "2,999/-",
  },
]

const BonusSection = ({ course }) => {
  const ref = useRef(null)

  // Use API bonuses if available
  const apiBonuses = course?.bonuses || [];

  useEffect(() => {
    if (apiBonuses.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.bonus-heading',
        { opacity: 0, y: 50, filter: 'blur(14px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power4.out', stagger: 0.12,
          scrollTrigger: { trigger: '.bonus-heading', start: 'top 87%' }
        }
      )

      gsap.fromTo('.bonus-card',
        { opacity: 0, y: 40, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.12,
          scrollTrigger: { trigger: '.bonus-card', start: 'top 85%' }
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [apiBonuses])

  // Hide the entire section if no bonuses exist in API
  if (apiBonuses.length === 0) return null;

  return (
    <section ref={ref} className="max-w-7xl mx-auto mb-24 px-4 md:px-0">
      {/* Top accent */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-20" />

      {/* Heading */}
      <div className="text-center space-y-4 mb-16">
        <span className="bonus-heading block font-montserrat text-[9px] text-accent tracking-[0.7em] uppercase font-bold opacity-70">
          Exclusive Bonuses / Zero Cost
        </span>
        <h2 className="bonus-heading font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
          Unlock These For Free —{' '}
          <span className="text-accent underline-lime">No Cost, Just Value!</span>
        </h2>
        <p className="bonus-heading font-montserrat text-xs text-description tracking-[0.3em] uppercase">
          (Applicable only when you buy 1 Year Plan)
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiBonuses.map((b, i) => (
          <div
            key={i}
            className="bonus-card group relative border border-white/8 bg-white/[0.01] backdrop-blur-xl p-8 flex items-center justify-between gap-6 hover:border-accent/30 hover:bg-accent/[0.02] transition-all duration-600 overflow-hidden"
          >
            {/* Background number watermark */}
            <div className="absolute top-2 left-3 font-montserrat text-[80px] font-black text-white/[0.02] leading-none select-none pointer-events-none group-hover:text-accent/[0.04] transition-colors duration-700">
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Left: text */}
            <div className="relative z-10 space-y-3 flex-1">
              <p className="font-montserrat text-sm text-description font-medium tracking-wide leading-relaxed">
                {b.title}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-4 h-[1px] bg-accent/40" />
                <span className="font-montserrat text-xs text-accent font-black tracking-[0.3em]">
                  Price: {b.price}
                </span>
              </div>
            </div>

            {/* Right: FREE badge */}
            <div className="relative z-10 shrink-0 flex flex-col items-center justify-center bg-accent w-14 h-20 group-hover:scale-105 transition-transform duration-400">
              <span
                className="font-montserrat text-dark font-black text-[9px] tracking-[0.15em] uppercase"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.25em' }}
              >
                Free
              </span>
            </div>

            {/* Hover line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
        ))}
      </div>

      {/* Bottom accent */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mt-20" />
    </section>
  )
}

export default BonusSection
