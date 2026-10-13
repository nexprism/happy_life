import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

const staticTestimonials = [
  { name: "Rajesh K.", role: "Business Owner", text: "Dr. Yogesh Sharma's Vastu guidance completely restored harmony in our new office. Financial flow improved noticeably in 30 days.", rating: 5 },
  { name: "Pooja M.", role: "IT Professional", text: "The birth chart reading was remarkably accurate and practical. His simple remedies for Rahu overthinking brought real mental peace.", rating: 5 },
  { name: "Vikram S.", role: "Consultant", text: "No fear-mongering, no expensive rituals. Pure logical and Vedic insights that actually work in daily life. Highly recommended!", rating: 5 },
  { name: "Priya V.", role: "Homemaker", text: "Following Dr. Sharma's non-destructive Vastu tips for our kitchen and bedroom transformed our family peace and health.", rating: 5 },
  { name: "Amitabh G.", role: "Entrepreneur", text: "The name vibration and numerology session was eye-opening. Aligned my brand name and saw immediate client growth.", rating: 5 },
  { name: "Ananya S.", role: "Teacher", text: "Dr. Yogesh Sharma's clarity is unmatched. Following his simple remedies transformed my household peace and career.", rating: 5 },
  { name: "Ramesh P.", role: "Financial Advisor", text: "His practical analysis of planetary transits helped me make the right career moves at the right time.", rating: 5 },
  { name: "Divya N.", role: "Healthcare Professional", text: "The consultation gave me immense clarity during a difficult Sade Sati phase. His advice is grounded in truth and compassion.", rating: 5 },
  { name: "Suresh R.", role: "Real Estate Consultant", text: "Dr. Sharma's no-superstition, practical approach is what makes this authentic. I've recommended his consultations to my entire family.", rating: 5 },
  { name: "Meera T.", role: "Designer", text: "Happy Life Astro has provided genuine direction to our family. Truly life-transforming guidance!", rating: 5 },
]

const StarRating = ({ rating }) => (
  <div className="flex gap-1 mb-4">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < rating ? 'bg-accent' : 'bg-white/15'}`} />
    ))}
  </div>
)

const TestimonialsScroll = ({ reviews = [] }) => {
  const ref = useRef(null)
  const colRefs = useRef([])
  const [columns, setColumns] = React.useState([])
  const [colCount, setColCount] = React.useState(3)

  // Memoize the dynamic testimonials
  const displayTestimonials = React.useMemo(() => {
    const reviewsArray = Array.isArray(reviews) ? reviews : [];
    
    // Filter out nulls/undefined and invalid objects
    const validReviews = reviewsArray.filter(r => r !== null && typeof r === 'object' && (r.reviewText || r.text));

    return validReviews.map(r => {
      let avatar = null;
      if (r.image) {
        const rawBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
        const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
        avatar = `${baseUrl}${r.image.startsWith('/') ? '' : '/'}${r.image}`;
      }
      return {
        name: r.name || "Student",
        role: r.designation || r.role || "Enrolled Student",
        text: r.reviewText || r.text || "",
        rating: r.rating || 5,
        image: avatar
      };
    });
  }, [reviews]);

  useEffect(() => {
    if (displayTestimonials.length === 0) return;

    const handleResize = () => {
      const width = window.innerWidth
      let count = 3
      if (width < 768) count = 1
      else if (width < 1024) count = 2

      setColCount(count)

      // Split displayTestimonials into columns
      const base = Array.from({ length: count }, (_, ci) =>
        displayTestimonials.filter((_, i) => i % count === ci)
      )

      // Repeat columns for infinite scroll effect only if we have enough items
      // If items are very few, we don't repeat as much to avoid "same review" look
      const repeated = base.map(col => {
        if (col.length === 0) return [];
        const arr = []
        // Only repeat if we have at least 3 reviews per column to make it look decent
        const repeatTimes = displayTestimonials.length > 3 ? 6 : 1;
        for (let i = 0; i < repeatTimes; i++) arr.push(...col)
        return arr
      })

      setColumns(repeated)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [displayTestimonials])

  useEffect(() => {
    if (columns.length === 0 || columns.every(c => c.length === 0)) return

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo('.ts-heading',
        { opacity: 0, y: 50, filter: 'blur(14px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power4.out', stagger: 0.12,
          scrollTrigger: { trigger: '.ts-heading', start: 'top 87%' }
        }
      )

      // Parallax each column - only if we have enough items to actually scroll
      if (displayTestimonials.length > 3) {
        const configs = [
          { y: -380, scrub: 1.2 },
          { y: 320, scrub: 0.8 },
          { y: -350, scrub: 1.0 },
        ]

        colRefs.current.forEach((col, i) => {
          if (!col || !configs[i]) return
          gsap.to(col, {
            y: configs[i].y,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: configs[i].scrub,
            },
          })
        })
      }

    }, ref)
    return () => ctx.revert()
  }, [columns, displayTestimonials.length])

  // If no dynamic reviews, hide the whole section
  if (displayTestimonials.length === 0) return null;

  const isLowCount = displayTestimonials.length <= 3;

  return (
    <section ref={ref} className="max-w-full mx-auto py-20 relative">

      {/* Heading */}
      <div className="text-center mb-10 md:mb-20">
        <span className="ts-heading block font-montserrat text-[9px] text-accent tracking-[0.4em] md:tracking-[0.7em] uppercase font-bold opacity-70 mb-4">
          Verified / Testimonials
        </span>
        <h2 className="ts-heading font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
          What Our Students <span className="text-accent underline-lime">Say</span>
        </h2>
      </div>

      {/* Clipped viewport */}
      <div className={`relative overflow-hidden border border-white/5 bg-white/[0.01] ${isLowCount ? 'h-auto py-20' : ''}`}
        style={{ height: isLowCount ? 'auto' : (colCount === 1 ? '600px' : '800px') }}>

        {/* Edge fades - only show if scrolling */}
        {!isLowCount && (
          <>
            <div className="absolute top-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-b from-dark to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-t from-dark to-transparent z-20 pointer-events-none" />
          </>
        )}

        {/* Grid of columns */}
        <div className={`flex gap-4 md:gap-6 px-4 md:px-6 items-start ${isLowCount ? 'relative inset-0' : 'absolute inset-0 top-auto'}`}
          style={{ top: isLowCount ? '0' : '-400px' }}>
          {columns.map((col, ci) => (
            <div
              key={`${ci}-${columns.length}`}
              ref={el => colRefs.current[ci] = el}
              className="flex flex-col gap-4 flex-1 min-w-0"
              style={{ marginTop: (!isLowCount && ci === 1) ? '-80px' : '0px' }}
            >
              {col.map((t, ti) => (
                <div
                  key={ti}
                  className="group relative border border-white/8 bg-white/[0.015] p-5 backdrop-blur-xl cursor-pointer
                             transition-all duration-400 hover:border-accent/40 hover:bg-accent/[0.03]
                             hover:-translate-y-1 hover:scale-[1.015] active:scale-[0.98]"
                >
                  {/* Left accent bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                  {/* Watermark index */}
                  <div className="absolute bottom-2 right-3 font-montserrat text-[42px] md:text-[52px] font-black text-white/[0.03] leading-none pointer-events-none select-none group-hover:text-accent/[0.05] transition-colors duration-700">
                    {String((ti % displayTestimonials.length) + 1).padStart(2, '0')}
                  </div>

                  {/* Avatar + meta */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-accent/20 border border-accent/20 overflow-hidden flex items-center justify-center shrink-0 font-montserrat text-[8px] text-accent font-black group-hover:bg-accent/30 transition-colors duration-400">
                      {t.image ? (
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        t.name.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div>
                      <p className="font-montserrat text-[9px] text-description font-bold tracking-[0.2em] uppercase">{t.name}</p>
                      <p className="font-montserrat text-[7px] text-description/80 tracking-widest">{t.role}</p>
                    </div>
                  </div>

                  <StarRating rating={t.rating} />

                  <p className="font-montserrat text-[10px] md:text-[9px] leading-[1.8] md:leading-[1.9] text-description tracking-wide">
                    "{t.text}"
                  </p>

                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default TestimonialsScroll
