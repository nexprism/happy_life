import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobById, clearCurrentJob } from '../redux/slices/jobSlice'
import { gsap } from 'gsap'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import CreateJobModal from '../components/dashboard/CreateJobModal'
import { formatBudget } from '../utils/formatBudget'

const JobDetail = () => {
  // Custom animations for technical badges
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes gradient-x {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 3s ease infinite;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentJob, loading } = useSelector((state) => state.jobs)
  const { user } = useSelector((state) => state.auth)
  const containerRef = useRef(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)


  useEffect(() => {
    dispatch(fetchJobById(id))
    return () => dispatch(clearCurrentJob())
  }, [id, dispatch])

  useEffect(() => {
    if (currentJob && !loading) {
      const ctx = gsap.context(() => {
        // Content reveal
        gsap.from('.job-detail-reveal', {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        })
      }, containerRef)
      return () => ctx.revert()
    }
  }, [currentJob, loading])

  if (loading || !currentJob) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    )
  }

  const isOwner = user?._id === currentJob?.createdBy?._id

  return (

    <div ref={containerRef} className="min-h-screen bg-dark selection:bg-accent/30 relative">
      
      <DashboardHeader className="relative z-10" />

      <main className="pt-24 pb-4 px-4 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-description hover:text-accent transition-colors mb-12 group job-detail-reveal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="font-montserrat text-[10px] font-medium uppercase tracking-widest">Back to Jobs</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4 job-detail-reveal">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-accent/10 border border-accent/20 font-montserrat text-[9px] text-accent uppercase tracking-widest">
                  {currentJob.category?.replace('-', ' ')}
                </span>
                <span className={`px-3 py-1 border text-[9px] font-montserrat uppercase tracking-widest ${currentJob.isAdminApproved ? 'border-accent/40 text-accent bg-accent/5' : 'border-white/10 text-description/80 bg-white/5'}`}>
                  {currentJob.isAdminApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <h1 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                {currentJob.title}
              </h1>
              <div className="flex items-center gap-4 border-t border-white/5">
                 {/* <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-montserrat text-normal text-sm font-bold">
                   {currentJob.createdBy?.fullName?.substring(0, 2).toUpperCase() || '??'}
                 </div> */}
                 <div className="flex flex-col">
                   <span className="font-montserrat text-[10px] text-description uppercase ">Posted by <span className="font-montserrat text-lg text-normal pl-2">{currentJob.createdBy?.fullName || 'Anonymous'}</span></span>
                   
                 </div>
              </div>
            </div>

            <div className="space-y-8 job-detail-reveal mb-20">
              <h3 className="font-montserrat text-lg font-medium text-light tracking-[0.2em] border-l-4 border-accent pl-6">
                Job Description
              </h3>
              <div className="font-montserrat text-normal/80 text-base leading-relaxed whitespace-pre-wrap max-w-none prose prose-invert">
                {currentJob.description}
              </div>
            </div>

            {/* Highlighted Skills - Technical Badge Cluster */}
            <div className="space-y-8 job-detail-reveal">
               <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <h3 className="font-montserrat text-lg font-medium text-light tracking-[0.2em] border-l-4 border-accent pl-6 uppercase">
                    Skill set
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="font-montserrat text-[9px] text-accent uppercase tracking-widest font-black">Verified Competencies</span>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4">
                 {currentJob.skillsRequired?.map((skill, index) => (
                   <div 
                     key={index}
                     className="group relative px-6 py-4 bg-white/[0.03] border border-white/10 hover:border-accent/40 transition-all duration-300 flex items-center gap-4 overflow-hidden"
                   >
                     {/* Internal Animated Glow */}
                     <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r from-accent via-transparent to-accent animate-gradient-x" />
                     
                     <span className="font-montserrat text-[10px] text-accent font-black tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                       SKL-{index + 1 < 10 ? `0${index + 1}` : index + 1}
                     </span>

                     <span className="font-montserrat text-[13px] font-medium text-normal uppercase tracking-wider group-hover:text-accent transition-colors">
                       {skill}
                     </span>

                     {/* Decorative Technical Line */}
                     <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent group-hover:w-full transition-all duration-500" />
                   </div>
                 ))}
               </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 lg:sticky lg:top-18 h-fit self-start">
            <div className="bg-white/[0.02] border border-white/5 job-detail-reveal">
              {/* Summary Header */}
              <div className="bg-white/5 px-8 py-6 border-b border-white/5">
                <h3 className="font-montserrat text-lg font-medium text-normal tracking-[0.2em] uppercase">
                  Job Summary
                </h3>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  {/* Summary Item */}
                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-accent/10 flex items-center justify-center border border-accent/20 text-accent group-hover:bg-accent group-hover:text-dark transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22m5-18H8a3 3 0 000 6h8a3 3 0 010 6H7"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Budget</span>
                      <span className="font-montserrat text-sm font-medium text-normal">{formatBudget(currentJob.budget)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 text-normal group-hover:border-accent/40 transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Experience</span>
                      <span className="font-montserrat text-sm font-medium text-normal uppercase">{currentJob.experienceLevel || 'Intermediate'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 text-normal group-hover:border-accent/40 transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Job Type</span>
                      <span className="font-montserrat text-sm font-medium text-normal uppercase">{currentJob.mode}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 text-normal group-hover:border-accent/40 transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Duration</span>
                      <span className="font-montserrat text-sm font-medium text-normal">{currentJob.estimatedDuration?.value} {currentJob.estimatedDuration?.unit || 'months'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 text-normal group-hover:border-accent/40 transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Location</span>
                      <span className="font-montserrat text-sm font-medium text-normal uppercase">{currentJob.location?.type || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group">
                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 text-normal group-hover:border-accent/40 transition-all duration-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-montserrat text-[9px] text-description uppercase tracking-widest">Category</span>
                      <span className="font-montserrat text-sm font-medium text-normal uppercase">{currentJob.category?.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                {isOwner ? (
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full bg-white/5 border !text-accent border-white/10 text-normal py-5 font-montserrat text-[12px] font-medium uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Edit Job Post
                  </button>
                ) : (
                  <button className="w-full bg-accent text-dark py-5 font-montserrat text-[12px] font-medium uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_20px_40px_rgba(var(--accent-rgb),0.2)]">
                    Apply for this job
                  </button>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>

      <CreateJobModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editData={currentJob}
      />
    </div>
  )
}

export default JobDetail
