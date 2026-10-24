import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../redux/slices/courseSlice'
import sanitizeDisplay from '../utils/textSanitize'
import RollingText from './RollingText'
import { resolveMediaUrl } from '../utils/mediaUrl'

const fallbackCourses = [
  { id: '1', title: 'Become An AI Builder In 30 Days.', tag: 'AI & TECH', thumbnail: '/courses/curator.png' },
  { id: '2', title: 'MVP Engineering Masterclass', tag: 'ENGINEERING', thumbnail: '/courses/motion.png' },
  { id: '3', title: 'Learn How To Communicate', tag: 'COMMUNICATION', thumbnail: '/courses/workshop.png' },
  { id: '4', title: 'Branding Masterclass', tag: 'BRANDING', thumbnail: '/courses/architecture.png' },
  { id: '5', title: 'The Art Of Content Creation', tag: 'CONTENT', thumbnail: '/courses/narrative.png' },
  { id: '6', title: 'SEO Masterclass & Growth', tag: 'MARKETING', thumbnail: '/courses/pricing.png' },
  { id: '7', title: 'Google Ads Mastery', tag: 'ADVERTISING', thumbnail: '/courses/typography.png' },
  { id: '8', title: 'Facebook Ads Domination', tag: 'PAID ADS', thumbnail: '/digital_curator_card_v1.png' },
  { id: '9', title: 'Website Made Easy', tag: 'WEB DESIGN', thumbnail: '/gig_tech.png' },
  { id: '10', title: 'Solopreneur Blueprint', tag: 'BUSINESS', thumbnail: '/gig_vis.png' },
  { id: '11', title: 'Vibe Marketing Engine', tag: 'GROWTH', thumbnail: '/gig_motion.png' }
]

const CourseSlider = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { courses: apiCourses } = useSelector((state) => state.courses)

  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const cardsRef = useRef([])
  const bordersRef = useRef([])

  const animRef = useRef(null)
  const posRef = useRef(0)
  const isHoveredRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartPosRef = useRef(0)
  const hasMovedRef = useRef(false)

  // Use API courses or fallback data
  const baseCourses = useMemo(() => {
    if (apiCourses && apiCourses.length > 0) {
      return apiCourses
    }
    return fallbackCourses
  }, [apiCourses])

  // Multiply items to create infinite marquee buffer
  const items = useMemo(() => {
    let combined = [...baseCourses]
    while (combined.length < 16) {
      combined = [...combined, ...baseCourses]
    }
    // Duplicate 3x for seamless infinite wraparound
    return [...combined, ...combined, ...combined]
  }, [baseCourses])

  useEffect(() => {
    if (!apiCourses || apiCourses.length === 0) {
      dispatch(fetchCourses())
    }
  }, [dispatch, apiCourses])

  // Continuous Marquee & Center-Proximity Scaling Engine
  useEffect(() => {
    let lastTime = performance.now()
    const autoSpeed = 48 // pixels per second

    const updateSlider = (now) => {
      const delta = (now - lastTime) / 1000
      lastTime = now

      if (!isDraggingRef.current && trackRef.current && sectionRef.current) {
        const speed = isHoveredRef.current ? autoSpeed * 0.25 : autoSpeed
        posRef.current -= speed * delta

        // Compute single set width (1/3 of total track width)
        const totalWidth = trackRef.current.scrollWidth
        const setWidth = totalWidth / 3

        if (setWidth > 0) {
          if (posRef.current <= -setWidth * 2) {
            posRef.current += setWidth
          } else if (posRef.current > -setWidth) {
            posRef.current -= setWidth
          }
        }
      }

      // Apply track translation
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0px, 0px)`
      }

      // Apply real-time proximity scaling, opacity, and active border to all cards
      if (sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect()
        const centerX = sectionRect.left + sectionRect.width / 2

        cardsRef.current.forEach((cardEl, idx) => {
          if (!cardEl) return
          const cardRect = cardEl.getBoundingClientRect()
          const cardCenterX = cardRect.left + cardRect.width / 2
          const dist = Math.abs(cardCenterX - centerX)

          // Proximity calculation with smooth falloff
          const maxRadius = 360
          const t = Math.min(1, dist / maxRadius)

          // Center: 1.15 scale down to 0.85 scale
          const scale = 1.15 - 0.30 * Math.pow(t, 1.2)
          // Center: 1.0 opacity down to 0.50 opacity
          const opacity = 1.0 - 0.50 * Math.pow(t, 0.9)
          // Center: border opacity 1 within 75px radius
          const borderOpacity = dist < 75 ? Math.max(0, 1 - dist / 75) : 0

          cardEl.style.transform = `scale(${scale.toFixed(3)}, ${scale.toFixed(3)})`
          cardEl.style.opacity = opacity.toFixed(3)

          const borderEl = bordersRef.current[idx]
          if (borderEl) {
            borderEl.style.opacity = borderOpacity.toFixed(3)
          }
        })
      }

      animRef.current = requestAnimationFrame(updateSlider)
    }

    // Set initial middle offset
    if (trackRef.current) {
      const setWidth = trackRef.current.scrollWidth / 3
      if (setWidth > 0) {
        posRef.current = -setWidth
      }
    }

    animRef.current = requestAnimationFrame(updateSlider)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [items])

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartXRef.current = e.clientX
    dragStartPosRef.current = posRef.current
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartXRef.current
    if (Math.abs(dx) > 4) {
      hasMovedRef.current = true
    }
    posRef.current = dragStartPosRef.current + dx
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true
      hasMovedRef.current = false
      dragStartXRef.current = e.touches[0].clientX
      dragStartPosRef.current = posRef.current
    }
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStartXRef.current
    if (Math.abs(dx) > 4) {
      hasMovedRef.current = true
    }
    posRef.current = dragStartPosRef.current + dx
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  const handleCardClick = (course) => {
    if (hasMovedRef.current) return
    navigate(`/course-detail/${course._id || course.id}`)
  }

  const getImageUrl = (course) => {
    const imgPath = course.verticalCarouselImage || course.thumbnail || course.coverImage || course.horizontalCarouselImage
    return resolveMediaUrl(imgPath, '/courses/curator.png')
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-8 md:py-14 pb-16 md:pb-24 overflow-hidden select-none bg-gradient-to-b from-[#f4f8fc] via-[#ebf4fa]/60 to-[#f8fafc]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp()
        isHoveredRef.current = false
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Edge Gradient Masks for Smooth Fade */}
      <div className="absolute top-0 left-0 z-20 w-[14vw] md:w-[18vw] h-full bg-gradient-to-r from-[#f4f8fc] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 z-20 w-[14vw] md:w-[18vw] h-full bg-gradient-to-l from-[#f4f8fc] to-transparent pointer-events-none" />

      {/* Marquee Track with ample padding so cards are fully displayed */}
      <div
        ref={trackRef}
        className="flex items-center gap-7 md:gap-9 lg:gap-11 will-change-transform cursor-grab active:cursor-grabbing py-6"
      >
        {items.map((course, idx) => (
          <div
            key={`${course._id || course.id}-${idx}`}
            ref={(el) => (cardsRef.current[idx] = el)}
            onClick={() => handleCardClick(course)}
            onMouseEnter={() => (isHoveredRef.current = true)}
            onMouseLeave={() => (isHoveredRef.current = false)}
            className="slider-card relative flex-shrink-0 w-[185px] md:w-[200px] cursor-pointer group"
            style={{
              opacity: 0.5,
              transform: 'scale(0.85, 0.85)',
            }}
          >
            {/* Glowing Blue Border for Center Card */}
            <div
              ref={(el) => (bordersRef.current[idx] = el)}
              className="card-border absolute -inset-[2px] rounded-lg border-2 border-accent shadow-accent-large opacity-0 pointer-events-none transition-opacity duration-300"
              style={{ opacity: 0 }}
            />

            {/* Inner Card Container */}
            <div className="relative border border-slate-200/90 p-2.5 flex flex-col gap-2 overflow-hidden transition-colors duration-500 group-hover:border-accent/50 bg-white rounded-md shadow-md">
              {/* Aspect Ratio 4:5 Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 rounded-sm">
                <img
                  alt={sanitizeDisplay(course.title)}
                  className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                  src={getImageUrl(course)}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/courses/curator.png';
                  }}
                />
              </div>

              {/* Course Meta Info */}
              <div className="flex flex-col gap-1.5 px-1 pb-1">
                <div className="flex items-center gap-2 text-accent justify-between border-b border-slate-100 pb-1.5">
                  <RollingText
                    text={course.category?.name || course.category || course.tag || 'COURSE'}
                    className="font-montserrat text-[8px] tracking-[0.22em] font-bold uppercase leading-none h-3.5 truncate max-w-[130px]"
                  />
                  <div className="pointer-events-none text-accent">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-montserrat text-sm text-slate-900 font-bold tracking-tight leading-[1.2] line-clamp-2 min-h-[2.4em]">
                  {sanitizeDisplay(course.title)}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CourseSlider
