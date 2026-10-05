import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Hero = ({ isLoaded = true }) => {
  const containerRef = useRef(null)
  const taglineRef = useRef(null)
  const heading1Ref = useRef(null)
  const heading2Ref = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (isLoaded === false) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ 
        defaults: { ease: 'expo.out', duration: 1.5 }
      })

      if (imageRef.current) {
        tl.fromTo(imageRef.current, 
          { scale: 1.15, opacity: 0, filter: 'blur(12px)' },
          { scale: 1, opacity: 0.75, filter: 'blur(0px)', duration: 2.2 }
        )
      }

      const textEls = [taglineRef.current, heading1Ref.current, heading2Ref.current].filter(Boolean)
      if (textEls.length > 0) {
        tl.fromTo(textEls, 
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 1.2 },
          '-=1.8'
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isLoaded])

  return (
    <section 
      ref={containerRef} 
      className="relative h-[75vh] md:h-[80vh] md:max-h-[600px] bg-gradient-to-b from-[#8fc0ee] via-[#cde3f8] to-[#f4f8fc] flex flex-col items-center justify-end pb-12 md:pb-5 overflow-hidden select-none"
    >
      {/* Background Portrait Image & Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="absolute w-[450px] md:w-[600px] h-[450px] md:h-[600px] bg-gradient-to-tr from-[#2171B5]/20 via-sky-300/20 to-transparent rounded-full blur-3xl opacity-70" />
        <img 
          ref={imageRef}
          src="/hero_image_2.png" 
          alt="Dr. Yogesh Sharma" 
          className="h-[80%] md:h-[100%] w-auto max-w-none object-contain opacity-75 brightness-90 translate-y-10 md:translate-y-20"
          style={{
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)'
          }}
        />
        {/* Soft vignette to ground subject */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f4f8fc] via-transparent to-transparent opacity-85" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 flex flex-col items-center focus:outline-none">
        
        <div className="w-fit flex flex-col items-start space-y-3 md:space-y-4">
          {/* Top Tagline */}
          <div ref={taglineRef} className="flex items-center justify-start gap-4">
            <span className="font-jetbrains text-[9px] md:text-xs text-accent uppercase tracking-[0.4em] font-medium">
              -- ALIGN YOUR ENERGY • UNLOCK SUCCESS
            </span>
          </div>

          {/* Main Headings */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start w-full px-2">
            <h1 
              ref={heading1Ref} 
              className="font-inter text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.4rem] text-slate-900 leading-[0.92] md:leading-[0.88] tracking-[-0.015em] break-words md:whitespace-nowrap font-extralight"
              style={{ fontWeight: 200 }}
            >
              Astrology & Vastu that
            </h1>
            <h1 
              ref={heading2Ref} 
              className="font-inter text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.4rem] text-slate-900 leading-[0.92] md:leading-[0.88] tracking-[-0.015em] break-words md:whitespace-nowrap mt-1 md:mt-2 font-extralight"
              style={{ fontWeight: 200 }}
            >
              <span className="italic text-accent mr-2.5 font-extralight" style={{ fontWeight: 200 }}>actually</span>
              <span>transforms your life</span>
            </h1>
          </div>
        </div>

      </div>

      {/* Decorative top gradient for floating navbar contrast */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-accent/15 to-transparent pointer-events-none" />
    </section>
  )
}

export default Hero