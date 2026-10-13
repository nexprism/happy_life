import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import RollingText from './RollingText'
import sanitizeDisplay from '../utils/textSanitize'
import { useLanguage } from '../context/LanguageContext'

const CourseHeroDetail = ({ course, section }) => {
   const heroRef = useRef(null)
   const formRef = useRef(null)
   const { t } = useLanguage()

   const rawTitle = section?.title || course.title || 'Course'
   const displayTitle = sanitizeDisplay(rawTitle)
   const displaySubtitle = sanitizeDisplay(section?.subtitle || course.subtitle || '')

   useEffect(() => {
      const ctx = gsap.context(() => {
         // 1. Initial reveals
         gsap.fromTo('.reveal-text',
            { y: 80, opacity: 0, scale: 0.9, filter: 'blur(15px)' },
            { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power4.out', stagger: 0.1 }
         )

         gsap.fromTo('.reveal-checkmark',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.1, delay: 0.6 }
         )

         gsap.fromTo('.reveal-form',
            { x: 100, opacity: 0, rotateY: 20 },
            { x: 0, opacity: 1, rotateY: 0, duration: 2, ease: 'power4.out', delay: 0.4 }
         )

         // 2. Subtle floating animation for the form
         gsap.to('.reveal-form', {
            y: 15,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
         })
      }, heroRef)

      return () => ctx.revert()
   }, [])

   const highlights = course.highlights?.length > 0 ? course.highlights : [
      "Actionable Advice",
      "In Depth Feedback",
      "Proven Process"
   ]

   return (
      <section ref={heroRef} className="max-w-7xl mx-auto mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[70vh]">

         {/* LEFT: DRAMATIC TYPOGRAPHY & VALUE */}
         <div className="lg:col-span-7 space-y-8 md:space-y-8">
            <div className="space-y-2">
               <span className="reveal-text block font-montserrat text-accent text-[9px] md:text-xs tracking-[0.6em] md:tracking-[0.2em] font-bold uppercase opacity-60">
                  {course.category?.name || 'COURSE'} / {course.level?.[0] || 'GENERAL'}
               </span>
               <h1 className="reveal-text font-montserrat text-normal max-w-3xl break-words text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                  {displayTitle.split(' ').map((word, i, arr) => (
                     <React.Fragment key={i}>
                        {i === arr.length - 1 ? (
                           <span className="text-accent underline-lime">{word}</span>
                        ) : (
                           word + ' '
                        )}
                        {i === 1 && <br />}
                     </React.Fragment>
                  ))}
               </h1>
               {/* <h2 className="reveal-text font-montserrat text-normal/70 pt-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            {displaySubtitle}
          </h2> */}
            </div>

            <p className="reveal-text font-montserrat text-[9px] md:text-xs text-black max-w-xl leading-[1.7] tracking-widest break-words">
               {course.shortDescription || course.description}
            </p>

            {/* Checkpoints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
               {highlights.map((check, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                     <div className="reveal-checkmark w-4 h-4 rounded-full border border-accent/40 flex items-center justify-center shrink-0">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                     </div>
                     <span className="reveal-text font-montserrat text-[8px] md:text-[9px] text-description/70 font-bold tracking-widest uppercase group-hover:text-accent transition-colors">
                        {check}
                     </span>
                  </div>
               ))}
            </div>

            {/* Buttons */}
            <div className="reveal-text flex flex-wrap gap-6 pt-4">
               <button
                  onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative bg-accent px-10 md:px-12 py-4 overflow-hidden transition-all duration-700 hover:scale-105 active:scale-95"
               >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
                  <span className="relative z-10 font-montserrat text-dark text-[9px] font-bold tracking-[0.5em] uppercase">{t('seePricing')}</span>
               </button>
               <button
                  onClick={() => document.getElementById('curriculum-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative px-10 md:px-12 py-4 border border-border overflow-hidden hover:border-accent transition-all duration-500"
               >
                  <span className="relative z-10 font-montserrat text-normal text-[9px] font-bold tracking-[0.5em] uppercase">VIEW CURRICULUM</span>
               </button>
            </div>
         </div>

         {/* RIGHT: FLOATING MATRIX FORM */}
         <div className="lg:col-span-5 relative perspective-1000">
            <div className="reveal-form relative z-10 bg-white/[0.01] border border-border backdrop-blur-3xl p-8 md:p-10 lg:p-12 rounded-none shadow-2xl relative overflow-hidden group">
               {/* Ambient inner glow */}
               <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/10 blur-[60px] rounded-full pointer-events-none" />

               <div className="space-y-8 relative z-20">
                  <div className="space-y-3">
                     <h3 className="font-montserrat text-3xl text-normal leading-tight font-bold group-hover:underline-lime decoration-accent/20 transition-all">
                        Ready to <br /> <span className="text-accent underline-lime">Transform?</span>
                     </h3>
                     <p className="font-montserrat text-[8px] text-description tracking-[0.4em] uppercase">Join {course.enrolledStudentsCount || 0}+ students today.</p>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                     <div className="space-y-4">
                        <div className="relative group/input">
                           <input type="text" placeholder={t('fullName')} className="w-full bg-white/[0.02] border-b border-white/10 px-0 py-3 font-montserrat text-[9px] tracking-widest text-normal uppercase focus:outline-none focus:border-accent transition-all placeholder:text-description" />
                           <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-focus-within/input:w-full transition-all duration-700" />
                        </div>
                        <div className="relative group/input">
                           <input type="email" placeholder={t('emailAddress')} className="w-full bg-white/[0.02] border-b border-white/10 px-0 py-3 font-montserrat text-[9px] tracking-widest text-normal uppercase focus:outline-none focus:border-accent transition-all placeholder:text-description" />
                           <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-focus-within/input:w-full transition-all duration-700" />
                        </div>
                        <div className="flex gap-4">
                           <div className="w-16 relative group/input">
                              <span className="absolute left-0 bottom-3 font-montserrat text-[9px] text-accent font-bold">+91</span>
                              <input type="text" disabled className="w-full bg-white/[0.02] border-b border-white/10 px-0 py-3 font-montserrat text-[9px] tracking-widest text-normal uppercase opacity-40" />
                           </div>
                           <div className="flex-1 relative group/input">
                              <input type="tel" placeholder={t('phoneNumber')} className="w-full bg-white/[0.02] border-b border-white/10 px-0 py-3 font-montserrat text-[9px] tracking-widest text-normal uppercase focus:outline-none focus:border-accent transition-all placeholder:text-description" />
                              <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-focus-within/input:w-full transition-all duration-700" />
                           </div>
                        </div>
                        <div className="relative group/input pt-2">
                           <textarea rows="2" placeholder="WHY DO YOU WANT TO JOIN?" className="w-full bg-white/[0.02] border border-white/10 p-4 font-montserrat text-[9px] tracking-widest text-normal uppercase focus:outline-none focus:border-accent transition-all placeholder:text-description resize-none rounded-none" />
                        </div>
                     </div>

                     <button className="w-full group/btn relative bg-accent py-5 overflow-hidden transition-all duration-700 hover:scale-[1.02] active:scale-95">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
                        <span className="relative z-10 font-montserrat text-dark text-[10px] font-black tracking-[0.5em] uppercase">
                           REQUEST CALLBACK
                        </span>
                     </button>
                  </form>
               </div>
            </div>

            {/* Decorative Background Glows */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none -z-10" />
         </div>

      </section>
   )
}

export default CourseHeroDetail
