import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { fetchMyJobs } from '../redux/slices/jobSlice'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardLoading from '../components/dashboard/DashboardLoading'
import JobPostCard from '../components/dashboard/JobPostCard'
import CreateJobModal from '../components/dashboard/CreateJobModal'
import { useLanguage } from '../context/LanguageContext'

const DashboardJobPosts = () => {
  const containerRef = useRef(null)
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { myJobs, loading, total } = useSelector((state) => state.jobs)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    dispatch(fetchMyJobs())
  }, [dispatch])

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo('.job-dash-reveal',
        { y: 20, autoAlpha: 0 },
        { 
          y: 0, 
          autoAlpha: 1, 
          duration: 0.6, 
          ease: 'power2.out', 
          stagger: 0.1,
          delay: 0.2,
          overwrite: 'auto'
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [loading, myJobs.length])


  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 relative selection:bg-amber-400/30 overflow-x-clip">
      <DashboardHeader />
      
      <main className="pt-24 pb-16 px-4 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 job-dash-reveal opacity-0">
            <div className="flex flex-col gap-2">
              <h1 className="font-montserrat text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('jobPostings')}</h1>
              <p className="font-montserrat text-[12px] font-bold text-amber-800 uppercase tracking-[0.4em]">{t('manageJobOpps')}</p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-400 text-slate-950 px-8 py-4 rounded-xl font-montserrat text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              {t('createNewPost')}
            </button>
          </div>

          {/* Stats Protocol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 job-dash-reveal opacity-0">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col gap-2 group hover:border-amber-400 shadow-sm transition-all">
               <span className="font-montserrat text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] group-hover:text-amber-700 transition-colors">{t('totalPostsLabel')}</span>
               <span className="font-montserrat text-4xl text-slate-900 tracking-tighter">{total}</span>
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col gap-2 group hover:border-amber-400 shadow-sm transition-all">
               <span className="font-montserrat text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] group-hover:text-amber-700 transition-colors">{t('activeLeadsLabel')}</span>
               <span className="font-montserrat text-4xl text-slate-900 tracking-tighter">0</span>
            </div>
            <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col gap-2 group hover:border-amber-400 shadow-sm transition-all">
               <span className="font-montserrat text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] group-hover:text-amber-700 transition-colors">{t('totalProposalsLabel')}</span>
               <span className="font-montserrat text-4xl text-slate-900 tracking-tighter">0</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 gap-8">
            <div className="flex items-center gap-4 mb-4 job-dash-reveal opacity-0">
              <h2 className="font-montserrat font-black text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('myPublications')}</h2>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

          {loading && myJobs.length === 0 ? (
            <DashboardLoading />
          ) : myJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {myJobs.map((job) => (
                <div key={job._id} className="job-dash-reveal opacity-0">
                  <JobPostCard job={job} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center gap-6 border border-dashed border-slate-200 rounded-2xl bg-white job-dash-reveal opacity-0">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="font-montserrat text-2xl text-slate-600 font-bold">No publications found</h3>
                <p className="font-montserrat text-[10px] text-slate-400 uppercase tracking-widest">You haven't posted any jobs yet</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-2 font-montserrat text-xs text-amber-900 font-black uppercase tracking-[0.2em] bg-amber-100 border border-amber-300 px-8 py-3 rounded-xl hover:bg-amber-400 hover:text-slate-950 transition-all shadow-sm"
              >
                Create your first post
              </button>
            </div>
          )}
        </div>
        </div>
      </main>

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default DashboardJobPosts
