import React from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../../context/LanguageContext'

const WeeklyGoals = () => {
  const { user } = useSelector(state => state.auth)
  const { data: dashData } = useSelector(state => state.dashboard)
  const { t } = useLanguage()
  
  const activeCourses = dashData?.activeCourses || []
  const percentage = activeCourses.length > 0 
    ? Math.round(activeCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / activeCourses.length)
    : (dashData?.profile?.stats?.completionRate || 0)

  const enrolledCourses = dashData?.profile?.stats?.enrolledCourses ?? dashData?.allCoursesCount ?? activeCourses.length ?? 0
  const completedCourses = dashData?.profile?.stats?.completedCourses ?? dashData?.completedCoursesCount ?? 0

  const radius = 55
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="p-8 border border-slate-200/80 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-between space-y-6 h-full relative overflow-hidden">
      
      <div className="text-center space-y-1">
         <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight">{t('weeklyGoalsTitle')}</h3>
         <p className="font-montserrat text-xs text-amber-800 uppercase tracking-widest font-black">{t('focusConsistency')}</p>
      </div>

      <div className="relative w-40 h-40 flex items-center justify-center my-2">
         <svg className="w-full h-full -rotate-90">
            {/* Background Circle */}
            <circle 
              cx="80" cy="80" r={radius} 
              stroke="#e2e8f0" strokeWidth="6" fill="none"
            />
            {/* Progress Circle */}
            <circle 
              cx="80" cy="80" r={radius} 
              stroke="currentColor" strokeWidth="6" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-amber-500 transition-all duration-1000 ease-out"
            />
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-montserrat text-3xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
            <span className="font-montserrat text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-1">{t('completed')}</span>
         </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-3 text-center border-t border-slate-100 pt-4">
         <div>
            <span className="font-montserrat text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">{t('enrolledCourses')}</span>
            <span className="font-montserrat text-lg font-black text-slate-900">{enrolledCourses}</span>
         </div>
         <div>
            <span className="font-montserrat text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">{t('completed')}</span>
            <span className="font-montserrat text-lg font-black text-amber-700">{completedCourses}</span>
         </div>
      </div>
      
      <button className="font-montserrat text-xs text-amber-800 font-black uppercase tracking-wider hover:text-amber-900 transition-colors pt-1">
        Edit Goals
      </button>
    </div>
  )
}

export default WeeklyGoals
