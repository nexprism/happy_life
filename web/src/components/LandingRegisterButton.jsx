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

  const handleClick = (e) => {
    const leadForm = document.getElementById('lead-form')
    if (leadForm) {
      e.preventDefault()
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
      const firstInput = leadForm.querySelector('input')
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 400)
      }
    }
  }

  return (
    <>
      {/* 1. Mobile-Only (< md): Full-Width Fixed Bottom Bar */}
      <aside
        aria-label="Quick Registration Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] group"
      >
        <Link
          to="/signup"
          onClick={handleClick}
          aria-label="Register on Happy Life Astro"
          className="relative flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#175284] via-[#2171B5] to-[#3a91dd] text-white border border-white/25 shadow-[0_6px_20px_rgba(33,113,181,0.3)] active:scale-[0.98] transition-all duration-200 overflow-hidden"
        >
          {/* Circular Icon */}
          <div className="relative w-7 h-7 rounded-full bg-white/20 flex items-center justify-center border border-white/25 shadow-inner shrink-0 mr-2.5">
            <svg
              className="w-4 h-4 text-white"
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

          <span className="font-montserrat font-extrabold text-[13px] uppercase tracking-[0.2em] text-white">
            Register
          </span>
          <svg
            className="w-4 h-4 ml-2 text-white/90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </aside>

      {/* 2. Desktop-Only (>= md): Floating Pill Button without any dark container */}
      <aside
        aria-label="Quick Registration Desktop"
        className="hidden md:block fixed bottom-8 right-8 z-50 group"
      >
        <Link
          to="/signup"
          onClick={handleClick}
          aria-label="Register on Happy Life Astro"
          className="relative flex items-center justify-center rounded-full bg-gradient-to-r from-[#175284] via-[#2171B5] to-[#3a91dd] text-white border border-white/25 shadow-[0_6px_20px_rgba(33,113,181,0.28)] hover:shadow-[0_10px_28px_rgba(33,113,181,0.4)] hover:scale-[1.03] active:scale-95 transition-all duration-300 overflow-hidden px-5 py-3"
        >
          {/* Shimmer sweep light ray on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Circular Icon Badge Container */}
          <div className="relative w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner group-hover:rotate-6 transition-transform shrink-0">
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

          {/* Text and Arrow: Clean display on desktop */}
          <div className="flex items-center gap-2 pl-3 select-none">
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
    </>
  )
}

export default LandingRegisterButton
