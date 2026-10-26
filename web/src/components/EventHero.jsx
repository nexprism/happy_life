import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import RollingText from './RollingText'
import bannerImg from '../assets/images/banner.png'
import resolveMediaUrl from '../utils/mediaUrl'

const getImageUrl = (thumb) => {
  if (!thumb) return bannerImg
  return resolveMediaUrl(thumb, bannerImg)
}

const EventHero = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const sliderRef = useRef(null)
  const isAnimatingRef = useRef(false)

  // Keep currentIndex bounded if events length changes
  useEffect(() => {
    if (currentIndex >= (events?.length || 0)) {
      setCurrentIndex(0)
    }
  }, [events, currentIndex])

  useEffect(() => {
    if (!events || events.length <= 1) return

    // Auto-cycle logic
    const timer = setInterval(() => {
      goToSlide((currentIndex + 1) % events.length)
    }, 5500)

    return () => clearInterval(timer)
  }, [currentIndex, events])

  const goToSlide = (nextIndex) => {
    if (!events || events.length <= 1 || nextIndex === currentIndex || isAnimatingRef.current) return
    isAnimatingRef.current = true

    const slides = gsap.utils.toArray('.event-slide')
    const currentSlide = slides[currentIndex]
    const nextSlide = slides[nextIndex]

    if (!currentSlide || !nextSlide) {
      setCurrentIndex(nextIndex)
      isAnimatingRef.current = false
      return
    }

    // Direction calculation
    const isForward = nextIndex > currentIndex || (currentIndex === events.length - 1 && nextIndex === 0)
    const initialX = isForward ? 100 : -100
    const exitX = isForward ? -30 : 30

    gsap.set(nextSlide, { xPercent: initialX, autoAlpha: 1, zIndex: 10 })
    gsap.set(currentSlide, { zIndex: 5 })

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(nextIndex)
        gsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 })
        isAnimatingRef.current = false
      }
    })

    tl.to(currentSlide, {
      xPercent: exitX,
      duration: 1.1,
      ease: 'power3.inOut'
    })
    .to(nextSlide, {
      xPercent: 0,
      duration: 1.1,
      ease: 'power3.inOut'
    }, 0)
  }

  if (!events || events.length === 0) return null

  return (
    <section ref={containerRef} className="relative w-full h-[360px] md:h-[600px] overflow-hidden bg-dark">
      
      {/* Slider Container */}
      <div ref={sliderRef} className="relative w-full h-full">
        {events.map((event, i) => {
          const categoryLabel = event.category 
            ? event.category 
            : (event.type === 'all_events' 
                ? 'UPCOMING EVENT' 
                : event.type 
                  ? event.type.replace('_', ' ').toUpperCase() 
                  : 'FEATURED EVENT')

          const desktopSrc = getImageUrl(event.image || event.thumbnail)
          const mobileSrc = event.mobileImage ? getImageUrl(event.mobileImage) : desktopSrc

          return (
            <div 
              key={event._id || i} 
              className={`event-slide absolute inset-0 w-full h-full overflow-hidden ${
                i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Responsive Background Image */}
              <picture className="absolute inset-0 w-full h-full">
                {event.mobileImage && (
                  <source media="(max-width: 768px)" srcSet={mobileSrc} />
                )}
                <img  
                  src={desktopSrc} 
                  alt={event.title || 'Event Banner'} 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { 
                    e.currentTarget.onerror = null
                    e.currentTarget.src = bannerImg 
                  }}
                />
              </picture>

              {/* Gradient Overlay - only when title overlay exists */}
              {event.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/50 to-black/30 pointer-events-none" />
              )}
              
              {/* Event Info Overlay - only when title is provided */}
              {event.title && (
                <div className="absolute bottom-10 sm:bottom-12 left-6 md:left-16 max-w-2xl z-20 space-y-2.5">
                  <span className="inline-block px-3 py-1 bg-accent/90 backdrop-blur-sm text-white font-montserrat text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                    {categoryLabel}
                  </span>
                  <h2 className="font-montserrat text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] drop-shadow-sm">
                    {event.title}
                  </h2>
                  {event.description && (
                    <p className="font-montserrat text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-xl font-normal leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              )}
              
            </div>
          )
        })}
      </div>

      {/* Dynamic Progress Indicator / Nav Dots */}
      {events.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 right-6 md:right-12 flex items-center gap-2.5 z-20">
          {events.map((_, i) => (
            <button 
              key={i} 
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === currentIndex ? 'w-10 bg-accent' : 'w-3 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

    </section>
  )
}

export default EventHero
