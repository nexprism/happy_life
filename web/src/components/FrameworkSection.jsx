import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import sanitizeDisplay from '../utils/textSanitize'

gsap.registerPlugin(ScrollTrigger)

const FrameworkSection = ({ course, section }) => {
  const containerRef = useRef(null)
  const introRef = useRef(null)

  // Extract data from EditorJS blocks
  const processContent = (content) => {
    if (!content || !content.blocks) return { intro: [], phases: [] }
    
    const intro = []
    const phases = []
    let currentPhase = null
    let foundFirstHeader = false

    content.blocks.forEach(block => {
      if (block.type === 'header') {
        foundFirstHeader = true
        if (currentPhase) phases.push(currentPhase)
        currentPhase = { title: block.data.text, description: '' }
      } else if (block.type === 'paragraph') {
        if (!foundFirstHeader) {
          intro.push(block.data.text)
        } else if (currentPhase) {
          currentPhase.description += block.data.text + ' '
        }
      }
    })
    if (currentPhase) phases.push(currentPhase)
    return { intro, phases }
  }

  const { intro, phases } = processContent(section?.description || section?.content)

  const stripHtml = (html) => {
    if (!html) return ''
    return String(html).replace(/<[^>]*>/g, '').replace(/&nbsp;|\u00A0/g, ' ')
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Intro Animation (60% lighter and faster: y: 8px, duration 0.45s, stagger 0.03s)
      gsap.fromTo('.framework-intro-item', 
        { opacity: 0, y: 8 },
        { 
          opacity: 1, y: 0, 
          duration: 0.45, stagger: 0.03, ease: 'power3.out',
          scrollTrigger: {
            trigger: introRef.current,
            start: 'top 95%'
          }
        }
      )

      // 2. Phases Animation (60% lighter and faster: y: 12px, duration 0.45s)
      gsap.utils.toArray('.phase-node').forEach((node, i) => {
        gsap.fromTo(node,
          { opacity: 0, y: 12 },
          {
            opacity: 1, y: 0,
            duration: 0.45, ease: 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 95%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

      // 3. Connective Line Animation (Clean height scale)
      gsap.fromTo('.roadmap-line-inner', 
        { height: '0%' },
        { 
          height: '100%', 
          ease: 'none',
          scrollTrigger: {
            trigger: '.phases-container',
            start: 'top 70%',
            end: 'bottom 90%',
            scrub: true
          }
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [phases])

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto py-20">
      
      {/* HEADER SECTION */}
      <div ref={introRef} className="max-w-4xl mx-auto mb-20 relative px-4 md:px-0">
        <div className="relative p-3 md:p-10 lg:p-16 border border-white/10 bg-[#0C0C0C] backdrop-blur-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          
          <div className="space-y-12 relative z-10">
            <div className="space-y-4">
              <h2 className="framework-intro-item font-montserrat text-white text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                {sanitizeDisplay(section?.title || 'The Framework')}
              </h2>
                <span className="framework-intro-item block font-montserrat text-accent text-[10px] tracking-[0.1em] uppercase font-black opacity-60">
                {sanitizeDisplay(section?.subtitle || "THE ARCHITECT'S ROADMAP")}
              </span>
            </div>

            <div className="space-y-8">
              {intro.map((text, i) => (
                <p key={i} className={`framework-intro-item font-montserrat text-white/70 leading-[1.8] tracking-wide font-normal ${i === 0 ? 'text-lg md:text-xl text-white/90 border-l-2 border-accent/30 pl-6 md:pl-8 py-2' : 'text-sm md:text-base'}`}>
                  {sanitizeDisplay(stripHtml(text))}
                </p>
              ))}
            </div>
          </div>

          {/* Decorative Background Element */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>

      {/* PHASES ROADMAP */}
      <div className="phases-container relative max-w-4xl mx-auto pt-4 space-y-24 md:space-y-40 pl-6 md:pl-0">
        
        {/* Central Road Line */}
        <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/10">
           <div className="roadmap-line-inner w-full bg-accent shadow-[0_0_15px_#8B5CF6] origin-top" />
        </div>

        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              className={`phase-node relative flex flex-col md:flex-row items-center gap-4 md:gap-0 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              
              {/* Content Card */}
              <div className="w-full md:w-[46%] group">
                <div className="relative p-5 md:p-7 lg:p-10 border border-accent/30 bg-[#0E0E0E] backdrop-blur-3xl rounded-none transition-all duration-500 hover:bg-[#121212] hover:border-accent/60 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139, 92, 246,0.12)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(139, 92, 246,0.2)]">
                  
                  {/* Side Accent Line */}
                  <div className={`absolute top-0 bottom-0 w-[2px] bg-accent transition-all duration-500 ${index % 2 !== 0 ? 'right-0' : 'left-0'}`} />

                  {/* Decorative Glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/15 rounded-full blur-3xl group-hover:bg-accent/25 transition-colors" />
                  
                  {/* Ghost Numbering */}
                  <div className="absolute top-4 right-8 font-montserrat text-4xl md:text-5xl lg:text-6xl font-black text-accent/[0.08] select-none scale-105 group-hover:scale-115 transition-all duration-700">
                    0{index + 1}
                  </div>

                  <div className="space-y-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-[1px] w-8 bg-accent/80" />
                      <span className="font-montserrat text-[9px] tracking-[0.5em] text-accent uppercase font-bold">MODULE_0{index + 1}</span>
                    </div>
                    
                    <h3 className="font-montserrat text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-tight tracking-tight">
                      {sanitizeDisplay(stripHtml(phase.title))}
                    </h3>
                    
                    <p className="font-montserrat text-white/90 text-[11px] md:text-[10px] leading-[1.8] tracking-widest uppercase font-medium">
                      {sanitizeDisplay(stripHtml(phase.description))}
                    </p>

                    <div className="pt-4 flex items-center gap-3 opacity-100 transition-all duration-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_12px_#8B5CF6]" />
                      <span className="font-montserrat text-[8px] tracking-[0.5em] text-white uppercase font-bold">SYSTEM PROTOCOL 0{index + 1}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Connector Dot */}
              <div className="absolute left-[24px] md:left-1/2 top-8 md:top-1/2 w-2.5 h-2.5 bg-dark border-2 border-accent rounded-full md:-translate-x-1/2 md:-translate-y-1/2 z-10 shadow-[0_0_8px_#8B5CF6]" />

              <div className="hidden md:block w-[46%]" />

            </div>
          ))}
        </div>

      </div>

    </section>
  )
}

export default FrameworkSection
