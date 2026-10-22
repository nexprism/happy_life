import React from 'react'
import sanitizeDisplay from '../utils/textSanitize'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const CourseCard = ({ item, className = '', variant = 'course', onRegister }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Compute builder/landing page destination if provided
  const rawLandingUrl = item?.landingPageUrl ? String(item.landingPageUrl).trim() : ''
  const isExternalLanding = rawLandingUrl.startsWith('http://') || rawLandingUrl.startsWith('https://')
  const landingDest = rawLandingUrl
    ? (isExternalLanding ? rawLandingUrl : (rawLandingUrl.startsWith('/') ? rawLandingUrl : `/${rawLandingUrl}`))
    : ''

  const handleAction = (e) => {
    if (variant === 'event') {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      if (landingDest) {
        if (isExternalLanding) {
          window.location.href = landingDest
        } else {
          navigate(landingDest)
        }
        return
      }

      if (item?.onRegister) item.onRegister(item)
      else if (onRegister) onRegister(item)
    }
  }

  const CardContent = (
    <div className={`catalog-card flex flex-col h-full group ${className}`}>
      {/* Image Wrapper */}
      <div className="relative overflow-hidden mb-8 aspect-square bg-black/5 dark:bg-white/5 rounded-none">
        <img 
          src={item.image} 
          alt={sanitizeDisplay(item.title)}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/courses/curator.png';
          }}
        />
        {item.isNew && (
          <div className="absolute top-4 right-4 bg-accent/90 text-white px-2 py-0.5 font-montserrat text-[8px] font-bold tracking-tighter z-30">
            {t('newBadge') || 'NEW'}
          </div>
        )}
      </div>

      {/* Content Metadata */}
      <div className="flex flex-col flex-grow gap-2.5 px-1">
        <span className="font-montserrat text-[8px] md:text-[9px] text-accent tracking-[0.25em] font-bold uppercase pointer-events-none">
          {item.category}
        </span>
        
        <h3 className="font-montserrat text-xl sm:text-2xl lg:text-[clamp(1.15rem,1.35vw,1.45rem)] text-normal font-bold tracking-tight leading-snug pointer-events-none break-words">
          {sanitizeDisplay(item.title)}
        </h3>
        
        <p className="font-montserrat text-[13px] text-description leading-relaxed max-w-[90%] mb-4 flex-grow line-clamp-2 pointer-events-none">
          {item.description}
        </p>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
          {variant === 'course' ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-montserrat text-[13px] text-normal tracking-widest font-bold">
                  {item.price}
                </span>
                {item.originalPrice && (
                  <span className="font-montserrat text-[11px] text-description/60 line-through tracking-wider">
                    {item.originalPrice}
                  </span>
                )}
              </div>
              <div className="w-5 h-5 flex items-center justify-center border border-accent/30 rounded-full group-hover:bg-accent group-hover:border-accent transition-all duration-500 overflow-hidden">
                <svg 
                  width="10" 
                  height="10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="transition-all duration-500 group-hover:stroke-white stroke-accent"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          ) : (
            <button 
              type="button"
              onClick={handleAction}
              className="w-full py-3 bg-accent text-white font-montserrat text-[11px] font-bold tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-98 shadow-sm transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>{landingDest ? (item.buttonText || 'EXPLORE MORE') : (item.buttonText || t('registerNow') || 'REGISTER NOW')}</span>
              {landingDest && (
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (variant === 'course') {
    return (
      <Link to={`/course-detail/${item.id}`} className="block h-full">
        {CardContent}
      </Link>
    )
  }

  if (variant === 'event') {
    return (
      <div onClick={handleAction} className="block h-full cursor-pointer">
        {CardContent}
      </div>
    )
  }

  return CardContent
}

export default CourseCard

