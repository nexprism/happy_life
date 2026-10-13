import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100/90 border border-slate-200/90 rounded-full shadow-sm select-none ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full font-montserrat text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
          language === 'en'
            ? 'bg-amber-400 text-slate-950 shadow-sm font-black scale-105'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1.5 rounded-full font-montserrat text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
          language === 'hi'
            ? 'bg-amber-400 text-slate-950 shadow-sm font-black scale-105'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="हिन्दी में बदलें"
      >
        <span>🇮🇳</span>
        <span>HI</span>
      </button>
    </div>
  )
}

export default LanguageSelector
