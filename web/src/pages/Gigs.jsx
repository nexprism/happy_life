import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import gsap from 'gsap'
import { fetchExploreJobs } from '../redux/slices/jobSlice'
import { useLanguage } from '../context/LanguageContext'
import { formatBudget } from '../utils/formatBudget'

const GigCard = ({ gig }) => {
  const cardRef = useRef(null)
  const { t } = useLanguage()

  // Use a fallback image if none exists
  const displayImage = gig.image || gig.thumbnail || '/gig_motion.png';
  const displayIcon = gig.icon || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" /><path d="M12 22.08V12" />
    </svg>
  );

  // Helper to strictly ensure we return a string, never an object or raw JSON
  const safeRender = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && (parsed.min !== undefined || parsed.max !== undefined || parsed.currency !== undefined)) {
            return formatBudget(parsed);
          }
        } catch (e) {}
      }
      return val;
    }
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return val.map(safeRender).join(', ');
    if (typeof val === 'object') {
      if (val.min !== undefined || val.max !== undefined || val.currency !== undefined) {
        return formatBudget(val);
      }
      const preferred = val.address || val.type || val.name || val.label || val.title || val.value;
      if (preferred && typeof preferred !== 'object') return String(preferred);
      if (preferred && typeof preferred === 'object') return safeRender(preferred);
      try { return JSON.stringify(val); } catch (e) { return '[Data]'; }
    }
    return String(val);
  };

  return (
    <div
      ref={cardRef}
      className="gig-reveal flex flex-col group cursor-pointer bg-card border border-border hover:border-accent p-6 rounded-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full"
    >
      {/* Square Image Container */}
      <div className="relative aspect-square w-full mb-6 overflow-hidden bg-black/5 dark:bg-white/5 rounded-none border border-border">
        <img
          src={displayImage}
          alt={gig.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badge Icon */}
        <div className="absolute top-4 left-4 w-10 h-10 bg-card/90 backdrop-blur-md border border-border rounded-none flex items-center justify-center text-accent shadow-sm">
          {displayIcon}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 flex-grow justify-between">
        <div className="flex flex-col gap-3">
          <h3 className="font-newsreader italic text-2xl md:text-3xl leading-snug text-normal font-bold transition-colors group-hover:text-accent">
            {safeRender(gig.title)}
          </h3>

          {/* Structured Specifics Grid */}
          <div className="mt-2 bg-black/5 dark:bg-white/5 border border-border p-4 rounded-none space-y-2">
            {[
              { label: t('jobRole') || 'Role', value: safeRender(gig.role || gig.position || 'Specialist') },
              { label: t('jobLocation') || 'Location', value: safeRender(gig.location || gig.locationDetails || 'Remote') },
              { label: t('jobReportTo') || 'Reports To', value: safeRender(gig.reportTo || 'Manager') },
              { label: t('jobWorkingDays') || 'Days', value: safeRender(gig.workingDays || 'Mon to Fri') },
              { label: t('jobTimings') || 'Timings', value: safeRender(gig.timings || 'Flexible') }
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-baseline">
                <span className="font-jetbrains text-xs text-description font-bold uppercase tracking-wider shrink-0">{item.label}:</span>
                <span className="font-jetbrains text-xs text-normal font-medium tracking-wide truncate">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-montserrat text-xs leading-relaxed text-description line-clamp-3 font-medium">
          <span className="text-accent uppercase text-[10px] tracking-wider block mb-1 font-black">{t('positionOverview') || 'POSITION OVERVIEW'}</span>
          {safeRender(gig.description)}
        </p>

        {/* Metadata Icon Row */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-description bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-none border border-border">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <span className="font-jetbrains text-xs font-bold uppercase">{safeRender(gig.type || 'Full Time')}</span>
          </div>
          <div className="flex items-center gap-2 text-description bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-none border border-border">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span className="font-jetbrains text-xs font-bold uppercase">{safeRender(gig.shift || 'Day')}</span>
          </div>
          <div className="flex items-center gap-2 text-description bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-none border border-border">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span className="font-jetbrains text-xs font-bold uppercase">{safeRender(gig.workMode || 'Remote')}</span>
          </div>
        </div>

        {/* Posted Date */}
        <div className="flex items-center gap-2 text-description">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span className="font-jetbrains text-xs font-medium">{t('postedText') || 'Posted'} {gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : 'Recently'}</span>
        </div>

        {/* Skill Tags Cloud */}
        <div className="flex flex-wrap gap-2">
          {(gig.skills || gig.tags || []).slice(0, 3).map((skill, si) => (
            <span key={si} className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-jetbrains text-[10px] font-bold uppercase tracking-wider rounded-none">
              {safeRender(skill)}
            </span>
          ))}
          {((gig.skills?.length || gig.tags?.length || 0) > 3) && (
            <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-border font-jetbrains text-[10px] text-description font-bold uppercase tracking-wider rounded-none">
              +{((gig.skills?.length || gig.tags?.length || 0) - 3)}
            </span>
          )}
        </div>

        {/* Footer Button */}
        <button className="w-full mt-2 py-3 bg-accent text-white font-montserrat text-xs font-bold tracking-widest uppercase rounded-none shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
          {t('applyNow') || 'APPLY NOW'}
          <span className="text-base">›</span>
        </button>
      </div>
    </div>
  )
}

const Gigs = () => {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { exploreJobs, loading, submitting } = useSelector(state => state.jobs)
  const [activeFilter, setActiveFilter] = useState('All Categories')
  const [selectedJob, setSelectedJob] = useState(null)
  const containerRef = useRef(null)

  const filterOptions = [
    { key: 'All Categories', label: t('categoryAll') || 'All Categories' },
    { key: 'Design & Branding', label: t('categoryDesignBranding') || 'Design & Branding' },
    { key: 'Content & Copywriting', label: t('categoryContentCopywriting') || 'Content & Copywriting' },
    { key: 'Video & Audio', label: t('categoryVideoAudio') || 'Video & Audio' },
    { key: 'Marketing & Growth', label: t('categoryMarketingGrowth') || 'Marketing & Growth' },
    { key: 'Tech & Website', label: t('categoryTechWebsite') || 'Tech & Website' },
    { key: 'Sales & Clientwork', label: t('categorySalesClientwork') || 'Sales & Clientwork' }
  ]

  useEffect(() => {
    dispatch(fetchExploreJobs({ page: 1, limit: 20, isAdminApproved: true }))
  }, [dispatch])

  const jobsList = Array.isArray(exploreJobs) ? exploreJobs : [];
  const filteredJobs = activeFilter === 'All Categories'
    ? jobsList
    : jobsList.filter(g => g.category === activeFilter || g.title?.includes(activeFilter))

  if (selectedJob) {
    return <JobDetail job={selectedJob} onBack={() => setSelectedJob(null)} submitting={submitting} dispatch={dispatch} />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-dark pt-36 pb-32 px-4 md:px-12 lg:px-20 overflow-x-clip text-normal">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-baseline gap-6 gig-header-reveal flex-wrap">
            <h1 className="font-newsreader text-4xl md:text-6xl font-extralight italic text-normal tracking-tight">
              {t('gigsTitle') || 'Open Opportunities'}
            </h1>
          </div>
          <p className="font-jetbrains text-xs text-accent uppercase tracking-[0.4em] font-bold italic mt-2">{t('gigsSubtitle') || 'Curated Roles & Remote Gigs'}</p>
        </div>

        <div className="mb-10">
          <div className="mt-6 flex items-center w-full relative">
            <div className="sticky left-0 md:relative z-20 bg-dark pr-4 md:pr-6 flex-shrink-0">
              <span className="inline-flex items-center justify-center h-[38px] font-montserrat text-[11px] bg-accent px-5 md:px-6 font-bold text-white tracking-widest uppercase whitespace-nowrap rounded-none">
                {t('filterBy') || 'FILTER BY'}
              </span>
            </div>

            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2.5 w-full pl-2 md:pl-0 pb-2 touch-pan-x">
              {filterOptions.map((filterObj) => (
                <button
                  key={filterObj.key}
                  onClick={() => setActiveFilter(filterObj.key)}
                  className={`inline-flex items-center justify-center h-[38px] whitespace-nowrap px-5 font-montserrat text-[11px] font-bold tracking-wider uppercase transition-all duration-300 rounded-none border ${activeFilter === filterObj.key
                      ? 'bg-accent border-accent text-white shadow-sm'
                      : 'bg-card text-description border-border hover:border-accent/40 hover:text-normal'
                    }`}
                >
                  {filterObj.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((gig) => (
              <div key={gig._id || gig.id} onClick={() => setSelectedJob(gig)}>
                <GigCard gig={gig} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex justify-center items-center">
              {loading ? (
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-jetbrains uppercase tracking-widest text-xs text-description font-medium">{t('noGigsFound') || 'No opportunities found'}</span>
              )}
            </div>
          )}
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar,
          [class*='overflow-x']::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .scrollbar-hide,
          [class*='overflow-x'] {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>
      </div>
    </div>
  )
}

const JobDetail = ({ job, onBack, submitting, dispatch }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedAmount: '',
    additionalInfo: ''
  })
  const [cvFile, setCvFile] = useState(null)

  const safeRender = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && (parsed.min !== undefined || parsed.max !== undefined || parsed.currency !== undefined)) {
            return formatBudget(parsed);
          }
        } catch (e) {}
      }
      return val;
    }
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return val.map(v => (typeof v === 'object' ? (v.name || v.label || safeRender(v)) : String(v))).join(', ');
    if (typeof val === 'object') {
      if (val.min !== undefined || val.max !== undefined || val.currency !== undefined) {
        return formatBudget(val);
      }
      const preferred = val.address || val.type || val.name || val.label || val.title || val.value;
      if (preferred && typeof preferred !== 'object') return String(preferred);
      try { return JSON.stringify(val); } catch (e) { return '[Data]'; }
    }
    return String(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cvFile) {
      alert('Please upload your CV');
      return;
    }
    
    const body = new FormData();
    body.append('coverLetter', formData.coverLetter);
    body.append('proposedAmount', formData.proposedAmount);
    body.append('cv', cvFile);
    body.append('additionalInfo', formData.additionalInfo);

    import('../redux/slices/jobSlice').then(m => dispatch(m.submitProposal({ jobId: job._id || job.id, formData: body })))
      .then(res => {
        if (!res.error) {
          alert('Proposal submitted successfully!');
          onBack();
        }
      });
  };

  return (
    <div className="min-h-screen bg-dark pt-36 pb-32 px-4 md:px-12 lg:px-20 animate-in fade-in duration-700 text-normal">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-accent font-jetbrains text-xs font-bold uppercase tracking-wider mb-8 hover:gap-3 transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Job Postings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-12">
          <div className="flex flex-col gap-8 bg-card border border-border p-8 rounded-none shadow-sm">
            <div className="flex flex-col gap-2">
              <h1 className="font-newsreader text-4xl md:text-5xl font-extralight italic text-normal leading-tight">{safeRender(job.title)}</h1>
              <p className="font-jetbrains text-xs text-description uppercase tracking-wider font-medium">
                Posted by Client • {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>

            <div className="relative aspect-square w-full rounded-none overflow-hidden border border-border shadow-sm bg-black/5 dark:bg-white/5">
              <img src={job.image || job.thumbnail || '/gig_motion.png'} className="w-full h-full object-cover" alt="" />
            </div>

            <div className="space-y-3">
              <h4 className="font-newsreader text-2xl italic font-bold text-normal">Position Overview</h4>
              <p className="font-montserrat text-sm text-description leading-relaxed font-medium">{safeRender(job.description)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>, label: 'Job Type', value: job.type || 'Full Time' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, label: 'Location', value: job.location || 'Remote' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, label: 'Work Mode', value: job.workMode || 'Remote' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, label: 'Budget', value: formatBudget(job.budget) },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>, label: 'Experience Level', value: job.experienceLevel || 'Expert' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, label: 'Posted', value: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 border border-border rounded-none">
                  <div className="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-none">{item.icon}</div>
                  <div>
                    <p className="font-jetbrains text-[10px] uppercase tracking-wider text-description font-bold">{item.label}</p>
                    <p className="font-montserrat font-bold text-sm text-normal">{safeRender(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-newsreader text-2xl italic font-bold text-normal">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {(job.skills || job.tags || ['Design', 'Growth', 'Strategy']).map((skill, i) => (
                  <span key={i} className="px-4 py-2 border border-border font-jetbrains text-xs font-bold text-normal uppercase tracking-wider bg-black/5 dark:bg-white/5 rounded-none">
                    {safeRender(skill)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 sticky top-36 h-fit">
            <div className="p-8 bg-card border border-border rounded-none shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-none bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </div>
                  <div>
                    <h3 className="font-newsreader text-3xl italic font-bold text-normal">Submit Your Proposal</h3>
                    <p className="font-jetbrains text-xs text-description uppercase tracking-wider font-medium">Stand out with a compelling proposal</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-jetbrains text-xs text-normal font-bold uppercase tracking-wider">Why do you think you're a good fit?</label>
                    <textarea 
                      required
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="Share your expertise..."
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-none p-4 min-h-[140px] font-montserrat text-sm text-normal focus:border-accent outline-none transition-all placeholder:text-description/60"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-jetbrains text-xs text-normal font-bold uppercase tracking-wider">Proposed Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold">₹</span>
                      <input 
                        type="number"
                        required
                        value={formData.proposedAmount}
                        onChange={(e) => setFormData({ ...formData, proposedAmount: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-none py-3 pl-10 pr-4 font-jetbrains text-sm text-normal focus:border-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-jetbrains text-xs text-normal font-bold uppercase tracking-wider">Upload your CV (PDF/DOCX)</label>
                    <div className="relative h-16 group">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="absolute inset-0 border border-dashed border-border bg-black/5 dark:bg-white/5 rounded-none flex items-center justify-between px-5 group-hover:border-accent transition-colors">
                        <span className="font-jetbrains text-xs text-description font-medium tracking-wider">
                          {cvFile ? cvFile.name : 'Choose File'}
                        </span>
                        <div className="w-8 h-8 rounded-none bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-jetbrains text-xs text-normal font-bold uppercase tracking-wider">Additional Information (optional)</label>
                    <textarea 
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      placeholder="Any links or references..."
                      className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-none p-4 min-h-[90px] font-montserrat text-sm text-normal focus:border-accent outline-none transition-all placeholder:text-description/60"
                    />
                  </div>

                  <button 
                    disabled={submitting}
                    type="submit"
                    className="w-full py-4 bg-accent text-white font-montserrat text-xs font-bold tracking-widest uppercase rounded-none shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Gigs
