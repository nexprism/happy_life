import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useDispatch, useSelector } from 'react-redux'
import { createPortal } from 'react-dom'
import { createJob, updateJob } from '../../redux/slices/jobSlice'
import { useLanguage } from '../../context/LanguageContext'

const CustomSelect = ({ label, value, options, onChange, name, placeholder = "Select Option" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 flex items-center justify-between hover:bg-slate-100/80 transition-all outline-none focus:border-amber-500"
      >
        <span className={!selectedOption ? 'text-slate-400' : 'text-slate-900 font-medium'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
          className={`transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full z-[100] mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange({ target: { name, value: option.value } })
                setIsOpen(false)
              }}
              className={`px-5 py-3.5 font-montserrat text-sm cursor-pointer transition-all
                ${value === option.value ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CreateJobModal = ({ isOpen, onClose, editData = null }) => {

  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { loading } = useSelector((state) => state.jobs)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    experienceLevel: 'beginner',
    mode: 'full-time',
    locationType: 'remote',
    currency: 'USD',
    minBudget: 0,
    maxBudget: 0,
    durationValue: 1,
    durationUnit: 'months',
    skillsRequired: [],
    thumbnail: null
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        description: editData.description || '',
        category: editData.category || '',
        experienceLevel: editData.experienceLevel || 'beginner',
        mode: editData.mode || 'full-time',
        locationType: editData.location?.type || 'remote',
        currency: editData.budget?.currency || 'USD',
        minBudget: editData.budget?.min || 0,
        maxBudget: editData.budget?.max || 0,
        durationValue: editData.estimatedDuration?.value || 1,
        durationUnit: editData.estimatedDuration?.unit || 'months',
        skillsRequired: editData.skillsRequired || [],
        thumbnail: null
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        experienceLevel: 'beginner',
        mode: 'full-time',
        locationType: 'remote',
        currency: 'USD',
        minBudget: 0,
        maxBudget: 0,
        durationValue: 1,
        durationUnit: 'months',
        skillsRequired: [],
        thumbnail: null
      })
    }
  }, [editData, isOpen])

  const [currentSkill, setCurrentSkill] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(contentRef.current, 
        { scale: 0.95, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }
      )
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    gsap.to(contentRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' })
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.in', onComplete: () => {
      onClose()
      document.body.style.overflow = 'unset'
    }})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const jobPayload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      experienceLevel: formData.experienceLevel,
      mode: formData.mode,
      location: {
        type: formData.locationType,
        address: {}
      },
      budget: {
        min: formData.currency === 'INR' ? 0 : Number(formData.minBudget),
        max: Number(formData.maxBudget),
        currency: formData.currency
      },
      estimatedDuration: {
        value: Number(formData.durationValue),
        unit: formData.durationUnit
      },
      skillsRequired: formData.skillsRequired
    }

    let resultAction;
    if (editData) {
      resultAction = await dispatch(updateJob({ id: editData._id, jobData: jobPayload }))
    } else {
      resultAction = await dispatch(createJob(jobPayload))
    }

    if (createJob.fulfilled.match(resultAction) || updateJob.fulfilled.match(resultAction)) {
      handleClose()
      if (!editData) {
        setFormData({
          title: '',
          description: '',
          category: '',
          experienceLevel: 'beginner',
          mode: 'full-time',
          locationType: 'remote',
          currency: 'USD',
          minBudget: 0,
          maxBudget: 0,
          durationValue: 1,
          durationUnit: 'months',
          skillsRequired: [],
          thumbnail: null
        })
      }
    }
  }

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      <div 
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md opacity-0 pointer-events-none"
      />
      
      <div 
        ref={contentRef}
        className="relative w-full max-w-4xl bg-white border border-slate-200 overflow-hidden shadow-2xl rounded-2xl opacity-0 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0 bg-white">
           <div className="flex flex-col">
              <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{editData ? t('editJobPostTitle') : t('createJobPostTitle')}</h2>
              <p className="font-montserrat text-xs text-amber-800 uppercase tracking-widest mt-1 font-bold">
                {editData ? t('editJobPostDesc') : t('createJobPostDesc')}
              </p>
           </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
        </div>

        {/* Form Area */}
        <form 
          onSubmit={handleSubmit} 
          className="p-6 md:p-10 space-y-8 overflow-y-auto no-scrollbar flex-1 min-h-0 bg-white"
          data-lenis-prevent
        >
           
           {/* Basic Info */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('jobTitleLabel')}</label>
                 <input 
                   name="title"
                   required
                   value={formData.title}
                   onChange={handleChange}
                   placeholder={t('jobTitlePlaceholder')}
                   className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                 />
              </div>

              <div className="space-y-2">
                 <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('jobDescriptionLabel')}</label>
                 <textarea 
                   name="description"
                   required
                   value={formData.description}
                   onChange={handleChange}
                   placeholder={t('jobDescriptionPlaceholder')}
                   className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none transition-all min-h-[120px] resize-none placeholder:text-slate-400"
                 />
              </div>
           </div>

           {/* Job Details Grid */}
           <div className="space-y-6">
              <h3 className="font-montserrat text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2">{t('jobDetailsHeader')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <CustomSelect 
                   label="Category *"
                   name="category"
                   value={formData.category}
                   onChange={handleChange}
                   placeholder="Select Category"
                   options={[
                     { value: 'design-branding', label: 'Design & Branding' },
                     { value: 'content-copywriting', label: 'Content & Copywriting' },
                     { value: 'video-audio', label: 'Video & Audio' },
                     { value: 'marketing-growth', label: 'Marketing & Growth' },
                     { value: 'tech-website', label: 'Tech & Website' },
                     { value: 'sales-client-work', label: 'Sales & Client Work' },
                   ]}
                 />

                 <CustomSelect 
                   label={t('experienceLevelLabel')}
                   name="experienceLevel"
                   value={formData.experienceLevel}
                   onChange={handleChange}
                   options={[
                     { value: 'beginner', label: 'Beginner' },
                     { value: 'intermediate', label: 'Intermediate' },
                     { value: 'expert', label: 'Expert' },
                   ]}
                 />

                 <CustomSelect 
                   label={t('jobModeLabel')}
                   name="mode"
                   value={formData.mode}
                   onChange={handleChange}
                   options={[
                     { value: 'full-time', label: 'Full-time' },
                     { value: 'part-time', label: 'Part-time' },
                     { value: 'contract', label: 'Contract' },
                   ]}
                 />

                 <CustomSelect 
                   label={t('locationTypeLabel')}
                   name="locationType"
                   value={formData.locationType}
                   onChange={handleChange}
                   options={[
                     { value: 'remote', label: 'Remote' },
                     { value: 'on-site', label: 'On-site' },
                     { value: 'hybrid', label: 'Hybrid' },
                   ]}
                 />

                 <div className="md:col-span-2">
                   <CustomSelect 
                     label={t('currencyLabel')}
                     name="currency"
                     value={formData.currency}
                     onChange={handleChange}
                     options={[
                       { value: 'USD', label: 'USD' },
                       { value: 'INR', label: 'INR' },
                       { value: 'EUR', label: 'EUR' },
                       { value: 'LPA', label: 'LPA' },
                     ]}
                   />
                 </div>
              </div>
           </div>

           {/* Budget Range */}
           <div className="space-y-6">
              <h3 className="font-montserrat text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2">
                {formData.currency === 'INR' ? t('budgetDetailsHeader') : t('budgetRangeHeader')}
              </h3>

              {formData.currency === 'INR' && (
                <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-800"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <p className="font-montserrat text-xs text-amber-900 leading-relaxed uppercase tracking-wider font-medium">
                    For <span className="font-black">{formData.mode?.replace('-', ' ')}</span> roles with INR, please enter the Min and Max budget in LPA (Lakhs Per Annum). E.g. 12 LPA.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {formData.currency === 'INR' ? (
                   <div className="space-y-4 md:col-span-2">
                     <div className="space-y-2">
                       <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                         <div className="w-5 h-5 border border-amber-500 rounded flex items-center justify-center text-[10px] font-black">₹</div>
                         Budget in LPA (Lakhs Per Annum)
                       </label>
                       <input 
                         type="number"
                         name="maxBudget"
                         value={formData.maxBudget}
                         onChange={handleChange}
                         placeholder="e.g. 12"
                         className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none placeholder:text-slate-400"
                       />
                     </div>
                   </div>
                 ) : (
                   <>
                     <div className="space-y-2">
                        <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('minBudgetLabel')}</label>
                        <input 
                          type="number"
                          name="minBudget"
                          value={formData.minBudget}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('maxBudgetLabel')}</label>
                        <input 
                          type="number"
                          name="maxBudget"
                          value={formData.maxBudget}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none"
                        />
                     </div>
                   </>
                 )}
               </div>
            </div>

            {/* Duration */}
            <div className="space-y-6">
               <h3 className="font-montserrat text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2">{t('durationHeader')}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('durationValueLabel')}</label>
                     <input 
                       type="number"
                       name="durationValue"
                       value={formData.durationValue}
                       onChange={handleChange}
                       placeholder="e.g. 1"
                       className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none"
                     />
                  </div>
                  <CustomSelect 
                    label={t('durationUnitLabel')}
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    options={[
                      { value: 'hours', label: 'Hours' },
                      { value: 'days', label: 'Days' },
                      { value: 'weeks', label: 'Weeks' },
                      { value: 'months', label: 'Months' },
                    ]}
                  />
               </div>
            </div>

           {/* Skills */}
           <div className="space-y-6">
              <h3 className="font-montserrat text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2">{t('requiredSkillsHeader')}</h3>
              <div className="flex gap-4">
                 <input 
                   value={currentSkill}
                   onChange={(e) => setCurrentSkill(e.target.value)}
                   placeholder={t('addSkillPlaceholder')}
                   className="flex-1 bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-xl font-montserrat text-sm text-slate-900 focus:border-amber-500 outline-none placeholder:text-slate-400"
                   onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                 />
                 <button 
                   type="button"
                   onClick={addSkill}
                   className="bg-amber-400 text-slate-950 px-8 py-3.5 rounded-xl font-montserrat text-xs font-black uppercase tracking-wider hover:bg-amber-500 transition-all shadow-sm"
                 >
                    {t('addSkillBtn')}
                 </button>
              </div>
              <div className="flex flex-wrap gap-3">
                 {formData.skillsRequired.map(skill => (
                   <div key={skill} className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-3">
                      <span className="font-montserrat text-xs text-amber-900 font-bold uppercase tracking-wider">{skill}</span>
                      <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-600 transition-colors">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           {/* Thumbnail */}
           <div className="space-y-6 pb-6">
              <h3 className="font-montserrat text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-2">{t('jobImageHeader')}</h3>
              <div className="space-y-2">
                 <label className="font-montserrat text-xs font-bold text-amber-900 uppercase tracking-wider">{t('thumbnailLabel')}</label>
                 <div className="flex flex-col gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="job-thumbnail"
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.files[0] }))}
                    />
                    <label 
                      htmlFor="job-thumbnail"
                      className="w-fit bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-3"
                    >
                       <span className="font-montserrat text-xs text-slate-900 font-bold uppercase tracking-wider">{t('chooseFileBtn')}</span>
                       <span className="font-montserrat text-xs text-slate-500 font-medium">
                          {formData.thumbnail ? formData.thumbnail.name : t('noFileChosen')}
                       </span>
                    </label>
                 </div>
              </div>
           </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0 bg-slate-50">
            <button 
              type="button"
              onClick={handleClose}
              className="font-montserrat text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider py-3.5 px-6 rounded-xl border border-slate-200 bg-white transition-all"
            >
               {t('cancelBtn')}
            </button>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className="bg-amber-400 text-slate-950 px-8 py-3.5 rounded-xl font-montserrat text-xs font-black uppercase tracking-wider flex items-center gap-2.5 hover:bg-amber-500 active:scale-95 transition-all shadow-md disabled:opacity-50"
           >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              )}
              {loading ? (editData ? t('updatingJob') : t('creatingJob')) : (editData ? t('updateJobBtn') : t('createJobBtn'))}
           </button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobModal
