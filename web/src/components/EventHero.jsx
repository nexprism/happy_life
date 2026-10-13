import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import RollingText from './RollingText'
import bannerImg from '../assets/images/banner.png'

const getImageUrl = (thumb) => {
  if (!thumb) return bannerImg
  const normalized = String(thumb).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(normalized)) return normalized
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com'
  return normalized.startsWith('/') ? `${baseUrl}${normalized}` : `${baseUrl}/${normalized}`
}

const EventHero = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const sliderRef = useRef(null)

  useEffect(() => {
    if (!events || events.length === 0) return

    // Auto-cycle logic
    const timer = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(timer)
  }, [currentIndex, events])

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % events.length
    
    // Sliding Animation: Right to Left
    const slides = gsap.utils.toArray('.event-slide')
    const currentSlide = slides[currentIndex]
    const nextSlide = slides[nextIndex]

    // Initialize next slide to the right
    gsap.set(nextSlide, { xPercent: 100, autoAlpha: 1, zIndex: 10 })
    gsap.set(currentSlide, { zIndex: 5 })

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(nextIndex)
        gsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 })
      }
    })

    tl.to(currentSlide, {
      xPercent: -30,
      duration: 1.2,
      ease: 'power3.inOut'
    })
    .to(nextSlide, {
      xPercent: 0,
      duration: 1.2,
      ease: 'power3.inOut'
    }, 0)
  }

  return (
    <section ref={containerRef} className="relative w-full h-[350px] md:h-[600px] overflow-hidden bg-dark">
      
      {/* Slider Container */}
      <div ref={sliderRef} className="relative w-full h-full">
        {events.map((event, i) => (
          <div 
            key={event._id || i} 
            className={`event-slide absolute inset-0 w-full h-full overflow-hidden ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image */}
            <img  
              src={getImageUrl(event.thumbnail || event.image)} 
              alt={event.title || 'Event'} 
              className="inset-0 w-full h-full object-cover object-center"
              onError={(e) => { e.currentTarget.src = bannerImg }}
            />
            {/* Event Specific Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-black/30" />
            
            {/* Event Info Overlay */}
            <div className="absolute bottom-12 left-6 md:left-16 max-w-2xl z-20 space-y-2">
              <span className="inline-block px-3 py-1 bg-accent/90 text-white font-montserrat text-[10px] font-bold uppercase tracking-widest rounded-sm">
                {event.category || 'FEATURED EVENT'}
              </span>
              <h2 className="font-montserrat text-white text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                {event.title}
              </h2>
              {event.description && (
                <p className="font-montserrat text-xs md:text-sm text-gray-300 line-clamp-2 max-w-xl">
                  {event.description}
                </p>
              )}
            </div>
            
          </div>
        ))}
      </div>

      {/* Dynamic Progress Indicator (Minimal) */}
      <div className="absolute bottom-8 right-12 flex gap-3 z-20">
         {events.map((_, i) => (
           <div 
             key={i} 
             className={`h-[2px] transition-all duration-700 ${i === currentIndex ? 'w-12 bg-accent' : 'w-4 bg-white/20'}`}
           />
         ))}
      </div>

    </section>
  )
}

export default EventHero
