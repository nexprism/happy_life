import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../context/LanguageContext'
import appImage from '../assets/images/app_image.png'
import vibrantBg from '../assets/images/vibrant_growth_bg.png'

gsap.registerPlugin(ScrollTrigger)

const GrowthSection = () => {
  const containerRef = useRef(null)
  const { t } = useLanguage()

  useEffect(() => {
    console.debug('[GrowthSection] mounted')
    const ctx = gsap.context(() => {
      // Background slow pan/zoom
      gsap.to('.vibrant-bg', {
        scale: 1.1,
        xPercent: 2,
        yPercent: 2,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Entrance Animations - Snappy & 90% lighter (no blur, minimal offsets)
      gsap.from('.growth-header > *', {
        scrollTrigger: {
          trigger: '.growth-header',
          start: 'top 96%',
        },
        y: 4,
        opacity: 0,
        stagger: 0.02,
        duration: 0.3,
        ease: 'power3.out'
      })

      const cards = gsap.utils.toArray('.growth-card')
      cards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 98%',
          },
          y: 6,
          opacity: 0,
          duration: 0.25,
          ease: 'power3.out',
          delay: (i % 2) * 0.02
        })
      })
    }, containerRef)

    // Ensure ScrollTrigger calculates positions on initial load
    requestAnimationFrame(() => {
      try { ScrollTrigger.refresh() } catch (e) { /* ignore */ }
      try { console.debug('[GrowthSection] requested ScrollTrigger.refresh') } catch (e) { }
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="w-full bg-dark pb-32 px-4 md:px-12 lg:px-24 overflow-x-hidden">

      {/* 300px GROWTH STRIP */}
      <div className="growth-card max-w-7xl mx-auto min-h-[220px] md:h-[300px] bg-[#0d0d0d] border border-white/5 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 relative overflow-hidden group">

        {/* Vibrant Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={vibrantBg}
            alt=""
            className="vibrant-bg w-full h-full object-cover opacity-15 transition-opacity duration-1000 group-hover:opacity-30 mix-blend-screen"
          />
          {/* Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-dark/80" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-colors duration-1000" />

        {/* Content Side */}
        <div className="growth-header flex flex-col gap-4 text-center md:text-left z-10">
          <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            {t('growthHeadline')}
          </h2>
          <p className="max-w-md font-montserrat text-[10px] md:text-xs text-white/60 tracking-[0.2em] leading-relaxed uppercase">
            {t('growthSub')}
          </p>
        </div>

        {/* Action Side */}
        <div className="flex flex-col items-center md:items-end gap-6 z-10 mt-8 md:mt-0">

          <div className="flex flex-col gap-4 w-full md:w-fit">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-8 py-4 bg-white/5 text-normal border border-white/10 transition-all group/store hover:bg-white/10 hover:border-white/20 active:scale-95 w-full md:w-[240px] rounded-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2.01.77-3.27.82-1.31.05-2.36-1.31-3.2-2.52C4.12 17.02 2.8 12.19 4.54 9.13c.87-1.55 2.46-2.53 4.2-2.56 1.32-.03 2.58.89 3.39.89.8 0 2.34-1.12 3.91-.96 1.13.05 3.01.46 4.14 2.11-.09.06-2.02 1.18-2 3.51.03 2.82 2.45 3.76 2.48 3.77-.02.06-.39 1.35-1.32 2.74M15.25 2c-.03 2.01-1.67 3.63-3.61 3.58.03-2.01 1.7-3.63 3.61-3.58z" />
              </svg>
              <div className="text-left">
                <p className="text-[8px] font-montserrat uppercase opacity-100 leading-none mb-1">Download on</p>
                <p className="text-[12px] font-montserrat font-black tracking-[0.15em] uppercase">App Store</p>
              </div>
            </a>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-8 py-4 bg-accent text-dark border border-accent transition-all group/store rounded-none shadow-[0_10px_30px_rgba(139, 92, 246,0.2)] hover:scale-[1.02] active:scale-95 w-full md:w-[240px]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.1-.12V1.934a1 1 0 01.099-.12zM14.5 12.707L3.921 23.286c.056.01.114.014.173.014a1 1 0 00.707-.293L15.914 14.12 14.5 12.707zM15.914 9.88l-1.414-1.414L3.921.714a1 1 0 00-.707-.293.991.991 0 00-.173.014L14.5 11.293 15.914 9.88zm1.086 1.086l3.414 3.414a1 1 0 010 1.414l-3.414 3.414-2.121-2.121 2.121-2.121 3.414-3.414a1 1 0 010-1.414l-3.414-3.414 2.121-2.121z" />
              </svg>
              <div className="text-left">
                <p className="text-[8px] font-montserrat uppercase opacity-100 leading-none mb-1">Get it on</p>
                <p className="text-[12px] font-montserrat font-black tracking-[0.15em] uppercase">Google Play</p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}

export default GrowthSection
