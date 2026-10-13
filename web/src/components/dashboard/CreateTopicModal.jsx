import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const CreateTopicModal = ({ isOpen, onClose, onSubmit }) => {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [attachments, setAttachments] = useState([])
  
  const fileInputRef = useRef(null)
  
  const tags = ['Mindset', 'Feedback', 'PaidAds', 'SEO', 'ClientAcquisition', 'Operations', 'Troubleshooting']

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(contentRef.current, 
        { scale: 0.95, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }
      )
    }
  }, [isOpen])

  const handleClose = () => {
    gsap.to(contentRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' })
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.in', onComplete: onClose })
  }

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag])
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        title,
        content,
        tags: selectedTags,
        attachments
      })
      
      if (result) {
        setIsSubmitting(false)
        handleClose()
        // Reset form after closing
        setTimeout(() => {
          setTitle('')
          setContent('')
          setSelectedTags([])
          setAttachments([])
        }, 400)
      } else {
        setIsSubmitting(false)
      }
    } catch (error) {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 overflow-y-auto py-20">
      {/* Backdrop Overlay */}
      <div 
        ref={overlayRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 pointer-events-none"
      />
      
      {/* Modal Content container */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-3xl h-[95vh] bg-card border border-border rounded-none overflow-hidden shadow-2xl opacity-0 flex flex-col text-normal"
      >
        {/* Header Terminal */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-border bg-card">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-none bg-accent text-white flex items-center justify-center font-montserrat text-sm font-bold">
                 AS
              </div>
              <span className="font-montserrat text-xl text-normal font-bold">Create Discourse Topic</span>
           </div>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-none border border-border flex items-center justify-center text-description hover:text-accent hover:border-accent transition-all duration-300 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
        </div>

        {/* Intelligence Form Area */}
        <div className="flex-1 p-6 md:px-10 md:py-10 space-y-10 overflow-y-auto custom-scrollbar" data-lenis-prevent>
           
           {/* Section: Title Input */}
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                 <span className="font-montserrat text-[10px] font-bold text-accent tracking-[0.3em] uppercase">Title <span className="text-red-500">*</span></span>
              </div>
              <div className="relative group">
                 <input 
                   type="text" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value.substring(0, 100))}
                   placeholder="e.g., Google Ads vs Meta Ads, which works better for eCommerce?"
                   className="w-full bg-dark border border-border rounded-none px-5 py-4 font-montserrat text-sm text-normal placeholder:text-description/60 focus:outline-none focus:border-accent transition-all"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 font-montserrat text-[9px] text-description/60 uppercase tracking-widest">{title.length}/100</span>
              </div>
           </div>

           {/* Section: Content Editor */}
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                 <span className="font-montserrat text-[10px] font-bold text-accent tracking-[0.3em] uppercase">Content <span className="text-red-500">*</span></span>
              </div>
              <div className="relative group">
                 <textarea 
                   value={content}
                   onChange={(e) => setContent(e.target.value.substring(0, 2000))}
                   placeholder="Describe your question or topic in detail..."
                   className="w-full bg-dark border border-border rounded-none px-5 py-5 font-montserrat text-sm text-normal placeholder:text-description/60 focus:outline-none focus:border-accent transition-all min-h-[180px] resize-none"
                 />
                 <span className="absolute right-4 bottom-4 font-montserrat text-[9px] text-description/60 uppercase tracking-widest">{content.length}/2000</span>
              </div>
           </div>

           {/* Section: Dynamic Tags Selector */}
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                 <span className="font-montserrat text-[10px] font-bold text-accent tracking-[0.3em] uppercase">Tags <span className="text-description font-normal ml-2">(Select up to 5)</span></span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                 {tags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 border font-montserrat text-[9px] font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer
                        ${selectedTags.includes(tag) ? 'bg-accent border-accent text-white shadow-sm' : 'border-border text-description hover:border-accent hover:text-normal bg-card'}`}
                    >
                       #{tag}
                    </button>
                 ))}
              </div>
           </div>

           {/* Section: File Attachment Protocol */}
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                 <span className="font-montserrat text-[10px] font-bold text-accent tracking-[0.3em] uppercase">Attachments <span className="text-description font-normal ml-2">(Optional)</span></span>
              </div>

              <input 
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files)
                  setAttachments([...attachments, ...newFiles])
                }}
                multiple
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border bg-dark rounded-none p-10 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-accent transition-colors"
              >
                 <div className="w-12 h-12 rounded-none bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-normal">Click to upload files or drag and drop</span>
                    <span className="font-montserrat text-[9px] text-description uppercase tracking-wider">Images, PDFs, Documents (Max 10MB each)</span>
                 </div>
              </div>

              {/* Selected Files List */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-dark border border-border rounded-none group/file">
                      <span className="font-montserrat text-[10px] text-normal truncate max-w-[150px]">{file.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachments(attachments.filter((_, i) => i !== idx))
                        }}
                        className="text-description hover:text-red-500 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Footer Terminal Actions */}
        <div className="flex-shrink-0 p-5 border-t border-border flex items-center justify-end gap-6 bg-card">
            <button 
              onClick={handleClose}
              className="font-montserrat text-[11px] font-bold text-description hover:text-normal uppercase tracking-[0.3em] transition-colors py-3 px-2 cursor-pointer"
            >
               Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="bg-accent text-white font-bold px-8 py-3.5 font-montserrat text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center rounded-none cursor-pointer"
            >
               {isSubmitting ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
               )}
               {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
         </div>
      </div>
    </div>
  )
}

export default CreateTopicModal;
