import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import certificateImg from '../assets/images/happy_life_certificate.png'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const plans = [
   { id: '1month', title: '1 Month', price: 499, subtitle: 'Trial Access Protocol' },
   { id: '3month', title: '3 Month', price: 1299, subtitle: 'Accelerated Access' },
   { id: '1year', title: '1 Year', price: 3499, subtitle: 'Standard Access' }
]

const CertificatePricingSection = ({ course }) => {
   const { t } = useLanguage()
   const { user: authUser } = useSelector(state => state.auth)
   const { user: profileUser } = useSelector(state => state.profile)

   const user = authUser || profileUser
   const displayName = user?.fullName || user?.name || "John Doe"

   const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
   });
   const courseTitle = course?.title || "Masterclass";

   const [selectedPlanId, setSelectedPlanId] = useState(null)
   const containerRef = useRef(null)
   const navigate = useNavigate()

   useEffect(() => {
      const ctx = gsap.context(() => {
         gsap.from('.reveal-item', {
            y: 40,
            opacity: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'expo.out',
            scrollTrigger: {
               trigger: containerRef.current,
               start: 'top 80%',
            }
         })
      }, containerRef)
      return () => ctx.revert()
   }, [])

   // Use API plans if available, otherwise dynamically resolve from course pricing
   const dynamicCoursePrice = (course?.salePrice && Number(course.salePrice) > 0)
      ? Number(course.salePrice)
      : (course?.price && Number(course.price) > 0 ? Number(course.price) : 1999);

   const apiPlans = course?.plans?.length > 0 ? course.plans.map(p => {
      const pSale = p.salePrice && Number(p.salePrice) > 0 ? Number(p.salePrice) : null;
      const pPrice = p.price && Number(p.price) > 0 ? Number(p.price) : null;
      const planPrice = pSale || pPrice || dynamicCoursePrice;
      return {
         id: p._id,
         title: p.name || `${p.duration || 1} ${p.durationType || 'Year'}`,
         price: planPrice,
         subtitle: p.description || 'Full Access Protocol'
      };
   }) : [
      { id: '1year', title: '1 Year Full Access', price: dynamicCoursePrice, subtitle: 'Standard Access' }
   ];

   useEffect(() => {
      if (apiPlans.length > 0 && !selectedPlanId) {
         setSelectedPlanId(apiPlans[0].id)
      }
   }, [apiPlans])

   const handleContinue = () => {
      const selectedPlan = apiPlans.find(p => p.id === selectedPlanId)
      if (selectedPlan) {
         navigate('/checkout', { state: { plan: selectedPlan, course } })
      }
   }

   return (
      <section ref={containerRef} className="max-w-7xl mx-auto py-10 lg:py-20 scroll-mt-24">

         {/* 1. Header Area with fixed overlap */}
         <div className="text-center mb-10 lg:mb-24 reveal-item">
            <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
               Get Started with the <span className="text-accent underline decoration-accent/20">Perfect Plan.</span>
            </h2>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* 2. Certificate Showcase (Left - 5 cols) */}
            <div className="lg:col-span-6 reveal-item lg:mb-32 md:mb-0 relative group lg:sticky lg:top-32">
               <div className="absolute -inset-4 bg-amber-400/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="relative border-8 border-slate-200 bg-white p-2 shadow-2xl overflow-hidden rounded-xl">
                  <img
                     src={(() => {
                        if (!course?.certificateImage) return certificateImg;
                        if (course.certificateImage.startsWith('http') || course.certificateImage.startsWith('blob:')) return course.certificateImage;
                        const rawBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                        const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                        return `${baseUrl}${course.certificateImage.startsWith('/') ? '' : '/'}${course.certificateImage}`;
                     })()}
                     alt="Happy Life Academy Certificate"
                     className="w-full h-auto transition-all duration-1000"
                  />

                  {/* USER NAME OVERLAY */}
                  <div className="absolute top-[49%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-8">
                     <span className="font-montserrat font-semibold text-[#1a2e4c] text-[clamp(1.1rem,2.2vw,1.8rem)] leading-none drop-shadow-xs tracking-wide">
                        {displayName}
                     </span>
                  </div>

                  {/* COURSE INFO OVERLAY */}
                  {/* <div className="absolute top-[60.5%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none px-12">
                      <p className="font-montserrat font-bold text-[#1a2e4c] text-[clamp(0.45rem,1vw,0.75rem)] leading-tight uppercase tracking-wider">
                         {courseTitle}
                      </p>
                      <p className="font-montserrat text-[#4a5568] text-[clamp(0.35rem,0.75vw,0.55rem)] mt-0.5 font-medium tracking-wide">
                         Awarded on {formattedDate}
                      </p>
                   </div> */}
               </div>
               <div className="mt-8 space-y-4">
                  <p className="font-montserrat text-[9px] text-amber-700 tracking-[0.5em] uppercase text-center md:text-left font-bold">{course?.certificateTitle || "Certification Protocol Available Upon Completion"}</p>
               </div>
            </div>

            {/* 3. Multi-Plan Selection */}
            <div className="lg:col-span-6 reveal-item space-y-6">
               <div className="space-y-4">
                  {apiPlans.map((plan) => (
                     <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative cursor-pointer p-8 md:p-10 border rounded-2xl transition-all duration-500 overflow-hidden group
                       ${selectedPlanId === plan.id ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/40 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                     >
                        {/* Selection Glow */}
                        {selectedPlanId === plan.id && (
                           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-[60px]" />
                        )}

                        <div className="flex justify-between items-center">
                           <div className="space-y-1">
                              <h3 className="font-montserrat text-3xl md:text-4xl text-slate-900 leading-none font-bold tracking-tight">
                                 {plan.title}
                              </h3>
                              <p className="font-montserrat text-[9px] text-slate-600 tracking-widest uppercase font-bold">
                                 {plan.subtitle}
                              </p>
                           </div>

                           <div className="flex items-center gap-8">
                              <div className="flex flex-col items-end">
                                 <span className="font-montserrat text-3xl md:text-5xl text-amber-700 font-normal">₹{plan.price}</span>
                                 <span className="font-montserrat text-[7px] text-slate-400 uppercase tracking-widest">Single Access</span>
                              </div>

                              {/* Custom Selection Circle */}
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500
                              ${selectedPlanId === plan.id ? 'border-amber-400 bg-accent' : 'border-slate-300 group-hover:border-amber-400'}`}>
                                 {selectedPlanId === plan.id && (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-950">
                                       <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* 4. Continue Access Button */}
               <div className={`transition-all duration-700 ease-[expo.out]
              ${selectedPlanId ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
                  <button
                     onClick={handleContinue}
                     className="w-full relative group bg-accent px-6 md:px-12 py-6 md:py-7 flex items-center justify-center gap-4 md:gap-6 hover:scale-[1.02] active:scale-95 transition-all duration-500 rounded-full shadow-accent-soft"
                  >
                     <span className="relative z-10 font-montserrat text-slate-950 text-[10px] md:text-xs font-black tracking-[0.3em] md:tracking-[0.6em] uppercase whitespace-nowrap">Continue to Buy</span>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10 stroke-slate-950 group-hover:translate-x-2 transition-transform duration-500">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" />
                     </svg>
                  </button>

                  <div className="mt-8 flex items-center justify-center gap-10 opacity-30">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="font-montserrat text-[8px] tracking-widest uppercase">{t('sslSecured')}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="font-montserrat text-[8px] tracking-widest uppercase">{t('instantActivation')}</span>
                     </div>
                  </div>
               </div>
            </div>

         </div>

      </section>
   )
}

export default CertificatePricingSection
