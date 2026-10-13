import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'

const ForumFilterModal = ({ stats, tags, discourseTags, onStartTopic }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline()
      
      // 1. Backdrop Fade
      tl.to(backdropRef.current, { 
        display: 'block',
        autoAlpha: 1,
        pointerEvents: 'auto',
        duration: 0.4
      })

      // 2. Morph: Circle -> Square -> Box
      tl.fromTo(modalRef.current, 
        { 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          x: 0, 
          y: 0,
          scale: 1,
          left: '32px',
          bottom: '100px',
          position: 'fixed'
        },
        { 
          width: '90vw', 
          height: '80vh', 
          borderRadius: '24px', 
          left: '50%', 
          bottom: '50%', 
          xPercent: -50, 
          yPercent: 50,
          duration: 0.8,
          ease: 'expo.inOut'
        }, "-=0.2"
      )

      // 3. Content Reveal
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out'
      })
    }
  }, [isOpen])

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: () => setIsOpen(false) })
    
    tl.to(contentRef.current, { opacity: 0, y: 10, duration: 0.3 })
    tl.to(modalRef.current, {
        width: '56px', 
        height: '56px', 
        borderRadius: '50%', 
        left: '32px', 
        bottom: '100px',
        xPercent: 0, 
        yPercent: 0,
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'expo.inOut'
    })
    tl.to(backdropRef.current, { autoAlpha: 0, pointerEvents: 'none', duration: 0.3 }, "-=0.3")
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          ref={buttonRef}
          onClick={() => setIsOpen(true)}
          className="fixed left-8 bottom-10 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-slate-950 shadow-accent-soft hover:scale-110 active:scale-95 transition-all z-[900] group md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-90 transition-transform duration-500">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
          </svg>
          <div className="absolute -right-16 bg-accent text-slate-950 px-3 py-1 rounded font-montserrat text-[8px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             FILTERS
          </div>
        </button>
      )}

      {/* Morphing Modal container */}
      <div 
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2500] hidden opacity-0 pointer-events-none"
      />

      <div 
        ref={modalRef}
        className={`fixed z-[2501] bg-white border border-slate-200 overflow-hidden shadow-2xl ${!isOpen ? 'hidden' : 'block'}`}
        style={{ left: '32px', bottom: '100px' }}
      >
        <div ref={contentRef} className="opacity-0 translate-y-4 h-full flex flex-col p-8 md:p-14 overflow-y-auto no-scrollbar">
           
           {/* Modal Header */}
           <div className="flex items-center justify-between mb-12 shrink-0">
              <div className="flex flex-col gap-1">
                 <span className="font-montserrat text-[9px] text-amber-700 tracking-[0.6em] font-black uppercase">Protocol Alpha</span>
                 <h2 className="font-montserrat text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Forum Calibration</h2>
              </div>
              <button 
                onClick={handleClose}
                className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all duration-500 md:w-12 md:h-12"
              >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
           </div>

           {/* Modal Grid: Stats & Tags */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-16 flex-grow">
              
              {/* Left Wing: Stats Protocol */}
              <div className="md:col-span-4 flex flex-col gap-10">
                 <div className="space-y-6">
                    <h4 className="font-montserrat text-[14px] font-black text-amber-700 tracking-[0.3em] uppercase underline underline-offset-8 decoration-amber-400/40">Forum Stats</h4>
                    <div className="flex flex-col border-t border-slate-100 divide-y divide-slate-100">
                        {stats.map((stat) => (
                           <div key={stat.label} className="flex items-center justify-between py-6">
                              <span className="font-montserrat text-[14px] text-slate-600 uppercase tracking-widest">{stat.label}</span>
                              <span className="font-montserrat text-2xl text-slate-900">{stat.value}</span>
                           </div>
                        ))}
                    </div>
                 </div>

                 <div className="p-8 bg-amber-50 border border-amber-300 rounded-2xl space-y-6 group cursor-pointer hover:bg-amber-100/60 transition-all" onClick={() => { onStartTopic(); handleClose(); }}>
                    <div className="flex items-center justify-between">
                       <h5 className="font-montserrat text-[9px] font-black text-amber-800 tracking-[0.4em] uppercase">Discourse Protocol</h5>
                       <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-slate-950 group-hover:rotate-90 transition-transform duration-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                       </div>
                    </div>
                    <p className="font-montserrat text-[14px] text-amber-900 leading-relaxed uppercase tracking-widest font-black group-hover:text-slate-950 transition-colors">
                       Initialize new intelligence module (Start Topic)
                    </p>
                 </div>
              </div>

              {/* Right Wing: Tags Registry */}
              <div className="md:col-span-8 space-y-12">
                 <div className="space-y-8">
                    <h4 className="font-montserrat text-[14px] font-black text-amber-700 tracking-[0.3em] uppercase underline underline-offset-8 decoration-amber-400/40">Popular Categories</h4>
                    <div className="flex flex-wrap gap-4 pt-4">
                       {tags.map((tag) => (
                          <button key={tag} className="px-8 py-5 border border-slate-200 rounded-xl font-montserrat text-[11px] font-bold text-slate-700 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50 transition-all uppercase tracking-[0.3em]">
                             {tag}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-8 pt-10 border-t border-slate-100">
                    <h4 className="font-montserrat text-[14px] font-black text-slate-900 tracking-[0.3em] uppercase opacity-40">Discourse Tags</h4>
                    <div className="flex flex-wrap gap-3">
                       {discourseTags.map((tag) => (
                          <button key={tag} className="px-5 py-3 border border-slate-200 rounded-lg font-montserrat text-[9px] text-slate-600 hover:text-slate-900 transition-all uppercase tracking-widest">
                             {tag}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

           </div>

           {/* Modal Footer Baseline */}
           <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="font-montserrat text-[8px] text-slate-400 tracking-[0.8em] uppercase">Calibration protocol v2.10.4</span>
              <div className="flex gap-6">
                 <button onClick={handleClose} className="font-montserrat text-[14px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-[0.3em] transition-colors">Abort</button>
                 <button onClick={handleClose} className="font-montserrat text-[14px] font-black px-6 py-2.5 bg-accent text-slate-950 rounded-full shadow-accent-soft uppercase tracking-[0.3em]">Apply Filters</button>
              </div>
           </div>
        </div>
      </div>
    </>
  )
}

export default ForumFilterModal;
