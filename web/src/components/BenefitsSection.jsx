import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import sanitizeDisplay from '../utils/textSanitize'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const 
BenefitsSection = ({ course, section }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 90% lighter and faster grid animation (y: 4px, scale: 0.99, duration: 0.25s, stagger: 0.02s)
      gsap.fromTo('.benefit-card',
        { opacity: 0, y: 4, scale: 0.99 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out', stagger: 0.02,
          scrollTrigger: {
            trigger: '.benefit-grid',
            start: 'top 96%',
          }
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto py-20 px-4 md:px-0">
      <div className="grid grid-cols-1 min-[1301px]:grid-cols-[1fr_1.8fr] gap-12 min-[1301px]:gap-20 items-start mb-24">
        <div className="space-y-8 min-[1301px]:sticky min-[1301px]:top-32 transition-all duration-500">
          <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            {sanitizeDisplay(section?.title || "What You Will Achieve").split(' ').map((word, i, arr) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? (
                  <span className="text-[#2171B5]">{word}</span>
                ) : (
                  word + ' '
                )}
              </React.Fragment>
            ))}
          </h2>
          <div className="h-[2px] bg-[#2171B5]/40 w-24" />
        </div>

        {section?.content && (
          <div className="min-[1301px]:border-l border-slate-200 pl-0 min-[1301px]:pl-12 space-y-8 py-2">
            {section.content.blocks?.map((block, i) => (
              <p key={i} className={`font-montserrat leading-[1.8] tracking-wide ${i === 0 ? 'text-lg md:text-xl text-slate-800 font-medium' : 'text-sm md:text-base text-slate-600 font-normal'}`}>
                {sanitizeDisplay(block.data?.text || '').replace(/&nbsp;/g, ' ')}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="benefit-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {section?.points?.map((feat, i) => (
          <div key={i} className="benefit-card border border-slate-200/80 bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-[#2171B5]/50 relative group transition-all duration-300 h-full flex flex-col justify-start min-h-[140px]">
            <div className="absolute top-3 right-4 select-none pointer-events-none">
              <span className="font-montserrat text-3xl md:text-4xl font-black text-[#2171B5]/20 group-hover:text-[#2171B5]/40 transition-colors">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="flex items-start gap-4 pr-8 relative z-10">
              <div className="w-2.5 h-2.5 bg-[#2171B5] rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(33,113,181,0.35)]" />
              <span className="font-montserrat text-sm md:text-[15px] text-slate-800 font-semibold tracking-wide leading-relaxed">
                {feat}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BenefitsSection
