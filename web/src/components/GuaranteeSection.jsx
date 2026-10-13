import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const GuaranteeSection = () => {
  const containerRef = useRef(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal header
      gsap.fromTo('.g-reveal', 
        { y: 60, opacity: 0, filter: 'blur(10px)' },
        { 
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 1.2, ease: 'power4.out', stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      )

      // Animate seal spin
      gsap.to('.g-seal', {
        rotate: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto mb-24 px-4 md:px-0 relative">
      
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Main Protocol Card */}
      <div className="relative border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden p-12 md:p-24 group">
        
        {/* Animated Scanning Line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent absolute top-0 left-0 animate-scan" style={{ animationDuration: '8s' }} />
        </div>

        {/* Top-right Accent Icon */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000">
           <svg width="300" height="300" viewBox="0 0 200 200" className="fill-accent">
              <path d="M100 0L125 50L175 75L125 100L100 150L75 100L25 75L75 50L100 0Z" />
           </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-14">
            <div className="space-y-6">
              <div className="flex items-center gap-3 g-reveal">
                 <div className="h-[1px] w-12 bg-accent/40" />
                 <span className="font-montserrat text-[14px] text-accent tracking-[0.8em] uppercase font-bold">
                   Verified / Security Protocol
                 </span>
              </div>
              <h2 className="g-reveal font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                The 30-Day <br /> <span className="text-accent underline-lime decoration-accent/40">Integrity</span> Protocol.
              </h2>
            </div>
            
            <p className="g-reveal font-montserrat text-xs md:text-base text-description leading-[2.2] tracking-wide uppercase max-w-2xl">
              As with any High-Yield investment, risk is a variable. However, if you <span className="text-normal font-bold">Execute</span> the blueprint and possess an operative product—we eliminate the friction. We guarantee <span className="text-accent underline-lime">Stability & Predictability</span> within 30 days.
            </p>

            <div className="g-reveal pt-12 border-t border-white/10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <p className="font-montserrat text-[9px] text-accent font-black tracking-[0.5em] uppercase">System Refund Path</p>
                     <p className="font-montserrat text-[9px] text-description/80 leading-relaxed uppercase tracking-widest">
                        Initiate support via <span className="text-normal underline decoration-accent/20">happylifereport@gmail.com</span> for any inquiries.
                     </p>
                  </div>
                  <div className="space-y-4">
                     <p className="font-montserrat text-[9px] text-accent font-black tracking-[0.5em] uppercase">Response Speed</p>
                     <p className="font-montserrat text-[9px] text-description/80 leading-relaxed uppercase tracking-widest">
                        Total protocol reversion within <span className="text-normal">48 Hours</span> of verified log ingestion.
                     </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:flex items-center justify-center h-full">
             <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center">
             <div className="relative group/seal">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-accent/20 blur-3xl opacity-40 group-hover/seal:opacity-60 transition-opacity duration-700" />
                
                <div className="g-seal w-56 h-56 md:w-80 md:h-80 border-2 border-accent/20 rounded-full flex items-center justify-center relative overflow-hidden bg-dark/40 backdrop-blur-md">
                   <div className="absolute inset-3 border border-accent/10 rounded-full border-dashed animate-spin-slow" />
                   <div className="absolute inset-8 border border-white/5 rounded-full" />
                   
                   <div className="text-center space-y-2 relative z-10">
                      <span className="font-montserrat text-7xl md:text-8xl text-accent drop-shadow-[0_0_20px_rgba(139, 92, 246,0.3)]">100</span>
                      <p className="font-montserrat text-[14px] tracking-[0.8em] text-description uppercase font-black">Guarantee</p>
                   </div>
                </div>
             </div>
             
             <div className="mt-12 text-center space-y-3">
                <div className="flex gap-4 justify-center">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-accent/40 rounded-full" />)}
                </div>
                <p className="font-montserrat text-[8px] tracking-[1em] uppercase text-description/80">Vanguard protocol A-01</p>
             </div>
          </div>

        </div>
      </div>

    </section>
  )
}
export default GuaranteeSection
