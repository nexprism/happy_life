import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import comparisonImg from '../assets/images/comparision_img.webp'
import sanitizeDisplay from '../utils/textSanitize'
import LogoMarquee from './LogoMarquee'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const comparison = [
  {
    traditional: "Beginner focus, theory-heavy content",
    our: "100% practical, Real-world campaigns."
  },
  {
    traditional: "Taught by someone who has never run an agency",
    our: "Taught by a 14+ year agency owner with real experience."
  },
  {
    traditional: "Prepares you for jobs and makes you dependent",
    our: "Focus on entrepreneurship and business building."
  },
  {
    traditional: "They focus on specific topic like SEO, FB Ads, Google Ads.",
    our: "Complete agency setup guide covering all aspects with skills."
  },
  {
    traditional: "2 hours 3 day week class",
    our: "Self-paced learning"
  },
  {
    traditional: "No mentorship provided",
    our: "Mentorship Provided"
  }
]

const features = [
  "Train your custom GPT's",
  "Learn client On-boarding and handover.",
  "Learn Project Management and delegation",
  "Hands-on Sales Training",
  "Understand employee profitability and KRA's.",
  "One on One Mentorship"
]

const ComparisonSection = ({ course, section }) => {
  const containerRef = useRef(null)

  // Use section data if provided, otherwise fallback to course data
  const targetSection = section || course?.comparisonSection;
  // Local sanitizer to correct display labels
  const sanitize = (t) => sanitizeDisplay(t);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 0. Solopreneur intro reveal - Snappy & micro-motion (90% lighter)
      gsap.fromTo('.solo-heading',
        { opacity: 0, y: 4 },
        {
          opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', stagger: 0.02,
          scrollTrigger: { trigger: '.solo-heading', start: 'top 96%' }
        }
      )
      gsap.fromTo('.solo-image-wrap',
        { opacity: 0, scale: 0.99, y: 4 },
        {
          opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.solo-image-wrap', start: 'top 98%' }
        }
      )

      // 1. Comparison Rows reveal (90% lighter: x: 5px, duration 0.25s)
      gsap.utils.toArray('.comparison-row').forEach((row, i) => {
        gsap.fromTo(row,
          { opacity: 0, x: i % 2 === 0 ? -5 : 5 },
          {
            opacity: 1, x: 0, duration: 0.25, ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 96%',
            }
          }
        )
      })

      // 2. Feature Cards reveal (90% lighter: y: 4px, duration 0.25s, stagger 0.02s)
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 4, scale: 0.99 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out', stagger: 0.02,
          scrollTrigger: {
            trigger: '.feature-grid',
            start: 'top 96%',
          }
        }
      )

      // 3. CTA reveal (90% lighter: y: 4px, duration 0.3s)
      gsap.fromTo('.cta-reveal',
        { opacity: 0, y: 4 },
        {
          opacity: 1, y: 0, duration: 0.3, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.cta-reveal',
            start: 'top 98%',
          }
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Use API comparison points or fallback to default
  const apiComparison = (targetSection?.leftPoints?.map((trad, i) => ({
    traditional: trad,
    our: targetSection.rightPoints[i] || ""
  })) || [
      { traditional: "Beginner focus, theory-heavy content", our: "100% practical, Real-world campaigns." },
      { traditional: "Taught by someone who has never run an agency", our: "Taught by a 14+ year agency owner with real experience." },
      { traditional: "Prepares you for jobs and makes you dependent", our: "Focus on entrepreneurship and business building." },
      { traditional: "They focus on specific topic like SEO, FB Ads, Google Ads.", our: "Complete agency setup guide covering all aspects with skills." },
      { traditional: "2 hours 3 day week class", our: "Self-paced learning" },
      { traditional: "No mentorship provided", our: "Mentorship Provided" }
    ]).slice(0, 5);

  const manifestoPointers = targetSection?.content?.blocks?.map(block => 
    sanitizeDisplay(block.data?.text || '').replace(/&nbsp;/g, ' ')
  ).filter(t => t && t.trim() !== '') || [];

  const apiFeatures = (manifestoPointers.length > 0 ? manifestoPointers : (course?.benefitsSection?.points || [
    "Train your custom GPT's",
    "Learn client On-boarding and handover.",
    "Learn Project Management and delegation",
    "Hands-on Sales Training",
    "Understand employee profitability and KRA's.",
    "One on One Mentorship"
  ])).slice(0, 6);



  return (
    <section ref={containerRef} className="max-w-7xl mx-auto mb-24 px-4 md:px-0">

      {/* SOLOPRENEUR INTRO */}
      <div className="mb-24 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="solo-heading font-montserrat mb-2 text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            What is a <span className="text-[#2171B5] underline-lime">{sanitize(course?.title) || 'Solopreneur'}?</span>
          </h2>
          <p className="solo-heading font-montserrat pb-4 text-[#2171B5] text-[14px] md:text-xs font-semibold max-w-md mx-auto leading-[2.2] tracking-widest uppercase">
            {sanitizeDisplay(targetSection?.subtitle || course.subtitle || '')}
          </p>

          {targetSection?.description?.blocks ? (
            <div className="solo-heading font-montserrat text-xs md:text-sm text-slate-600 max-w-4xl mx-auto leading-[2] tracking-wide space-y-4">
              {targetSection.description.blocks.map((block, bi) => (
                <p key={bi}>{sanitizeDisplay(block.data?.text || '').replace(/&nbsp;/g, ' ')}</p>
              ))}
            </div>
          ) : (
            <div className="solo-heading font-montserrat text-xs md:text-sm text-slate-600 max-w-4xl mx-auto leading-[2] tracking-wide">
              {sanitizeDisplay(course.comparisonText || "Use AI, Freelancers and tools to automate high margin agency business without pressure of hiring. This offers flexible hours and allows you to work from anywhere.")}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="solo-image-wrap relative group overflow-hidden max-w-2xl mx-auto shadow-xl rounded-2xl border border-slate-200">
          {/* Decorative corner markers */}
          <div className="absolute top-4 left-4 z-20 w-8 h-8 border-t-2 border-l-2 border-[#2171B5]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute top-4 right-4 z-20 w-8 h-8 border-t-2 border-r-2 border-[#2171B5]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute bottom-4 left-4 z-20 w-8 h-8 border-b-2 border-l-2 border-[#2171B5]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute bottom-4 right-4 z-20 w-8 h-8 border-b-2 border-r-2 border-[#2171B5]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* LIVE badge */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 border border-white/10 rounded-lg">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="font-montserrat text-[9px] text-white tracking-[0.4em] uppercase font-bold">LIVE</span>
          </div>

          <img
            src={(() => {
                const img = course.coverImage;
                if (!img) return comparisonImg;
                if (img.startsWith('http')) return img;
                const rawBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
            })()} 
            alt={sanitize(course.title)}
            className="w-full object-cover transition-all duration-700 group-hover:scale-[1.01]"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-8 mb-16 opacity-80">
        <div className="flex-1 h-[1px] bg-slate-200" />
        <span className="font-montserrat text-[9px] text-slate-400 tracking-[0.4em] uppercase font-bold shrink-0">Program Comparison / Matrix</span>
        <div className="flex-1 h-[1px] bg-slate-200" />
      </div>

      {/* COMPARISON HEADER */}
      <div className="grid grid-cols-2 gap-8 lg:gap-16 md:mb-12 text-center border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <span className="font-montserrat text-[10px] text-slate-400 tracking-[0.3em] uppercase font-bold">Status / Outdated</span>
          <h3 className="font-montserrat text-2xl md:text-3xl lg:text-5xl text-slate-700 font-bold tracking-tight">
            {sanitizeDisplay(course.comparisonSection?.leftTitle || "Traditional Program")}
          </h3>
        </div>
        <div className="space-y-1">
          <span className="font-montserrat text-[10px] text-[#2171B5] tracking-[0.3em] uppercase font-bold">Status / Optimal</span>
          <h3 className="font-montserrat text-2xl md:text-3xl lg:text-5xl text-[#2171B5] font-bold tracking-tight">
            {sanitizeDisplay(course.comparisonSection?.rightTitle || "Our Program")}
          </h3>
        </div>
      </div>

      {/* COMPARISON ROWS */}
      <div className="space-y-4 md:space-y-3 mb-16">
        {apiComparison.map((item, i) => (
          <div key={i} className="comparison-row grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 py-1 items-center group">
            {/* Traditional Column */}
            <div className="flex items-center gap-4 px-4 md:px-5 lg:px-8 py-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-xs transition-all duration-300">
              <div className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center shrink-0 bg-red-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
              <p className="font-montserrat text-xs md:text-xs lg:text-sm text-red-700 font-semibold tracking-wide uppercase">{sanitizeDisplay(item.traditional)}</p>
            </div>

            {/* Our Program Column */}
            <div className="flex items-center gap-4 px-4 md:px-6 lg:px-8 py-4 bg-blue-50/80 border-l-4 border-[#2171B5] rounded-xl shadow-xs transition-all duration-300">
              <div className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center shrink-0 bg-blue-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2171B5" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <p className="font-montserrat text-xs md:text-xs lg:text-sm text-[#2171B5] font-semibold tracking-wide uppercase">{sanitizeDisplay(item.our)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* LOGO MARQUEE */}
      <div className="mb-20">
        <LogoMarquee />
      </div>

      {/* FEATURE GRID (Numbered cards 01-06) */}
      <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {apiFeatures.map((feat, i) => (
          <div 
            key={i} 
            className="feature-card border border-slate-200/80 bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-[#2171B5]/50 relative group transition-all duration-300 h-full flex flex-col justify-start min-h-[140px]"
          >
            <div className="absolute top-3 right-4 select-none pointer-events-none">
              <span className="font-montserrat text-3xl md:text-4xl font-black text-[#2171B5]/20 group-hover:text-[#2171B5]/40 transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
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

      {/* BOTTOM CTA */}
      <div className="cta-reveal text-center space-y-8">
        <h4 className="font-montserrat text-2xl md:text-4xl text-slate-800 font-semibold tracking-tight">
          {"Beat the competition with innovative solutions."}
        </h4>

        <div className="flex items-center justify-center gap-6 md:gap-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2171B5" strokeWidth="2" className="opacity-60 hidden md:block"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
          <button 
            onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-[#2171B5] hover:bg-[#1a5c96] px-10 md:px-16 py-5 md:py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="relative z-10 font-montserrat text-white text-xs md:text-sm font-black tracking-[0.3em] uppercase">YES, I WANT TO BE CEO OF MY LIFE</span>
          </button>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2171B5" strokeWidth="2" className="opacity-60 hidden md:block rotate-180"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
        </div>
      </div>

    </section>
  )
}

export default ComparisonSection
