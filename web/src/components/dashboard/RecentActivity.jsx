






import React from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../../context/LanguageContext'

const RecentActivity = () => {
  const { data: dashData } = useSelector(state => state.dashboard)
  const { t } = useLanguage()
  
  // Map API data to activity format
  const submissions = (dashData?.recentSubmissions || []).map(s => ({
    id: `sub-${s.id}`,
    type: 'quiz',
    title: `Submitted: ${s.assignmentTitle}`,
    meta: s.status.toUpperCase(),
    displayTime: new Date(s.submittedAt).toLocaleDateString(),
    rawTime: new Date(s.submittedAt).getTime()
  }))

  const news = (dashData?.recentNews || []).map(n => ({
    id: `news-${n._id}`,
    type: 'resource',
    title: `News: ${n.title}`,
    meta: 'READ UPDATES',
    displayTime: new Date(n.publishedAt).toLocaleDateString(),
    rawTime: new Date(n.publishedAt).getTime()
  }))

  const activityData = [...submissions, ...news].sort((a, b) => b.rawTime - a.rawTime).slice(0, 5)

  if (activityData.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('recentActivity')}</h2>
         <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block" />
         <button className="font-montserrat text-xs text-amber-800 font-black uppercase tracking-wider hover:text-amber-900 transition-colors">
            {t('auditTrail')}
         </button>
      </div>

      <div className="space-y-3">
         {activityData.map((item) => (
            <div key={item.id} className="relative bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between group hover:border-amber-400 shadow-sm transition-all duration-300">
               <div className="flex items-center gap-5 w-full md:w-auto">
                  {/* Icon Identifier */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300
                    ${item.type === 'quiz' ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                     
                     {item.type === 'quiz' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M20 6L9 17L4 12" />
                        </svg>
                     )}
                     {item.type === 'reply' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                     )}
                     {item.type === 'resource' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                           <polyline points="7 10 12 15 17 10" />
                           <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                     )}
                  </div>

                  <div className="space-y-1">
                     <h4 className="font-montserrat text-xl text-slate-900 font-bold group-hover:text-amber-600 transition-colors">
                        {item.title.split(':').map((part, i) => (
                           i === 1 ? <span key={i} className="text-amber-800 ml-1.5 font-sans text-base font-bold">{part}</span> : <span key={i}>{part}</span>
                        ))}
                     </h4>
                     <p className="font-montserrat text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        {item.meta}
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-4 text-slate-500">
                  <span className="font-montserrat text-xs font-medium uppercase tracking-wider">{item.displayTime}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}

export default RecentActivity
