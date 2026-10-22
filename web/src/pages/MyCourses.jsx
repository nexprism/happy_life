import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyEnrollments } from '../redux/slices/enrollmentSlice'
import { fetchSettings } from '../redux/slices/configSlice'
import { useLanguage } from '../context/LanguageContext'

import DashboardLoading from '../components/dashboard/DashboardLoading'

const MyCourses = () => {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { enrollments, loading, error } = useSelector((state) => state.enrollment)
  const { settings } = useSelector((state) => state.config)
  const [activeFilter, setActiveFilter] = useState('ALL COURSES')
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchMyEnrollments())
    dispatch(fetchSettings())
  }, [dispatch])

  // Filter Logic
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      if (!item.course) return false // Hide legacy/deleted courses from curriculum view
      const progress = item.course?.overallProgress ?? item.progressPercentage ?? 0
      const isCompleted = item.iscompleted || progress >= 100
      if (activeFilter === 'ALL COURSES') return true
      if (activeFilter === 'IN PROGRESS') return !isCompleted
      if (activeFilter === 'COMPLETED') return isCompleted
      return true
    })
  }, [enrollments, activeFilter])

  // Statistics
  const activeCount = useMemo(() => enrollments.filter(item => item.status === 'active' && item.course).length, [enrollments])
  const avgProgress = useMemo(() => {
    const valid = enrollments.filter(item => item.course)
    return valid.length > 0 
      ? Math.round(valid.reduce((acc, item) => acc + (item.course?.overallProgress ?? item.progressPercentage ?? 0), 0) / valid.length) 
      : 0
  }, [enrollments])

  useLayoutEffect(() => {
    if (loading) return

    // Archival Reveal Sequence
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } })
      
      tl.fromTo('.curriculum-header', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.2)
      tl.fromTo('.filter-bar', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=0.8')
      tl.fromTo('.course-card', { y: 40, autoAlpha: 0, rotateX: -4 }, { y: 0, autoAlpha: 1, rotateX: 0, stagger: 0.1 }, '-=0.6')
    })

    return () => ctx.revert()
  }, [loading, activeFilter])

  return (
    <div className="min-h-screen bg-slate-50 relative pb-16">
      <DashboardHeader />
      
      <main className="pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          {/* CURRICULUM DOSSIER HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-8 curriculum-header opacity-0 invisible">
            <div className="space-y-2">
               <p className="font-montserrat text-xs text-amber-800 uppercase tracking-[0.4em] font-black">{t('continuingEducation')}</p>
               <h1 className="font-montserrat text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                   {t('myCurriculum')}
               </h1>
            </div>
            
            <div className="flex gap-8 md:gap-16 items-center self-end md:self-auto">
               <div className="text-right group relative">
                  <p className="font-montserrat text-xs text-slate-500 uppercase tracking-[0.3em] mb-1 font-bold">{t('activeCoursesLabel')}</p>
                  <p className="font-montserrat text-3xl md:text-5xl text-slate-900 leading-none font-medium tracking-tighter">
                     {activeCount < 10 ? `0${activeCount}` : activeCount}
                  </p>
               </div>
               <div className="text-right group relative">
                  <p className="font-montserrat text-xs text-slate-500 uppercase tracking-[0.3em] mb-1 font-bold">{t('completionRateLabel')}</p>
                  <p className="font-montserrat text-3xl md:text-5xl text-slate-900 leading-none font-medium tracking-tighter">{avgProgress}<span className="text-amber-600">%</span></p>
               </div>
            </div>
          </div>

          {/* WHATSAPP COMMUNITY BANNER FOR ENROLLED STUDENTS */}
          {enrollments.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 md:p-6 shadow-md border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner">
                     <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                     </svg>
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <h3 className="font-montserrat font-bold text-base md:text-lg tracking-tight">Student WhatsApp Community</h3>
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-100 rounded-full border border-white/20">Official Batch Group</span>
                     </div>
                     <p className="text-xs text-emerald-100 mt-1 max-w-xl font-normal leading-relaxed">
                        Join your course community for live class alerts, direct mentor discussions, study resources, and batch updates.
                     </p>
                  </div>
               </div>

               <a
                  href={settings?.whatsappCommunityLink || 'https://chat.whatsapp.com/invite'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 self-stretch sm:self-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 px-5 py-3 rounded-xl font-bold text-xs md:text-sm tracking-wide shadow-md hover:shadow-lg transition-all"
               >
                  <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                     <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Join Community</span>
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
               </a>
            </div>
          )}

          {/* TACTICAL FILTER BAR */}
          <div className="filter-bar flex flex-col md:flex-row justify-between items-center py-4 border-y border-slate-200/80 gap-6 opacity-0 invisible">
             <div className="relative group w-full md:w-auto flex items-center">
                <div className="relative flex-1 md:w-80 group">
                  <input 
                    type="text" 
                    placeholder={t('searchArchive')} 
                    className="bg-white border border-slate-200 focus:border-amber-500 outline-none font-montserrat text-xs text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-3 w-full tracking-[0.15em] uppercase transition-all duration-300 rounded-l-xl"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <button className="bg-amber-100 border border-amber-300 border-l-0 px-6 py-3 font-montserrat text-xs font-black text-amber-900 uppercase tracking-widest hover:bg-amber-400 hover:text-slate-950 transition-all duration-300 rounded-r-xl">
                  {t('searchBtn')}
                </button>
             </div>
             
             <div className="w-full md:w-auto overflow-x-auto no-scrollbar scrollbar-hide">
                <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 border border-slate-200/80 rounded-2xl min-w-max md:min-w-0">
                   {[
                     { id: 'ALL COURSES', label: t('allCourses') },
                     { id: 'IN PROGRESS', label: t('inProgress') },
                     { id: 'COMPLETED', label: t('completed') },
                     { id: 'WISHLIST', label: t('wishlist') }
                   ].map(({ id, label }) => (
                      <button 
                        key={id}
                        onClick={() => setActiveFilter(id)}
                        className={`font-montserrat text-xs font-black uppercase tracking-[0.2em] transition-all relative px-5 py-2.5 rounded-xl whitespace-nowrap
                          ${activeFilter === id ? 'text-slate-950 bg-accent shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
                      >
                         {label}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* ARCHIVAL GRID FLOW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px] relative">
             {loading && (
                <div className="col-span-full">
                   <DashboardLoading />
                </div>
             )}

             {!loading && filteredEnrollments.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-28 space-y-4">
                   <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a4.5 4.5 0 000 9h5a4.5 4.5 0 010 9H6" /></svg>
                   </div>
                   <p className="font-montserrat text-xs text-slate-600 font-bold uppercase tracking-[0.3em]">No Active Modules Found in Archive</p>
                </div>
             )}

             {filteredEnrollments.map((item, i) => (
                <div key={item._id || i} className="course-card group bg-white border border-slate-200/80 transition-all duration-500 relative overflow-hidden opacity-0 invisible hover:border-amber-400 rounded-2xl shadow-sm hover:shadow-md flex flex-col min-h-[540px]">
                   
                   {/* 1. Image Section */}
                   <div className="w-full aspect-[16/10] relative overflow-hidden border-b border-slate-100 shrink-0">
                      <img 
                        src={(() => {
                            const thumb = item.course?.thumbnail;
                            if (!thumb) return '/news_placeholder.png';
                            if (thumb.startsWith('http')) return thumb;
                            const rawBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                            const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                            return `${baseUrl}${thumb.startsWith('/') ? '' : '/'}${thumb}`;
                        })()} 
                        alt={item.course?.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                      />
                   </div>
 
                   {/* 2. Text Content */}
                   <div className="p-7 flex flex-col flex-grow space-y-6 z-10 relative">
                      <div className="space-y-4">
                         {/* Status Badge */}
                         {(() => {
                            const courseProgress = Math.min(100, Math.max(0, Math.round(item.course?.overallProgress ?? item.progressPercentage ?? 0)))
                            const isCompleted = item.iscompleted || courseProgress >= 100
                            return (
                               <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border ${isCompleted ? 'bg-green-100 border-green-300 text-green-900' : 'bg-amber-100 border-amber-300/80 text-amber-900'}`}>
                                  <span className="font-montserrat text-[10px] font-black uppercase tracking-wider leading-none">
                                     {isCompleted ? 'Completed' : 'In Progress'}
                                  </span>
                               </div>
                            )
                         })()}
  
                         <h2 className="font-montserrat text-slate-900 group-hover:text-accent duration-300 text-lg sm:text-xl lg:text-[clamp(1.15rem,1.35vw,1.45rem)] font-bold tracking-tight leading-snug transition-colors break-words min-h-[3rem] flex items-center">
                            {item.course?.title}
                         </h2>
  
                         {/* Metadata Grid */}
                         <div className="grid grid-cols-1 gap-y-3 pt-1">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600">
                               <div className="flex items-center gap-2">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  <span className="font-montserrat text-[10px] font-bold tracking-widest uppercase">
                                     ENROLLED: {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : 'N/A'}
                                  </span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                                  <span className="font-montserrat text-[10px] font-bold tracking-widest uppercase">{item.course?.difficulty || 'Medium'}</span>
                               </div>
                            </div>
 
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                               <div className="flex items-center gap-2 text-red-600">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                                  <span className="font-montserrat text-[10px] font-bold tracking-widest uppercase truncate max-w-[160px]">
                                     EXPIRES: {item.accessExpiry ? new Date(item.accessExpiry).toLocaleDateString() : 'LIFETIME'}
                                  </span>
                               </div>
                            </div>
 
                            <div className="flex items-center gap-2 text-slate-800">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                               <span className="font-montserrat text-[10px] font-bold tracking-widest uppercase">STATUS: {item.status}</span>
                            </div>
                         </div>
                      </div>
  
                      {/* Progress Area */}
                      {(() => {
                         const courseProgress = Math.min(100, Math.max(0, Math.round(item.course?.overallProgress ?? item.progressPercentage ?? 0)))
                         return (
                            <div className="space-y-2 pt-2 mt-auto">
                               <div className="flex justify-between items-center font-montserrat text-xs font-bold tracking-widest uppercase">
                                  <span className="text-slate-500">Progress</span>
                                  <span className="text-slate-900 font-black">{courseProgress}%</span>
                               </div>
                               <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                                  <div 
                                     className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-1000 ease-out rounded-full" 
                                     style={{ width: `${courseProgress}%` }} 
                                  />
                               </div>
                            </div>
                         )
                      })()}
  
                      {/* Action Link */}
                      <div className="pt-2">
                         <button 
                            onClick={() => navigate(`/dashboard/course/${item.courseId || item.course?._id || item._id}`)}
                            className="w-full py-3.5 bg-accent text-slate-950 font-montserrat text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all rounded-full shadow-accent-soft text-center"
                         >
                            Continue Learning
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>

        </div>
      </main>
    </div>
  )
}

export default MyCourses
