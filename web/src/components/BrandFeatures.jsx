import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const BrandFeatures = () => {
  const containerRef = useRef(null)
  const { t } = useLanguage()

  const features = [
    {
      tag: "Focus 01",
      title: t('focus01Title'),
      desc: t('focus01Desc'),
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-8">
          {/* Node Graph Visual */}
          <div className="relative w-full aspect-square border border-accent/10 rounded-full flex items-center justify-center animate-spin-slow">
             <div className="absolute inset-0 border-t border-accent/40 rounded-full blur-[2px]" />
             <div className="w-24 h-24 border border-accent/30 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full animate-pulse" />
             </div>
             {[0, 60, 120, 180, 240, 300].map((deg) => (
               <div key={deg} className="absolute w-2 h-2 bg-accent shadow-[0_0_10px_#8B5CF6]" style={{ transform: `rotate(${deg}deg) translate(80px)` }} />
             ))}
          </div>
          <div className="absolute inset-x-8 bottom-12 flex justify-between px-4">
             <div className="space-y-1">
                <div className="h-[2px] w-12 bg-accent/40" />
                <p className="font-montserrat text-[7px] text-accent/60 uppercase tracking-widest">Growth / 98%</p>
             </div>
             <div className="space-y-1 text-right">
                <div className="h-[2px] w-12 bg-accent/40 ml-auto" />
                <p className="font-montserrat text-[7px] text-accent/60 uppercase tracking-widest">Logic / V2.0</p>
             </div>
          </div>
        </div>
      )
    },
    {
      tag: "Focus 02",
      title: t('focus02Title'),
      desc: t('focus02Desc'),
      visual: (
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 p-8">
          {/* Frequency Wave Visual */}
          <div className="flex items-end gap-1 h-32">
             {[40, 70, 45, 90, 60, 100, 50, 80, 40, 60, 90, 30].map((h, i) => (
               <div 
                 key={i} 
                 className="w-1.5 bg-accent/40 relative overflow-hidden" 
                 style={{ height: `${h}%` }}
               >
                  <div className="absolute inset-0 bg-accent animate-[bounce_2s_infinite_ease-in-out]" style={{ animationDelay: `${i * 100}ms` }} />
               </div>
             ))}
          </div>
          <div className="bg-dark/80 backdrop-blur-md border border-white/10 px-6 py-4 flex flex-col items-center gap-2">
             <span className="font-montserrat text-[8px] text-accent tracking-[0.4em] uppercase">Quality Check</span>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-montserrat text-[9px] text-normal tracking-widest font-black">STABLE / AUTHENTIC</span>
             </div>
          </div>
        </div>
      )
    },
    {
      tag: "Focus 03",
      title: t('focus03Title'),
      desc: t('focus03Desc'),
      visual: (
        <div className="relative w-full h-full p-8 flex flex-col justify-end gap-6">
          {/* Mini Dashboard HUD */}
          <div className="grid grid-cols-2 gap-4">
             <div className="border border-white/10 p-4 bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-center">
                   <span className="font-montserrat text-[8px] text-description uppercase">Margin</span>
                   <span className="font-montserrat text-[8px] text-accent">82%</span>
                </div>
                <div className="h-1 bg-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-accent w-[82%]" />
                </div>
             </div>
             <div className="border border-white/10 p-4 bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-center">
                   <span className="font-montserrat text-[8px] text-description uppercase">ROAS</span>
                   <span className="font-montserrat text-[8px] text-accent">12.1X</span>
                </div>
                <div className="h-1 bg-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-accent w-[90%]" />
                </div>
             </div>
          </div>
          <div className="border border-accent/20 bg-accent/[0.03] p-6 flex items-center justify-between">
             <div className="space-y-1">
                <p className="font-montserrat text-xl text-normal leading-none">$2.4k</p>
                <p className="font-montserrat text-[7px] text-description tracking-widest uppercase">Target / Daily</p>
             </div>
             <div className="w-12 h-12 border border-accent/40 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
             </div>
          </div>
        </div>
      )
    },
    {
      tag: "Focus 04",
      title: t('focus04Title'),
      desc: t('focus04Desc'),
      visual: (
        <div className="relative w-full h-full flex items-center justify-center p-12">
          {/* Pyramidal Layer Visual */}
          <div className="relative w-full aspect-square flex flex-col items-center justify-center gap-2">
             <div className="w-[40%] aspect-[3/1] bg-accent/40 border border-accent/60 flex items-center justify-center">
                <span className="font-montserrat text-[7px] text-dark font-black tracking-widest">PREMIUM</span>
             </div>
             <div className="w-[70%] aspect-[4/1] bg-white/[0.05] border border-white/10 flex items-center justify-center">
                <span className="font-montserrat text-[7px] text-description tracking-widest">MID-TIER</span>
             </div>
             <div className="w-[100%] aspect-[5/1] bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <span className="font-montserrat text-[7px] text-description/80 tracking-widest uppercase">Foundation / Entry</span>
             </div>
             {/* Connecting Line */}
             <div className="absolute left-1/2 -ml-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent to-transparent z-[-1] opacity-20" />
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states - subtle micro-motion (90% lighter: y: 4px)
      gsap.set(['.features-header', '.feature-card-main'], { autoAlpha: 0, y: 4 })

      // 1. Heading reveal (Snappy 0.3s duration)
      gsap.to('.features-header', { 
        y: 0, autoAlpha: 1, duration: 0.3, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-header',
          start: 'top 96%'
        }
      })

      // 2. Cards reveal (Snappy 0.25s duration, 0.02s stagger)
      gsap.utils.toArray('.feature-card-main').forEach((card, i) => {
        gsap.to(card, {
          y: 0, autoAlpha: 1, duration: 0.25, ease: 'power3.out', delay: i * 0.02,
          scrollTrigger: {
            trigger: card,
            start: 'top 98%'
          }
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative py-12 pb-16 px-4 bg-dark overflow-hidden z-20">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header Segment */}
        <div className="features-header text-center space-y-8 mx-auto">
           <div className="space-y-4">
              <span className="font-montserrat text-[9px] text-amber-700 tracking-[0.8em] font-black uppercase">{t('howWeHelp')}</span>
              <h2 className="font-montserrat text-normal mb-8 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                 {t('designedToGrow')}
              </h2>
           </div>
        </div>

        {/* 2x2 Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {features.map((feature, i) => (
              <div 
                key={i} 
                className="feature-card-main group relative bg-white border border-slate-200 p-10 md:p-12 overflow-hidden flex flex-col md:flex-row gap-10 min-h-[500px] transition-all duration-500 hover:border-amber-400 hover:shadow-xl rounded-2xl"
              >
                 {/* Visual Area */}
                 <div className="md:order-2 flex-1 relative bg-slate-50 border border-slate-200 overflow-hidden group-hover:border-amber-300 transition-colors shadow-inner rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {feature.visual}
                 </div>

                 {/* Textual Area */}
                 <div className="md:order-1 md:w-1/2 flex flex-col justify-between py-4 pb-12 z-10 relative">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <span className="font-montserrat text-[9px] text-amber-700 tracking-[0.5em] font-black uppercase">{feature.tag}</span>
                          <h3 className="font-montserrat text-3xl sm:text-4xl md:text-[40px] text-slate-900 font-bold leading-[1.15] tracking-tight group-hover:text-amber-600 transition-colors duration-500">
                             {feature.title}
                          </h3>
                       </div>
                       <p className="font-montserrat text-[10px] md:text-[11px] text-slate-600 tracking-widest leading-[2] uppercase">
                          {feature.desc}
                       </p>
                    </div>

                    <div className="pt-8">
                       <div className="h-[1px] w-12 bg-amber-400/40 group-hover:w-full transition-all duration-700" />
                       <div className="flex justify-between items-center pt-4 opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className="font-montserrat text-[8px] text-slate-700 uppercase tracking-widest font-bold">Ready / Start Now</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-800"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                       </div>
                    </div>
                 </div>

                 {/* HUD corner markers */}
                 <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-slate-300 group-hover:border-amber-400 transition-colors" />
                 <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-slate-300 group-hover:border-amber-400 transition-colors" />
              </div>
           ))}
        </div>

      </div>
    </section>
  )
}

export default BrandFeatures
