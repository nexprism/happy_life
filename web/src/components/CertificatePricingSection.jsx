import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import certificateImg from '../assets/images/happy_life_certificate.png'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

// Safe numerical price extractor that handles Numbers, Strings, and Decimal128 objects
const parsePrice = (val) => {
   if (val === null || val === undefined) return 0;
   if (typeof val === 'number') return isNaN(val) ? 0 : val;
   if (typeof val === 'object' && val.$numberDecimal !== undefined) {
      const n = Number(val.$numberDecimal);
      return isNaN(n) ? 0 : n;
   }
   if (typeof val?.toString === 'function') {
      const s = val.toString();
      if (s && s !== '[object Object]') {
         const n = parseFloat(s.replace(/[^0-9.-]+/g, ''));
         return isNaN(n) ? 0 : n;
      }
   }
   const n = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
   return isNaN(n) ? 0 : n;
};

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

   const containerRef = useRef(null)
   const navigate = useNavigate()

   // Calculate Main Course Price
   const mainPrice = parsePrice(course?.price);
   const mainSalePrice = parsePrice(course?.salePrice);
   const hasMainSale = mainSalePrice > 0 && (mainPrice === 0 || mainSalePrice < mainPrice);
   const effectiveMainPrice = hasMainSale ? mainSalePrice : mainPrice;
   const mainDiscountPercent = (hasMainSale && mainPrice > 0)
      ? Math.round(((mainPrice - mainSalePrice) / mainPrice) * 100)
      : 0;

   // Format custom duration plans from course.plans
   const rawPlans = Array.isArray(course?.plans) ? course.plans.filter(p => p && p.status !== 'inactive') : [];
   const formattedPlans = rawPlans.map(p => {
      const pPrice = parsePrice(p.price);
      const pSale = parsePrice(p.salePrice);
      const hasPlanSale = pSale > 0 && (pPrice === 0 || pSale < pPrice);
      const effectivePlanPrice = hasPlanSale ? pSale : pPrice;
      const discountPercent = (hasPlanSale && pPrice > 0)
         ? Math.round(((pPrice - pSale) / pPrice) * 100)
         : 0;

      const durNum = p.duration || 1;
      const durType = p.durationType || 'Year';
      const durationLabel = `${durNum} ${durType}${Number(durNum) > 1 ? 's' : ''}`;

      return {
         id: String(p._id || p.id),
         _id: String(p._id || p.id),
         name: p.name || `${durationLabel} Access`,
         title: p.name || `${durationLabel} Access`,
         duration: p.duration,
         durationType: p.durationType,
         durationText: durationLabel,
         price: effectivePlanPrice > 0 ? effectivePlanPrice : (effectiveMainPrice > 0 ? effectiveMainPrice : 1999),
         originalPrice: hasPlanSale ? pPrice : (pPrice > effectivePlanPrice ? pPrice : null),
         salePrice: pSale,
         discountPercent,
         hasSale: hasPlanSale,
         subtitle: p.description || `${durationLabel} full access to course curriculum & quizzes`,
         isLifetime: false,
         badge: `${durationLabel.toUpperCase()} ACCESS`
      };
   });

   const isLifetimePlanAllowed = course?.showLifetimePlan !== false;

   // Build all plans array: combine custom plans and Lifetime Main Course option
   const allPlans = [...formattedPlans];
   if (isLifetimePlanAllowed && effectiveMainPrice > 0) {
      allPlans.push({
         id: 'lifetime_full',
         _id: null, // Null plan ID represents the main course in checkout
         name: 'Lifetime Full Access',
         title: 'Lifetime Full Access',
         durationText: 'Lifetime Validity',
         price: effectiveMainPrice,
         originalPrice: hasMainSale ? mainPrice : null,
         salePrice: mainSalePrice,
         discountPercent: mainDiscountPercent,
         hasSale: hasMainSale,
         subtitle: 'Permanent unrestricted access to all modules, future updates & resources',
         isLifetime: true,
         badge: formattedPlans.length > 0 ? 'LIFETIME' : 'BEST VALUE'
      });
   }

   // Fallback if neither custom plans nor main price was provided
   if (allPlans.length === 0) {
      allPlans.push({
         id: 'lifetime_full',
         _id: null,
         name: 'Complete Course Access',
         title: 'Complete Course Access',
         durationText: 'Lifetime Validity',
         price: 1999,
         originalPrice: null,
         salePrice: null,
         discountPercent: 0,
         hasSale: false,
         subtitle: 'Standard full unrestricted access to course curriculum',
         isLifetime: true,
         badge: 'LIFETIME'
      });
   }

   const [selectedPlanId, setSelectedPlanId] = useState(allPlans[0]?.id || null)

   useEffect(() => {
      if (allPlans.length > 0) {
         if (!selectedPlanId || !allPlans.some(p => p.id === selectedPlanId)) {
            setSelectedPlanId(allPlans[0].id)
         }
      }
   }, [course])

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

   const selectedPlan = allPlans.find(p => p.id === selectedPlanId) || allPlans[0]

   const handleContinue = () => {
      if (!selectedPlan) return;

      if (selectedPlan._id) {
         // Specific Course Plan selected
         navigate('/checkout', {
            state: {
               plan: {
                  id: selectedPlan._id,
                  _id: selectedPlan._id,
                  title: selectedPlan.title,
                  name: selectedPlan.name,
                  price: selectedPlan.price,
                  salePrice: selectedPlan.salePrice,
                  duration: selectedPlan.duration,
                  durationType: selectedPlan.durationType
               },
               course
            }
         });
      } else {
         // Main Course Lifetime Purchase selected
         navigate('/checkout', {
            state: {
               plan: null,
               course: {
                  ...course,
                  price: mainPrice > 0 ? mainPrice : selectedPlan.price,
                  salePrice: hasMainSale ? mainSalePrice : null
               }
            }
         });
      }
   }

   return (
      <section ref={containerRef} className="max-w-7xl mx-auto pt-20 pb-16 lg:pt-32 lg:pb-28 px-4 sm:px-6 lg:px-8 scroll-mt-36">

         {/* 1. Header Area with Main Course Price Showcase */}
         <div className="text-center mb-12 lg:mb-16 reveal-item space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
               <span>★ Official Enrollment & Certification</span>
            </div>

            <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
               Get Started with the <span className="text-accent underline decoration-accent/20">Perfect Plan.</span>
            </h2>

            <p className="font-montserrat text-description text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
               Select your preferred learning timeline or unlock complete lifetime access with verified industry accreditation.
            </p>

            {/* Prominent Main Course Price Banner */}
            {isLifetimePlanAllowed && effectiveMainPrice > 0 && (
               <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-full backdrop-blur-md">
                     <span className="font-montserrat text-xs uppercase tracking-wider text-description font-semibold">
                        Full Course Standard Value:
                     </span>
                     <span className="font-montserrat text-lg md:text-xl font-black text-normal">
                        ₹{effectiveMainPrice.toLocaleString('en-IN')}
                     </span>
                     {hasMainSale && (
                        <>
                           <span className="font-montserrat text-xs line-through text-description/60">
                              ₹{mainPrice.toLocaleString('en-IN')}
                           </span>
                           <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold rounded-full">
                              {mainDiscountPercent}% OFF
                           </span>
                        </>
                     )}
                  </div>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* 2. Certificate Showcase (Left - 6 cols) */}
            <div className="lg:col-span-6 reveal-item relative group lg:sticky lg:top-28 space-y-6">
               <div className="absolute -inset-4 bg-amber-400/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
               
               <div className="relative border-4 md:border-8 border-slate-200 dark:border-white/10 bg-white p-2 shadow-2xl overflow-hidden rounded-2xl">
                  <img
                     src={(() => {
                        if (!course?.certificateImage) return certificateImg;
                        if (course.certificateImage.startsWith('http') || course.certificateImage.startsWith('blob:')) return course.certificateImage;
                        const rawBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                        const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                        return `${baseUrl}${course.certificateImage.startsWith('/') ? '' : '/'}${course.certificateImage}`;
                     })()}
                     alt="Happy Life Academy Certificate"
                     className="w-full h-auto transition-all duration-1000 rounded-lg"
                  />

                  {/* USER NAME OVERLAY */}
                  <div className="absolute top-[49%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none px-8">
                     <span className="font-montserrat font-semibold text-[#1a2e4c] text-[clamp(1.1rem,2.2vw,1.8rem)] leading-none drop-shadow-xs tracking-wide">
                        {displayName}
                     </span>
                  </div>
               </div>

               {/* Accreditation and Value Perks */}
               <div className="p-5 bg-black/5 dark:bg-white/5 border border-border rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-accent font-montserrat text-[10px] font-bold tracking-widest uppercase">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                     </svg>
                     <span>{course?.certificateTitle || "ISO Accredited Certification Protocol"}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-description font-montserrat">
                     <li className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Verifiable credential ID recognized across the industry</span>
                     </li>
                     <li className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Official accreditation certificate generated upon 100% completion</span>
                     </li>
                     <li className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Direct instructor evaluation & student community privileges</span>
                     </li>
                  </ul>
               </div>
            </div>

            {/* 3. Multi-Plan Selection (Right - 6 cols) */}
            <div className="lg:col-span-6 reveal-item space-y-6">
               <div className="space-y-4">
                  {allPlans.map((plan) => {
                     const isSelected = selectedPlanId === plan.id;
                     return (
                        <div
                           key={plan.id}
                           onClick={() => setSelectedPlanId(plan.id)}
                           className={`relative cursor-pointer p-6 sm:p-8 border rounded-2xl transition-all duration-300 overflow-hidden group
                           ${isSelected 
                              ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50 shadow-xl' 
                              : 'border-border bg-card hover:border-accent/40'}`}
                        >
                           {/* Glow Effect */}
                           {isSelected && (
                              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-[50px] pointer-events-none" />
                           )}

                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Left Info */}
                              <div className="space-y-2 flex-1">
                                 <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-montserrat text-xl sm:text-2xl text-normal font-bold tracking-tight">
                                       {plan.title}
                                    </h3>
                                    {plan.badge && (
                                       <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase ${
                                          isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-black/10 dark:bg-white/10 text-description'
                                       }`}>
                                          {plan.badge}
                                       </span>
                                    )}
                                 </div>

                                 <p className="font-montserrat text-xs text-description leading-relaxed">
                                    {plan.subtitle}
                                 </p>
                              </div>

                              {/* Right Pricing & Radio */}
                              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                                 <div className="flex flex-col items-start sm:items-end">
                                    <div className="flex items-baseline gap-2">
                                       <span className="font-montserrat text-2xl sm:text-3xl text-amber-500 font-extrabold">
                                          ₹{plan.price.toLocaleString('en-IN')}
                                       </span>
                                       {plan.hasSale && plan.originalPrice && (
                                          <span className="font-montserrat text-xs sm:text-sm line-through text-description/60">
                                             ₹{plan.originalPrice.toLocaleString('en-IN')}
                                          </span>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <span className="font-montserrat text-[9px] text-description uppercase tracking-wider font-semibold">
                                          {plan.durationText}
                                       </span>
                                       {plan.hasSale && plan.discountPercent > 0 && (
                                          <span className="font-montserrat text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                             {plan.discountPercent}% OFF
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Custom Selection Circle */}
                                 <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300
                                 ${isSelected ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md' : 'border-border group-hover:border-amber-400'}`}>
                                    {isSelected && (
                                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-950">
                                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* 4. Continue Access Button */}
               <div className={`transition-all duration-500 ${selectedPlan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <button
                     onClick={handleContinue}
                     className="w-full relative group bg-accent px-6 py-5 flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-98 transition-all duration-300 rounded-xl shadow-lg cursor-pointer"
                  >
                     <span className="relative z-10 font-montserrat text-slate-950 text-xs sm:text-sm font-black tracking-widest uppercase">
                        Continue to Buy • ₹{selectedPlan?.price?.toLocaleString('en-IN')}
                     </span>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10 stroke-slate-950 group-hover:translate-x-1.5 transition-transform duration-300">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" />
                     </svg>
                  </button>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-60 text-description">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="font-montserrat text-[10px] tracking-wider uppercase font-semibold">256-Bit SSL Secured</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="font-montserrat text-[10px] tracking-wider uppercase font-semibold">{t('instantActivation') || 'Instant Activation'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="font-montserrat text-[10px] tracking-wider uppercase font-semibold">Full Curriculum & Certificate</span>
                     </div>
                  </div>
               </div>
            </div>

         </div>

      </section>
   )
}

export default CertificatePricingSection
