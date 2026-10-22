import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RollingText from './RollingText'
import authorizedFetch from '../utils/apiClient'
import { useLanguage } from '../context/LanguageContext'

const DEFAULT_SELECTIONS = [
  {
    id: 'astro_vastu',
    title: 'Astro-Vastu Mastery',
    subtitle: 'Harmonize Your Home & Destiny',
    image: '/courses/architecture.png',
    type: 'all_courses'
  },
  {
    id: 'kundli_analysis',
    title: 'Vedic Kundli & Remedies',
    subtitle: 'Practical Solutions for Modern Challenges',
    image: '/courses/motion.png',
    type: 'all_courses'
  },
  {
    id: 'numerology_guidance',
    title: 'Numerology & Name Alignment',
    subtitle: 'Unlock The Power of Numbers',
    image: '/courses/typography.png',
    type: 'all_courses'
  },
  {
    id: 'career_finance_astrology',
    title: 'Career & Financial Astrology',
    subtitle: 'Overcome Obstacles with Logical Upay',
    image: '/courses/curator.png',
    type: 'all_courses'
  }
]

const StackingBanners = () => {
  const [featured, setFeatured] = useState([])
  const navigate = useNavigate()
  const { t } = useLanguage()

  const getImageUrl = (thumb) => {
    if (!thumb) return null
    try {
      if (/^https?:\/\//i.test(thumb)) return thumb
      let path = thumb
      if (!path.startsWith('/') && !path.startsWith('uploads/')) {
        path = `uploads/${path}`
      }
      const rawBase = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com'
      const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '')
      return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    } catch {
      return null
    }
  }

  const stripHTML = (str) =>
    typeof str === 'string' ? str.replace(/<[^>]*>?/gm, '') : ''

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await authorizedFetch('/banners?isActive=true')
        if (!res.ok) return
        const data = await res.json()
        const raw = data?.data?.banners || data?.data || data?.results || data || []
        if (mounted && Array.isArray(raw) && raw.length > 0) {
          setFeatured(raw)
        }
      } catch (e) {
        console.error('Failed to load featured banners', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const bannerItems = featured.length > 0 
    ? featured.slice(0, 6).map((c) => ({
        id: c._id || c.id,
        title: c.title,
        description: stripHTML(c.description || ''),
        image: getImageUrl(c.image),
        type: c.type,
        referenceId: c.referenceId,
      }))
    : DEFAULT_SELECTIONS

  const handleCardClick = (item) => {
    if (item.type === 'course' && item.referenceId) {
      navigate(`/course-detail/${item.referenceId}`)
    } else if (item.type === 'job' && item.referenceId) {
      navigate(`/dashboard/job/${item.referenceId}`)
    } else if (item.type === 'all_courses') {
      navigate('/courses')
    } else if (item.type === 'all_jobs') {
      navigate('/dashboard/job-posts')
    } else {
      navigate('/courses')
    }
  }

  return (
    <section className="relative w-full py-12 md:py-24 overflow-visible">
      <div className="flex flex-col md:flex-row gap-16 md:gap-24 px-4 md:px-20 max-w-[1600px] mx-auto">
        
        {/* ── Left Column: Sticky Title & Description ── */}
        <div className="md:w-[45%] md:sticky md:top-28 md:h-fit z-30 pt-10 pb-6 md:py-20 self-start">
          <div className="flex flex-col gap-12 md:gap-14 relative z-10">
            
            {/* Header / Subheading */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-accent/40"></div>
                <span className="font-montserrat text-[10px] text-accent tracking-[0.5em] uppercase opacity-80">
                  {t('selectedForYou') || 'Selected for You'}
                </span>
              </div>
              <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                The <br />
                <span className="text-accent ml-8">Selection</span>
              </h2>
            </div>

            {/* Description with Vertical Glowing Line Indicator */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent/60 via-accent/10 to-transparent"></div>
              <div className="absolute left-[-3px] top-0 w-[7px] h-[7px] rounded-full bg-accent animate-pulse shadow-[0_0_15px_rgba(33,113,181,0.8)]"></div>
              <p className="font-montserrat text-[12px] font-semibold text-slate-700 tracking-[0.14em] leading-[2.1] uppercase max-w-md">
                {t('selectionSub') || 'A hand-picked collection of lessons built to help you grow faster. Learn the best strategies from our most popular courses.'}
              </p>
            </div>

            {/* Explore All CTA Button with Rolling Shutter & Hover Lines */}
            <div className="pt-4 md:pt-6 flex items-center gap-8 group/all">
              <button 
                onClick={() => navigate('/courses')}
                className="px-12 py-6 rounded-none font-montserrat text-[12px] font-bold tracking-[0.3em] relative group/btn overflow-hidden transition-all hover:scale-105 active:scale-95 bg-accent text-white w-fit shadow-[0_10px_40px_rgba(33,113,181,0.25)]"
              >
                <RollingText text={t('exploreAll') || 'EXPLORE ALL'} className="relative z-10" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
              </button>

              <div className="flex flex-col gap-1.5 opacity-30 group-hover/all:opacity-100 transition-opacity duration-700">
                <div className="w-12 h-[1px] bg-accent group-hover/all:w-20 transition-all duration-700 ease-in-out"></div>
                <div className="w-8 h-[1px] bg-accent group-hover/all:w-14 transition-all duration-700 delay-100 ease-in-out"></div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right Column: Sticky Stacking Cards Deck ── */}
        <div className="md:w-[65%] relative">
          {bannerItems.map((card, idx) => (
            <div 
              key={card.id || idx} 
              className="h-[68vh] md:h-screen flex items-start justify-center md:items-center sticky top-0 pt-6 md:pt-0"
            >
              <div 
                className="relative w-full md:w-[700px] h-[55vh] md:h-[65vh] mx-auto rounded-[2.5rem] overflow-hidden border border-border shadow-[0_30px_80px_-20px_rgba(15,23,42,0.15)] bg-card origin-top transition-transform duration-300"
                style={{ 
                  top: `calc(${idx * 16}px + 4vh)`,
                  zIndex: idx + 1
                }}
              >
                {/* Background Image Container */}
                <div className="relative w-full h-full overflow-hidden group">
                  <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
                    <img 
                      alt={card.title || "Module"} 
                      className="w-full h-full object-cover object-center block" 
                      src={card.image} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/courses/architecture.png';
                      }}
                    />
                  </div>

                  {/* Deep Gradient Overlay on Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none"></div>
                </div>

                {/* Bottom Action Button Inside Card */}
                <div className="absolute bottom-6 left-6 pointer-events-auto z-20">
                  <button 
                    onClick={() => handleCardClick(card)}
                    className="px-8 py-5 rounded-none font-montserrat text-[14px] font-bold tracking-[0.2em] relative group/btn overflow-hidden transition-all hover:scale-105 active:scale-95 bg-accent text-white w-fit shadow-md"
                  >
                    <RollingText 
                      text={
                        card.type === 'job' || card.type === 'all_jobs'
                          ? (t('viewJob') || 'VIEW OPPORTUNITY')
                          : (t('startModule') || 'START THE MODULE')
                      } 
                      className="relative z-10" 
                    />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default StackingBanners