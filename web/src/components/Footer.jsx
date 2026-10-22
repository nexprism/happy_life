import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const Footer = () => {
  const footerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-reveal', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
        },
        y: 25,
        opacity: 0,
        filter: 'blur(8px)',
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out'
      })
    }, footerRef)

    requestAnimationFrame(() => {
      try { ScrollTrigger.refresh() } catch (e) { }
    })

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#2171B5] text-white pt-16 pb-8 px-4 md:px-12 lg:px-20 overflow-hidden flex flex-col justify-between min-h-[420px] select-none"
    >
      {/* Center Main Content Block */}
      <div className="flex-1 flex flex-col items-center justify-center text-white border-t border-white/10 pt-8 relative z-10">
        
        {/* Mascot / Brand Logo Icon */}
        <div className="footer-reveal mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              alt="Happy Life Astro"
              className="h-14 md:h-16 w-auto object-contain brightness-0 invert drop-shadow-md"
              src="/logos/osa_logo.png"
            />
          </Link>
        </div>

        {/* Statement / Slogan Typography */}
        <div className="footer-reveal text-center space-y-1 md:space-y-1.5 mb-10 md:mb-12">
          <h2 className="font-montserrat text-white text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            Your Birth Chart Holds Clues,
          </h2>
          <h2 className="font-montserrat text-white text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            Not Instant <span className="font-extrabold uppercase tracking-tighter text-white">MIRACLES</span>
          </h2>
        </div>

        {/* Social Links Row */}
        <div className="footer-reveal flex items-center justify-center gap-6 md:gap-8">
          {/* Facebook */}
          <a href="https://www.facebook.com/share/19fDGmAQnj/" target="_blank" rel="noopener noreferrer" className="group relative p-2" aria-label="Facebook">
            <div className="absolute -inset-2 bg-white/15 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 group-hover:scale-110">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          {/* X (Twitter) */}
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="group relative p-2" aria-label="X">
            <div className="absolute -inset-2 bg-white/15 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 group-hover:scale-110">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154H7.594l5.243 6.932 6.064-6.933zm-1.292 19.49h2.039L6.486 3.24H4.298L17.61 20.644z" />
            </svg>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/happy_life_astro?utm_source=qr&stkn=MTA5NHpxc2tpeXE4Yg%3D%3D" target="_blank" rel="noopener noreferrer" className="group relative p-2" aria-label="Instagram">
            <div className="absolute -inset-2 bg-white/15 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 group-hover:scale-110">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* YouTube */}
          <a href="https://youtube.com/@happylifeastro?si=6jttLMEZmVEyoDbS" target="_blank" rel="noopener noreferrer" className="group relative p-2" aria-label="YouTube">
            <div className="absolute -inset-2 bg-white/15 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white transition-all duration-300 group-hover:scale-110">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M10 15V9l6 3z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom Navigation & Tagline Bar */}
      <div className="footer-reveal flex flex-col items-center gap-4 mt-12 relative z-10">
        <div className="flex items-center gap-2 font-montserrat text-xs text-white/90">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <a href="mailto:happylifereport@gmail.com" className="hover:underline transition-all font-semibold">
            happylifereport@gmail.com
          </a>
        </div>

        <div className="opacity-50 text-white text-center">
          <p className="font-montserrat text-[8px] md:text-[9px] uppercase tracking-[0.4em]">Align Your Energy, Unlock Success, and Live with Purpose</p>
        </div>
      </div>

      {/* Decorative Ambient Background Soft Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white blur-[130px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black blur-[130px] rounded-full" />
      </div>
    </footer>
  )
}

export default Footer
