import React from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../../context/LanguageContext'

const TopLearners = ({ learners = [] }) => {
  const { user } = useSelector(state => state.auth)
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h4 className="font-newsreader italic text-2xl text-slate-900 font-bold tracking-tight">{t('topLearners')}</h4>
         <div className="h-[1px] w-12 bg-slate-200" />
      </div>

      <div className="space-y-2.5">
         {learners.slice(0, 5).map((learner, index) => {
            const learnerData = learner.userId || {}
            const isMe = learnerData._id === user?._id || learnerData._id === user?.id
            return (
               <div 
                 key={learnerData._id || index}
                 className={`p-4 rounded-xl border flex items-center justify-between group transition-all duration-300
                   ${isMe ? 'border-amber-400 bg-amber-50/60 shadow-sm' : 'border-slate-200/80 bg-white hover:border-amber-300'}`}
               >
                  <div className="flex items-center gap-4">
                     <span className={`font-montserrat text-xs tracking-wider font-black ${isMe ? 'text-amber-800' : 'text-slate-400'}`}>
                       {(index + 1).toString().padStart(2, '0')}
                     </span>
                     
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-montserrat text-xs font-black
                          ${isMe ? 'bg-accent text-slate-950 shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                           {learnerData.fullName?.[0] || 'U'}
                        </div>
                        <span className={`font-newsreader italic text-base font-bold ${isMe ? 'text-slate-900' : 'text-slate-700'}`}>
                           {learnerData.fullName} {isMe ? '(You)' : ''}
                        </span>
                     </div>
                  </div>

                  <span className={`font-jetbrains text-xs font-black tracking-wider ${isMe ? 'text-amber-900' : 'text-slate-600'}`}>
                    {learner.xp.toLocaleString()} XP
                  </span>
               </div>
            )
         })}
      </div>
    </div>
  )
}

const UpcomingDeadlines = ({ assignments = [] }) => {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h4 className="font-newsreader italic text-2xl text-slate-900 font-bold tracking-tight">{t('upcomingDeadlines')}</h4>
         <div className="h-[1px] w-12 bg-slate-200" />
      </div>

      <div className="space-y-3">
         {assignments.length === 0 ? (
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center">
              <p className="font-jetbrains text-xs text-slate-500 uppercase tracking-widest font-medium">{t('noPendingAssignments')}</p>
            </div>
         ) : (
            assignments.slice(0, 3).map((assignment) => (
               <div key={assignment.id} className="p-5 border border-slate-200/80 bg-white rounded-2xl space-y-2 relative overflow-hidden group hover:border-amber-400 transition-all shadow-sm">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="font-jetbrains text-[10px] text-amber-900 font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-100">{t('pending')}</span>
                     </div>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                     </svg>
                  </div>
                  <h5 className="font-newsreader italic text-lg text-slate-900 font-bold group-hover:text-amber-600 transition-colors">{assignment.title}</h5>
                  <p className="font-jetbrains text-[10px] text-slate-500 uppercase tracking-wider font-medium">{t('submissionRequired')}</p>
               </div>
            ))
         )}
      </div>
    </div>
  )
}

const DashboardSidebar = () => {
  const { data: dashData } = useSelector(state => state.dashboard)
  const { t } = useLanguage()
  const stats = dashData?.profile?.stats || {}

  return (
    <div className="space-y-8 w-full">
      
      {/* Quick Stats Grid - 4 Full Width Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="p-6 border border-slate-200/80 bg-white rounded-2xl text-center space-y-2 group hover:border-amber-400 transition-all shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-amber-600 transition-colors">
               <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" />
               <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="font-newsreader italic text-3xl md:text-4xl text-slate-900 font-bold leading-none">
              {dashData?.activeCoursesCount ?? stats.activeCourses ?? stats.enrolledCourses ?? (dashData?.activeCourses?.length || 0)}
            </p>
            <p className="font-jetbrains text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t('activeCoursesCount')}</p>
         </div>

         <div className="p-6 border border-slate-200/80 bg-white rounded-2xl text-center space-y-2 group hover:border-amber-400 transition-all shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-amber-600 transition-colors">
               <circle cx="12" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
               <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="font-newsreader italic text-3xl md:text-4xl text-slate-900 font-bold leading-none">
               {dashData?.certificatesCount ?? stats.certificatesEarned ?? '0'}
            </p>
            <p className="font-jetbrains text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t('certificatesEarned')}</p>
         </div>

         <div className="p-6 border border-slate-200/80 bg-white rounded-2xl text-center space-y-2 group hover:border-amber-400 transition-all shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-amber-600 transition-colors">
               <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-newsreader italic text-3xl md:text-4xl text-slate-900 font-bold leading-none">
               {(stats.xp || 0).toLocaleString()}
            </p>
            <p className="font-jetbrains text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t('totalXP')}</p>
         </div>

         <div className="p-6 border border-slate-200/80 bg-white rounded-2xl text-center space-y-2 group hover:border-amber-400 transition-all shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-amber-600 transition-colors">
               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="font-newsreader italic text-3xl md:text-4xl text-slate-900 font-bold leading-none">
               {stats.completedLessons ?? stats.completedCourses ?? dashData?.completedCoursesCount ?? '0'}
            </p>
            <p className="font-jetbrains text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t('completedModules')}</p>
         </div>
      </div>

      {/* Top Learners & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <TopLearners learners={dashData?.topLearners || []} />
         <UpcomingDeadlines assignments={dashData?.upcomingAssignments || []} />
      </div>

    </div>
  )
}

export default DashboardSidebar
