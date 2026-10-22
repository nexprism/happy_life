import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSettings } from '../redux/slices/configSlice'

const LandingRegisterButton = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector((state) => state.config || {})
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!settings) {
      dispatch(fetchSettings())
    }
  }, [dispatch, settings])

  useEffect(() => {
    if (settings && settings.showLandingRegisterButton !== undefined) {
      setIsVisible(Boolean(settings.showLandingRegisterButton))
    }
  }, [settings])

  if (!isVisible) return null

  return (
    <aside aria-label="Quick Registration" className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group">
      {/* Responsive Floating Action Button */}
      <Link
        to="/signup"
        aria-label="Register on Happy Life Astro"
        className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-[#175284] via-[#2171B5] to-[#3a91dd] text-white border border-white/25 shadow-[0_6px_20px_rgba(33,113,181,0.28)] hover:shadow-[0_10px_28px_rgba(33,113,181,0.4)] hover:scale-[1.03] active:scale-95 transition-all duration-300 overflow-hidden w-12 h-12 sm:w-14 sm:h-14 md:w-auto md:h-auto md:px-5 md:py-3"
      >
        {/* Shimmer sweep light ray on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Circular Icon Badge Container */}
        <div className="relative w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner group-hover:rotate-6 transition-transform shrink-0">
          {/* User-Plus / Register SVG Icon */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>

        {/* Text and Arrow: Hidden on mobile view, shown prominently on bigger screens */}
        <div className="hidden md:flex items-center gap-2 pl-3 select-none">
          <span className="font-montserrat font-extrabold text-[12px] uppercase tracking-[0.18em] text-white whitespace-nowrap drop-shadow-sm">
            Register
          </span>
          <svg
            className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </aside>
  )
}

export default LandingRegisterButton
