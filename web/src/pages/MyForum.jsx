import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyThreads } from '../redux/slices/forumSlice'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

import DashboardLoading from '../components/dashboard/DashboardLoading'

const MyForum = () => {
  const containerRef = useRef(null)
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { myThreads, myLoading, myTotal } = useSelector((state) => state.forum)

  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(fetchMyThreads())
  }, [dispatch])

  useEffect(() => {
    if (myLoading) return

    const ctx = gsap.context(() => {
        gsap.fromTo('.forum-reveal',
          { y: 20, autoAlpha: 0 },
          { 
            y: 0, 
            autoAlpha: 1, 
            duration: 0.6, 
            ease: 'power2.out', 
            stagger: 0.1,
            delay: 0.2
          }
        )
      }, containerRef)
      return () => ctx.revert()
  }, [myLoading, myThreads.length])

  const timeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 relative selection:bg-accent/30 overflow-x-clip pb-16">
      <DashboardHeader />
      
      <main className="pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          {/* Page Header */}
          <div className="flex flex-col gap-2 forum-reveal opacity-0">
            <div className="flex items-center gap-4">
              <h1 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('myDiscourse') || 'My Discourse'}</h1>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
            <p className="font-montserrat text-xs text-amber-800 uppercase tracking-[0.4em] font-black">{t('discourseSub') || 'Archive of your community contributions and topics'}</p>
          </div>

          {/* Stats Protocol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 forum-reveal opacity-0">
            <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm flex flex-col gap-2 group hover:border-amber-300 transition-all">
               <span className="font-montserrat text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">{t('totalThreads') || 'Total Threads'}</span>
               <span className="font-montserrat text-4xl text-slate-900 font-bold tracking-tight">{myTotal}</span>
            </div>
            <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm flex flex-col gap-2 group hover:border-amber-300 transition-all">
               <span className="font-montserrat text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">{t('engagement') || 'Engagement'}</span>
               <span className="font-montserrat text-4xl text-slate-900 font-bold tracking-tight">
                  {myThreads.reduce((acc, thread) => acc + (thread.likes?.length || 0), 0)} <span className="text-xs font-montserrat text-amber-700 font-black ml-2 uppercase">{t('likes') || 'likes'}</span>
               </span>
            </div>
            <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm flex flex-col gap-2 group hover:border-amber-300 transition-all">
               <span className="font-montserrat text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">{t('calibrations') || 'Calibrations'}</span>
               <span className="font-montserrat text-4xl text-slate-900 font-bold tracking-tight">
                  {myThreads.reduce((acc, thread) => acc + (thread.replies?.length || 0), 0)} <span className="text-xs font-montserrat text-amber-700 font-black ml-2 uppercase">{t('replies') || 'replies'}</span>
               </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {myLoading && myThreads.length === 0 ? (
              <DashboardLoading />
            ) : myThreads.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {myThreads.map((thread) => (
                  <div key={thread._id} className="forum-reveal opacity-0 bg-white border border-slate-200/80 hover:border-amber-400 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                     
                     <div className="flex flex-col gap-5 relative z-10">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="font-montserrat text-[10px] text-amber-900 font-black tracking-wider px-3.5 py-1 rounded-full border border-amber-300 bg-amber-100 uppercase">
                                 {thread.tags?.[0]?.toUpperCase() || '#GENERAL'}
                              </span>
                              <span className="font-montserrat text-xs text-slate-500 uppercase tracking-wider font-medium">{timeAgo(thread.createdAt)}</span>
                           </div>
                           {thread.isPinned && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full font-montserrat text-[10px] font-black uppercase">
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10h-8V2l-7 12h5v8l7-12h-3z"/></svg>
                                 Pinned
                              </div>
                           )}
                        </div>

                        <div className="space-y-2.5">
                           <h2 className="font-montserrat text-slate-900 group-hover:text-accent text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-snug transition-colors">
                              {thread.title}
                           </h2>
                           <p className="font-montserrat text-xs text-slate-600 leading-relaxed max-w-4xl line-clamp-2 font-medium">
                              {thread.content}
                           </p>
                        </div>

                        <div className="flex items-center gap-6 pt-5 border-t border-slate-100">
                           <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-600"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              <span className="font-montserrat text-xs font-bold">{thread.likes?.length || 0} {t('likes') || 'Likes'}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              <span className="font-montserrat text-xs font-bold">{thread.replies?.length || 0} {t('replies') || 'Replies'}</span>
                           </div>
                           <Link to={`/dashboard/forum`} className="ml-auto font-montserrat text-xs text-slate-950 font-black uppercase tracking-wider bg-accent hover:scale-105 px-5 py-2 rounded-full shadow-accent-soft transition-all">
                              {t('viewDetails') || 'View Discourse'}
                           </Link>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm forum-reveal opacity-0">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="font-montserrat text-2xl text-slate-700 font-bold">{t('noContributionsFound') || 'No contributions found'}</h3>
                  <p className="font-montserrat text-xs text-slate-500 uppercase tracking-widest font-medium">{t('noThreadsStarted') || "You haven't started any forum threads yet"}</p>
                </div>
                <Link 
                  to="/dashboard/forum"
                  className="mt-2 font-montserrat text-xs text-slate-950 font-black uppercase tracking-[0.3em] bg-accent px-8 py-3 rounded-full shadow-accent-soft hover:scale-105 transition-all"
                >
                  {t('startNewTopic') || 'Join the conversation'}
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default MyForum
