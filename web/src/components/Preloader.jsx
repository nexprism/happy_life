import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const Preloader = ({ onComplete }) => {
  const [counter, setCounter] = useState(0)
  const preloaderRef = useRef(null)
  const logoRef = useRef(null)
  const signatureRef = useRef(null)
  const logoRevealRef = useRef(null)
  const sigRevealRef = useRef(null)
  const counterRef = useRef(null)
  const progressRef = useRef(null)
  const curtainRef = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete()
      }
    })

    // Initial Hide / Setup
    gsap.set('.data-string', { opacity: 0, y: 10 })
    gsap.set(logoRevealRef.current, { clipPath: 'inset(0% 100% 0% 0%)' })
    gsap.set(sigRevealRef.current, { clipPath: 'inset(-20% 100% 0% 0%)' })
    gsap.set(signatureRef.current, { opacity: 0 })

    // 1. Loading Matrix (Counter and Progress)
    const count = { value: 0 }
    tl.to(count, {
      value: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => setCounter(Math.floor(count.value)),
    }, 0)

    tl.to(progressRef.current, {
      scaleX: 1,
      duration: 2,
      ease: "power2.inOut",
    }, 0)

    // 2. Data Strings (Sequential Entrance)
    tl.to('.data-string-1', { opacity: 0.15, y: 0, duration: 0.5 }, 0.2)
    tl.to('.data-string-2', { opacity: 0.15, y: 0, duration: 0.5 }, 0.4)
    tl.to('.data-string-3', { opacity: 0.15, y: 0, duration: 0.5 }, 0.6)

    // 3. Brand Reveal (Left-to-Right Sweep)
    tl.to(logoRevealRef.current, {
      clipPath: 'inset(0% -10% 0% 0%)',
      duration: 1.8,
      ease: "expo.inOut"
    }, 1.8)

    // 4. Signature Reveal (Live Writing)
    tl.to(signatureRef.current, { opacity: 1, duration: 0.1 }, 3.0)
    tl.to(sigRevealRef.current, {
      clipPath: 'inset(-20% -10% -20% -10%)',
      duration: 2.5,
      ease: "sine.inOut"
    }, 3.0)

    // 5. STATIC DWELL (The Brand Moment)
    tl.to({}, { duration: 2.5 })

    // 6. EXIT SEQUENCE: The Morphed Curtain Reveal
    // First, fade the content
    tl.to([logoRef.current, '.data-string', counterRef.current, signatureRef.current], {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: "power4.in"
    })
    
    // Then, the Liquid Curtain Slides Up
    // Path Initial: Full Rect
    // Path Final: Morphed Curve going up
    tl.to(pathRef.current, {
        attr: { d: "M0 0 L100 0 L100 0 Q50 0 0 0 Z" },
        duration: 2,
        ease: "expo.inOut"
    }, "-=0.5")
    .to(curtainRef.current, {
        autoAlpha: 0,
        duration: 0.1
    })

    return () => tl.kill()
  }, [])

  return (
    <div 
      ref={preloaderRef}
      className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
    >
      {/* Liquid Curtain SVG Overlay */}
      <svg 
        ref={curtainRef}
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-auto"
      >
        <path 
          ref={pathRef}
          d="M0 0 L100 0 L100 100 Q50 100 0 100 Z"
          fill="#0A0A0A"
        />
      </svg>

      {/* Content Layer (stays above SVG via z-index if needed, but here it's sibling) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 text-center">
        
        {/* Texture Overlay (Placed here to be over the content) */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] [background-size:200px_200px]" />

        {/* Tactical Matrix Strings */}
        <div className="absolute top-12 left-12 flex flex-col gap-1 data-string data-string-1 items-start">
            <span className="font-montserrat text-[8px] tracking-[0.5em] text-accent uppercase">Brand.Intel // HAPPY LIFE ASTRO</span>
            <span className="font-montserrat text-[8px] tracking-[0.3em] text-white/20 uppercase">Core Status: ACTIVE</span>
        </div>

        <div className="absolute top-12 right-12 flex flex-col gap-1 data-string data-string-2 text-right items-end">
            <span className="font-montserrat text-[8px] tracking-[0.5em] text-white/20 uppercase">Energy // Alignment</span>
            <span className="font-montserrat text-[8px] tracking-[0.3em] text-white/20 uppercase">Vedic Astro & Vastu</span>
        </div>

        <div className="absolute bottom-12 left-12 flex flex-col gap-1 data-string data-string-3 items-start">
            <span className="font-montserrat text-[8px] tracking-[0.5em] text-white/20 uppercase">System: Happy Life Portal</span>
            <span className="font-montserrat text-[8px] tracking-[0.3em] text-white/20 uppercase">© 2026 HAPPY LIFE ASTRO</span>
        </div>

        {/* Logo Container */}
        <div ref={logoRef} className="relative lg:mb-20 mb-10 w-full flex justify-center">
            <div ref={logoRevealRef} className="overflow-visible lg:pr-40 lg:pl-10 pr-0 pl-0 w-fit">
                <h1 className="font-montserrat text-normal flex drop-shadow-[0_0_80px_rgba(255,255,255,0.05)] whitespace-nowrap text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                    HAPPY LIFE
                </h1>
            </div>
            
            <div 
              ref={counterRef}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2"
            >
              <div className="flex flex-col items-center gap-4">
                 <div className="h-[1px] w-48 bg-white/5 relative overflow-hidden">
                    <div ref={progressRef} className="absolute inset-0 bg-accent scale-x-0 origin-left shadow-[0_0_15px_#8B5CF6]" />
                 </div>
                 <span className="font-montserrat text-[14px] font-bold text-accent tracking-[0.8em]">{counter.toString().padStart(3, '0')}</span>
              </div>
            </div>
        </div>

        {/* Signature */}
        <div 
            ref={signatureRef}
            className="lg:absolute lg:bottom-12 lg:right-12 lg:text-right relative text-center pointer-events-none mt-4 lg:mt-0"
          >
            <span className="block font-montserrat text-[8px] tracking-[0.6em] text-white/20 uppercase ">Mentorship & Guidance by</span>
            <div ref={sigRevealRef} className="overflow-hidden py-4 lg:py-6">
                <div 
                    className="font-montserrat text-4xl sm:text-5xl lg:text-6xl text-accent/90 whitespace-nowrap px-4"
                    style={{ fontFamily: "'Mrs Saint Delafield', cursive" }}
                >
                    Dr. Yogesh Sharma
                </div>
            </div>
        </div>
      </div>

      {/* Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-accent/[0.02] blur-[150px] rounded-full pointer-events-none" />
    </div>
  )
}

export default Preloader
