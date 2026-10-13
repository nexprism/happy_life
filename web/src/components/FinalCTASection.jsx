import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const FinalCTASection = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-card', {
        y: 60,
        opacity: 0,
        duration: 1.5,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
        }
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="max-w-5xl mx-auto mb-44 px-4 md:px-0">
      <div className="cta-card group relative border border-white/10 bg-white/[0.02] overflow-hidden">
        
        {/* 1. Header Metadata */}
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.01]">
           <div className="flex items-center gap-3">
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              <span className="font-montserrat text-[8px] text-accent tracking-[0.4em] uppercase font-bold">Node: Operational</span>
           </div>
           <span className="font-montserrat text-[8px] text-white/20 tracking-[0.4em] uppercase font-bold">v0.2.2026</span>
        </div>

        {/* 2. Cinematic Visual Strip (Compact) */}
        <div className="relative h-44 md:h-60 overflow-hidden bg-dark">
           <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-transparent opacity-50" />
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139, 92, 246,0.1)_0%,transparent_80%)]" />
           
           {/* Scanline Animation */}
           <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-accent animate-scan-slow" />
           </div>

           <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-2">
              <p className="font-montserrat text-[8px] text-accent/40 tracking-[1em] uppercase font-bold">Protocol Initialization</p>
              <h3 className="font-montserrat text-[clamp(2rem,6vw,4rem)] text-normal font-bold tracking-tighter leading-none text-center">
                 Become the <span className="text-accent">Architect.</span>
              </h3>
           </div>
        </div>

        {/* 3. Action Hub */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-center md:text-left space-y-2">
              <h4 className="font-montserrat text-2xl md:text-3xl text-normal font-semibold tracking-tight leading-none">
                Claim full archive access.
              </h4>
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <span className="font-montserrat text-[14px] text-description/80 tracking-[0.4em] uppercase">Private Network</span>
                 <div className="w-1 h-1 bg-white/10 rounded-full" />
                 <span className="font-montserrat text-[14px] text-description/80 tracking-[0.4em] uppercase">24/7 Transmissions</span>
              </div>
           </div>

           <button className="w-full md:w-auto relative group/btn bg-accent px-10 md:px-14 py-6 transition-all duration-700 hover:scale-[1.03] active:scale-95 shadow-[0_0_30px_rgba(139, 92, 246,0.1)]">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
              <div className="flex items-center justify-center gap-6 relative z-10">
                 <span className="font-montserrat text-dark text-[10px] md:text-xs font-black tracking-[0.6em] uppercase">INITIALIZE / $499</span>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="stroke-dark group-hover/btn:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                 </svg>
              </div>
           </button>
        </div>

        {/* Lower Accents */}
        <div className="h-[1px] w-full bg-white/5" />
        <div className="px-6 py-4 flex justify-between items-center opacity-30">
           <span className="font-montserrat text-[7px] tracking-widest uppercase">Encryption Mode: SECURE</span>
           <span className="font-montserrat text-[7px] tracking-widest uppercase">Vanguard // Archive</span>
        </div>

      </div>
    </section>
  )
}

export default FinalCTASection
