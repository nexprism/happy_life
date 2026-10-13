import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

const ProfileTabs = ({ activeTab, setActiveTab, compact = true }) => {
  const { t } = useLanguage()
  const tabs = [
    { id: 'profile', name: t('profile') || 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { id: 'security', name: t('security') || 'Security', icon: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-5-4.5-5-4.5s-3 2.9-5 4.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z' },
    { id: 'academic', name: t('academic') || 'Academic', icon: 'M12 2L2 7l10 5l10-5l-10-5z M2 17l10 5l10-5 M2 12l10 5l10-5' },
  ]

  return (
    <div className="flex w-full gap-3 overflow-x-auto no-scrollbar p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 py-3.5 px-6 transition-all duration-300 relative overflow-hidden rounded-xl font-montserrat text-xs font-black uppercase tracking-[0.3em]
            ${activeTab === tab.id 
              ? 'bg-accent text-slate-950 shadow-accent-soft scale-[1.02]' 
              : 'bg-slate-100 border border-slate-200/80 text-slate-600 hover:bg-slate-200/60 hover:text-slate-950'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10">
            <path d={tab.icon} />
          </svg>
          <span className="relative z-10 whitespace-nowrap">
            {tab.name}
          </span>
        </button>
      ))}
    </div>
  )
}

export default ProfileTabs
