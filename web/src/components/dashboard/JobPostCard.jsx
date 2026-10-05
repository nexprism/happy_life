import { useNavigate } from 'react-router-dom'
import { formatBudget } from '../../utils/formatBudget'

const JobPostCard = ({ job }) => {
  const navigate = useNavigate()

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }


  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 hover:bg-white/[0.03] transition-all group border-l-4 border-l-accent/20 hover:border-l-accent h-full flex flex-col">

      <div className="flex flex-col gap-6 flex-1">
        {/* Top Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center font-jetbrains text-accent text-xs font-bold">

              {getInitials(job.createdBy?.fullName)}
            </div>
            <div className="flex flex-col">
              <span className="font-jetbrains text-[9px] text-accent tracking-widest uppercase">{job.category?.replace('-', ' ')}</span>
              <span className="font-newsreader italic text-normal text-sm">{job.createdBy?.fullName || 'Anonymous'}</span>
            </div>
          </div>
          <div className={`px-3 py-1 border text-[8px] text-normal font-jetbrains uppercase tracking-widest ${job.isAdminApproved ? 'border-accent/40 text-accent bg-accent/5' : 'border-white/10 text-description/80 bg-white/5'}`}>

            {job.isAdminApproved ? 'Approved' : 'Pending Approval'}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="font-montserrat text-xl font-bold text-normal group-hover:text-accent transition-colors line-clamp-2 min-h-[3.5rem]">
            {job.title}
          </h3>
          <p className="font-jetbrains text-sm text-normal line-clamp-3 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {job.skillsRequired?.map(skill => (
            <span key={skill} className="px-3 py-1 bg-white/5 border border-white/5 font-jetbrains text-[8px] text-normal uppercase tracking-wider">

              #{skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <span className="font-jetbrains text-[8px] text-normal uppercase tracking-widest">Budget</span>
            <span className="font-montserrat text-xs font-bold text-normal">{formatBudget(job.budget)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-jetbrains text-[8px] text-normal uppercase tracking-widest">Duration</span>
            <span className="font-montserrat text-xs font-bold text-normal">{job.estimatedDuration?.value} {job.estimatedDuration?.unit || 'months'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-jetbrains text-[8px] text-normal uppercase tracking-widest">Mode</span>
            <span className="font-montserrat text-xs font-bold text-normal uppercase tracking-tighter">{job.mode}</span>
          </div>
        </div>

        <button 
            onClick={() => navigate(`/dashboard/job/${job._id}`)}
            className="flex items-center gap-2 font-jetbrains text-[9px] text-accent font-black uppercase tracking-[0.2em] group/btn"
          >
            View Details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/btn:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
      </div>
    </div>
  )

}

export default JobPostCard
