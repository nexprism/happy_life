import React from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../../context/LanguageContext'

const DashboardHero = () => {
  const { user } = useSelector(state => state.auth)
  const { data: dashData } = useSelector(state => state.dashboard)
  const { t } = useLanguage()
  
  const displayName = dashData?.profile?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Student'
  
  const activeCourses = dashData?.activeCourses || []
  const completionRate = activeCourses.length > 0 
    ? Math.round(activeCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / activeCourses.length)
    : (dashData?.profile?.stats?.completionRate || 0)

  const currentXP = dashData?.profile?.stats?.xp || 0
  const currentLevel = dashData?.profile?.stats?.level || (currentXP >= 5000 ? 'Expert' : currentXP >= 1500 ? 'Advanced' : currentXP >= 500 ? 'Intermediate' : 'Beginner')
  
  const circumference = 2 * Math.PI * 35; // radius 35
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, completionRate)) / 100) * circumference;

  return (
    <div className="relative h-full min-h-[360px] p-8 md:p-10 border border-slate-200/80 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between group">
      
      {/* Top Section: Header & Progress Ring */}
      <div className="flex justify-between items-center z-10">
         <div className="flex items-center gap-3 px-3.5 py-1 bg-amber-100 border border-amber-300 rounded-full">
            <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
            <span className="font-montserrat text-[10px] text-amber-900 font-black uppercase tracking-wider">{t('systemActive')}</span>
         </div>
         
         {/* Circular Progress Ring */}
         <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full rotate-[-90deg]">
               <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="6" />
               <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={2 * Math.PI * 35} strokeDashoffset={2 * Math.PI * 35 - (completionRate / 100) * 2 * Math.PI * 35} className="text-amber-500 transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
               <span className="font-montserrat text-base font-black text-slate-900">{completionRate}%</span>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3 my-6 z-10 relative">
         <h1 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            {t('welcomeHello')}, <span className="font-black text-amber-800">{displayName}</span>
         </h1>
         <p className="font-montserrat text-xs md:text-sm text-slate-600 max-w-md font-medium leading-relaxed">
            {t('onTrack')}
         </p>
      </div>

      {/* Bottom Stats Ribbon */}
      <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 md:gap-10 z-10">
         <div>
            <span className="font-montserrat text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-1">{t('currentXP')}</span>
            <span className="font-montserrat text-xl font-black text-slate-900">{currentXP} XP</span>
         </div>
         <div className="h-8 w-[1px] bg-slate-200" />
         <div>
            <span className="font-montserrat text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-1">{t('carrierLevel')}</span>
            <span className="font-montserrat text-xl font-black text-amber-700">{currentLevel}</span>
         </div>
      </div>
    </div>
  )
}

export default DashboardHero
