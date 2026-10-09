import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { gsap } from 'gsap'
import { fetchSettings, validateCoupon, clearCoupon, fetchAllCoupons } from '../redux/slices/configSlice'
import { fetchCourseDetail } from '../redux/slices/courseSlice'
import { buyNow } from '../redux/slices/enrollmentSlice'
import CheckoutBreakdown from '../components/CheckoutBreakdown'
import { useLanguage } from '../context/LanguageContext'

const Checkout = () => {
   const navigate = useNavigate()
   const location = useLocation()
   const dispatch = useDispatch()
   const { t } = useLanguage()

   const searchParams = new URLSearchParams(location.search)
   const urlCourseId = searchParams.get('course_id')
   const urlPlanId = searchParams.get('plan_id')
   const urlAcc = searchParams.get('acc')
   const urlAmount = searchParams.get('amount')

   const isHexId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

   const { currentCourse } = useSelector(state => state.courses)
   
   const course = (location.state?.course && location.state?.course.title)
      ? location.state.course
      : (currentCourse && (currentCourse._id === urlCourseId || currentCourse.id === urlCourseId)
         ? currentCourse
         : (location.state?.course || (urlCourseId ? { id: urlCourseId, _id: urlCourseId, title: 'Astrology Masterclass' } : {})))

   const defaultCoursePrice = (course?.salePrice != null && Number(course.salePrice) > 0)
      ? Number(course.salePrice)
      : (course?.price != null && Number(course.price) > 0 ? Number(course.price) : (urlAmount ? Number(urlAmount) : 1999));

   const rawPlan = location.state?.plan;
   const validPlanId = isHexId(rawPlan?._id || rawPlan?.id)
      ? (rawPlan?._id || rawPlan?.id)
      : (isHexId(urlPlanId) ? urlPlanId : null);

   const planPrice = (() => {
      if (rawPlan) {
         const s = rawPlan.salePrice && Number(rawPlan.salePrice) > 0 ? Number(rawPlan.salePrice) : null;
         const p = rawPlan.price && Number(rawPlan.price) > 0 ? Number(rawPlan.price) : null;
         return s || p || defaultCoursePrice;
      }
      if (urlAmount && Number(urlAmount) > 0) return Number(urlAmount);
      return defaultCoursePrice;
   })();

   const selectedPlan = rawPlan
      ? { id: validPlanId, title: rawPlan.title || rawPlan.name || 'Selected Plan', price: planPrice }
      : (validPlanId
         ? { id: validPlanId, title: 'Selected Plan', price: planPrice }
         : { id: null, title: 'Course Enrollment', price: defaultCoursePrice });

   const accParam = urlAcc || location.state?.acc || ''

   const { settings, coupons, couponData, couponError, couponLoading } = useSelector(state => state.config)
   const authUser = useSelector(state => state.auth?.user)

   const rawBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
   const BASE_API = rawBase.replace(/\/api\/v1\/?$/, '');

   const [formData, setFormData] = useState(() => {
      let savedUser = null;
      try {
         const lsUser = localStorage.getItem('user') || localStorage.getItem('userInfo') || localStorage.getItem('edrilla_user');
         if (lsUser) {
            savedUser = JSON.parse(lsUser);
         }
      } catch (e) {
         console.error('Error parsing user from localstorage', e);
      }

      return {
         fullName: savedUser?.name || savedUser?.fullName || '',
         email: savedUser?.email || '',
         phone: savedUser?.phone || savedUser?.mobile || '',
         company: (savedUser && (savedUser.company?.name || (typeof savedUser.company === 'string' ? savedUser.company : ''))) || '',
         gst: savedUser?.gst || '',
         coupon: ''
      };
   });

   // If user is logged in via Redux, prefill any empty fields
   useEffect(() => {
      if (!authUser) return;
      setFormData(prev => ({
         ...prev,
         fullName: prev.fullName || authUser.name || authUser.fullName || '',
         email: prev.email || authUser.email || '',
         phone: prev.phone || authUser.phone || authUser.mobile || '',
         company: prev.company || (authUser.company?.name ?? (typeof authUser.company === 'string' ? authUser.company : '')) || '',
         gst: prev.gst || (authUser.company && authUser.company.gstNumber) || prev.gst || ''
      }))
   }, [authUser])

   const [isVerified, setIsVerified] = useState(false)
   const [showOTPModal, setShowOTPModal] = useState(false)
   const [otp, setOtp] = useState('')
   const [sendingOtp, setSendingOtp] = useState(false)
   const [verifyingOtp, setVerifyingOtp] = useState(false)
   const [otpMessage, setOtpMessage] = useState('')
   const [showSuccessModal, setShowSuccessModal] = useState(false)
   const checkoutRef = useRef(null)
   const scanLineRef = useRef(null)

   const basePrice = selectedPlan.price
   const gstRate = Number(settings?.gstRate ?? 0.18)
   const discount = couponData ? (couponData.discountType === 'percentage' ? (basePrice * couponData.discountPercent / 100) : couponData.discountAmount) : 0
   const discountedBase = Math.max(0, basePrice - discount)
   const gstAmount = discountedBase * gstRate
   const total = discountedBase + gstAmount
   const displayTotal = total.toFixed(2)

   useEffect(() => {
      window.scrollTo(0, 0)
      dispatch(fetchSettings())
      dispatch(fetchAllCoupons())
      dispatch(clearCoupon())

      if (urlCourseId && (!course?.title || course.title === 'Astrology Masterclass' || course.title === 'Course Purchase')) {
         dispatch(fetchCourseDetail(urlCourseId))
      }

      if (scanLineRef.current) {
         gsap.to(scanLineRef.current, { top: '100%', duration: 3, repeat: -1, ease: 'none' })
      }
   }, [dispatch, urlCourseId])

   // Load Razorpay script dynamically
   const loadRazorpayScript = () => new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
      document.body.appendChild(script)
   })

   const handlePayment = async () => {
      try {
         await loadRazorpayScript()
      } catch (e) {
         console.error('Razorpay SDK load error', e)
         alert('Payment SDK failed to load')
         return
      }

      try {
         const planIdToSend = isHexId(selectedPlan?.id || selectedPlan?._id) ? (selectedPlan.id || selectedPlan._id) : undefined;

         const payload = {
            courseId: course._id || course.id || '',
            guestEmail: formData.email,
            guestName: formData.fullName,
            couponCode: formData.coupon || '',
            is_verify: Boolean(isVerified),
         }

         if (planIdToSend) payload.coursePlanId = planIdToSend;
         if (accParam) payload.acc = accParam;

         const chkRes = await fetch(`${BASE_API}/checkout/check-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         })
         const chkData = await chkRes.json()
         if (!chkRes.ok) {
            alert(chkData?.message || 'Order validation failed')
            return
         }

         if (!chkData?.success || !chkData?.is_valid) {
            alert(chkData?.data?.message || 'Order cannot be placed')
            return
         }

         const razor = chkData?.razorpay || {}
         const rKey = razor.key || settings?.RAZORPAY_KEY_ID || settings?.settings?.RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID
         const order = razor.order || {}
         const rAmount = (order.amount != null) ? order.amount : Math.round(total * 100)

         const options = {
            key: rKey,
            amount: rAmount,
            currency: razor.currency || 'INR',
            name: 'Happy Life Astro',
            description: course.title || 'Course Purchase',
            order_id: order.id,
            handler: async function (response) {
               console.log('Razorpay success', response)

               try {
                  const buyPayload = {
                     courseId: course._id || course.id || '',
                     paymentId: response.razorpay_payment_id,
                     orderId: response.razorpay_order_id,
                     signature: response.razorpay_signature,
                     guestEmail: formData.email,
                     guestName: formData.fullName,
                     paymentProvider: 'razorpay',
                     couponCode: formData.coupon || '',
                     company: formData.company,
                     gst: formData.gst
                  }

                  if (planIdToSend) buyPayload.coursePlanId = planIdToSend;
                  if (accParam) buyPayload.acc = accParam;

                  await dispatch(buyNow(buyPayload)).unwrap()
                  setShowSuccessModal(true)

               } catch (error) {
                  console.error('Finalization failed', error)
                  alert(error || 'Payment succeeded but enrollment failed. Please contact support.')
               }
            },
            prefill: {
               name: formData.fullName,
               email: formData.email,
               contact: formData.phone
            },
            notes: {
               courseId: course._id || '',
               planId: selectedPlan.id || ''
            },
            theme: { color: '#2171B5' }
         }

         const rzp = new window.Razorpay(options)
         rzp.on('payment.failed', function (resp) {
            console.error('Razorpay payment failed:', resp.error)
            alert(resp.error?.description || 'Payment failed. Please try again.')
         })
         rzp.open()
      } catch (err) {
         console.error('Order check failed', err)
         alert(err?.message || 'Order creation failed')
      }
   }

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      if (name === 'coupon' && value) {
         dispatch(validateCoupon(value));
      } else if (name === 'coupon' && !value) {
         dispatch(clearCoupon());
      }
   }

   const handleApplyCoupon = () => {
      if (formData.coupon) {
         dispatch(validateCoupon(formData.coupon))
      }
   }

   useEffect(() => {
      const localUser = (() => {
         try {
            return JSON.parse(localStorage.getItem('edrilla_user') || '{}')
         } catch { return {} }
      })()
      const verified = Boolean(
         authUser?.isVerified || authUser?.verified || authUser?.emailVerified ||
         localUser?.isVerified || localUser?.verified || localUser?.emailVerified
      )
      setIsVerified(verified)
   }, [authUser])

   const sendOtp = async () => {
      if (!formData.email) {
         setOtpMessage('Please enter an email to verify')
         return
      }
      setSendingOtp(true)
      setOtpMessage('')
      try {
         const res = await fetch(`${BASE_API}/sendotp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
         })
         const data = await res.json()
         if (!res.ok) throw new Error(data?.message || 'Failed to send OTP')
         if (data?.is_verify) {
            setIsVerified(true)
            setOtpMessage('Already verified')
            setShowOTPModal(false)
         } else {
            setOtpMessage(data?.message || 'OTP sent — check your email')
            setShowOTPModal(true)
         }
      } catch (err) {
         setOtpMessage(err.message || 'Network error')
      } finally {
         setSendingOtp(false)
      }
   }

   const verifyOtp = async () => {
      if (!otp) {
         setOtpMessage('Enter the OTP')
         return
      }
      setVerifyingOtp(true)
      setOtpMessage('')
      try {
         const res = await fetch(`${BASE_API}/verifyotp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp })
         })
         const data = await res.json()
         if (!res.ok) throw new Error(data?.message || 'OTP verification failed')
         setIsVerified(true)
         if (data?.data?.user) {
            try { localStorage.setItem('edrilla_user', JSON.stringify(data.data.user)) } catch { }
         }
         setOtpMessage('Email verified')
         setShowOTPModal(false)
         setOtp('')
      } catch (err) {
         setOtpMessage(err.message || 'Verification failed')
      } finally {
         setVerifyingOtp(false)
      }
   }

   // Dynamic course thumbnail / banner resolution
   const courseImageSrc = course?.thumbnail
      ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${BASE_API}/${course.thumbnail.replace(/^\//, '')}`)
      : course?.image
      ? (course.image.startsWith('http') ? course.image : `${BASE_API}/${course.image.replace(/^\//, '')}`)
      : course?.banner
      ? (course.banner.startsWith('http') ? course.banner : `${BASE_API}/${course.banner.replace(/^\//, '')}`)
      : null;

   return (
      <div ref={checkoutRef} className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">

         {/* GLOBAL BACK BUTTON */}
         <button
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 hover:border-blue-400 transition-all duration-300 rounded-none shadow-lg cursor-pointer"
         >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="stroke-white">
               <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider">Back</span>
         </button>

         {/* -------------------- LEFT WING: DYNAMIC COURSE POSTER -------------------- */}
         <div className="lg:w-[42%] h-[60vh] min-h-[480px] lg:h-screen lg:sticky top-0 bg-slate-950 overflow-hidden relative border-r border-slate-800">

            {/* Background / Course Poster */}
            <div className="absolute inset-0 group">
               {courseImageSrc ? (
                  <img
                     src={courseImageSrc}
                     alt={course?.title || 'Course Poster'}
                     className="w-full h-full object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
                     onError={(e) => {
                        e.currentTarget.style.display = 'none';
                     }}
                  />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black opacity-95" />
               )}
               {/* Gradients */}
               <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/50" />
               <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95" />
            </div>

            {/* Scanning Overlay */}
            <div ref={scanLineRef} className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent z-10 opacity-50 shadow-[0_0_15px_rgba(33,113,181,0.6)]" />
            
            <div className="absolute inset-0 pointer-events-none z-10 p-6 sm:p-10 flex flex-col justify-between">

               {/* Top Ide ntity Block */}
               <div className="space-y-4 pt-14 sm:pt-16">
                  <div className="flex gap-2.5 items-center">
                     <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-none text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                        {course?.category?.name || 'Vedic Astrology'}
                     </span>
                     <span className="text-slate-400 text-xs">•</span>
                     <span className="text-slate-300 text-xs font-medium tracking-wide">
                        {course?.level?.[0] || 'Masterclass'}
                     </span>
                  </div>

                  <h2 className="font-newsreader italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight font-light drop-shadow-md">
                     {course?.title || 'Astrology Masterclass & Certification'}
                  </h2>

                  {course?.subtitle && (
                     <p className="text-xs text-slate-300/80 font-normal leading-relaxed line-clamp-2 max-w-md">
                        {course.subtitle}
                     </p>
                  )}

                  <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-none backdrop-blur-md">
                     <div className="w-2 h-2 bg-emerald-400 rounded-none animate-pulse" />
                     <span className="text-[10px] text-emerald-300 tracking-wider font-semibold uppercase">Happy Life Astro Certified</span>
                  </div>
               </div>

               {/* Bottom Total Block */}
               <div className="space-y-4 pb-2">
                  <div>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Enrollment Fee</p>
                     <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-newsreader italic text-4xl sm:text-5xl text-blue-400 tracking-tight leading-none drop-shadow-lg">
                           ₹{displayTotal}
                        </span>
                        <span className="text-xs text-blue-300/70 font-semibold uppercase">INR (Incl. GST)</span>
                     </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                     <CheckoutBreakdown
                        compact
                        basePrice={basePrice}
                        discount={discount}
                        gstRate={gstRate}
                        couponData={couponData}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* -------------------- RIGHT WING: SQUARE CARD-BASED FORM -------------------- */}
         <div className="lg:flex-1 bg-slate-50 pt-8 md:pt-12 px-4 sm:px-8 lg:px-12 pb-24">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               
               {/* Form Area */}
               <div className="lg:col-span-2 space-y-6">

                  {/* Header Title */}
                  <div className="mb-2">
                     <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Course Enrollment
                     </h1>
                     <p className="text-sm text-slate-500 mt-1">
                        {course?.title ? `Enrolling in ${course.title}` : 'Fill in your details to get instant access.'}
                     </p>
                  </div>

                  <form className="space-y-6">

                     {/* 01: STUDENT INFORMATION CARD (SQUARE) */}
                     <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 sm:p-7 space-y-5 transition-all hover:border-slate-400">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                           <span className="bg-blue-50 text-blue-700 border border-blue-300 text-xs font-bold w-7 h-7 rounded-none flex items-center justify-center">
                              01
                           </span>
                           <div>
                              <h3 className="font-bold text-base text-slate-900">Student Details</h3>
                              <p className="text-xs text-slate-500">Your account and certificate information</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                           {/* Full Name */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                 type="text"
                                 name="fullName"
                                 placeholder="e.g. Rahul Sharma"
                                 value={formData.fullName}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 text-sm px-4 py-2.5 rounded-none transition-all outline-none font-medium placeholder:text-slate-400"
                                 required
                              />
                           </div>

                           {/* Email */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 Email Address <span className="text-red-500">*</span>
                              </label>
                              <input
                                 type="email"
                                 name="email"
                                 placeholder="student@example.com"
                                 value={formData.email}
                                 disabled={isVerified}
                                 onChange={handleChange}
                                 className={`w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 text-slate-900 text-sm px-4 py-2.5 rounded-none transition-all outline-none font-medium placeholder:text-slate-400 ${
                                    isVerified ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                                 }`}
                                 required
                              />
                           </div>
                        </div>

                        {/* Email Verification Status / Action */}
                        <div className="pt-1 flex items-center justify-between">
                           {isVerified ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-300 rounded-none text-green-700 text-xs font-semibold">
                                 <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                 </svg>
                                 <span>Email Verified</span>
                              </div>
                           ) : (
                              <button
                                 type="button"
                                 onClick={sendOtp}
                                 disabled={sendingOtp || !formData.email}
                                 className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {sendingOtp ? 'Sending OTP...' : 'Verify Email'}
                              </button>
                           )}
                           {otpMessage && <span className="text-xs text-slate-500 font-medium">{otpMessage}</span>}
                        </div>
                     </div>

                     {/* 02: CONTACT & ORGANIZATION CARD (SQUARE) */}
                     <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 sm:p-7 space-y-5 transition-all hover:border-slate-400">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                           <span className="bg-blue-50 text-blue-700 border border-blue-300 text-xs font-bold w-7 h-7 rounded-none flex items-center justify-center">
                              02
                           </span>
                           <div>
                              <h3 className="font-bold text-base text-slate-900">Contact & Organization</h3>
                              <p className="text-xs text-slate-500">For notifications and invoices</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                           {/* Phone */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 Phone Number <span className="text-red-500">*</span>
                              </label>
                              <div className="flex rounded-none overflow-hidden border border-slate-300 hover:border-slate-400 focus-within:border-blue-600 transition-all">
                                 <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 flex items-center border-r border-slate-300">
                                    +91
                                 </span>
                                 <input
                                    type="tel"
                                    name="phone"
                                    placeholder="98765 43210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="flex-1 bg-slate-50 focus:bg-white text-slate-900 text-sm px-3.5 py-2.5 outline-none font-medium placeholder:text-slate-400 rounded-none"
                                    required
                                 />
                              </div>
                           </div>

                           {/* Organization / Company */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                 type="text"
                                 name="company"
                                 placeholder="Self / Company Name"
                                 value={formData.company}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white text-slate-900 text-sm px-4 py-2.5 rounded-none transition-all outline-none font-medium placeholder:text-slate-400"
                              />
                           </div>
                        </div>
                     </div>

                     {/* 03: COUPONS & TAX CARD (SQUARE) */}
                     <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 sm:p-7 space-y-5 transition-all hover:border-slate-400">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                           <span className="bg-blue-50 text-blue-700 border border-blue-300 text-xs font-bold w-7 h-7 rounded-none flex items-center justify-center">
                              03
                           </span>
                           <div>
                              <h3 className="font-bold text-base text-slate-900">Coupons & Tax</h3>
                              <p className="text-xs text-slate-500">Apply discount codes or add GSTIN</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                           {/* Coupon Code */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 Have a Coupon?
                              </label>
                              <div className="flex gap-2">
                                 <select
                                    name="coupon"
                                    value={formData.coupon}
                                    onChange={handleChange}
                                    className="flex-1 min-w-0 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white text-slate-900 text-xs px-3 py-2.5 rounded-none outline-none font-medium transition-all"
                                 >
                                    <option value="">Select coupon</option>
                                    {Array.isArray(coupons) && coupons.map(c => (
                                       <option key={c._id} value={c.code}>
                                          {c.code} - {c.discountType === 'percentage' ? `${c.discountPercent}% OFF` : `₹${c.discountAmount} OFF`}
                                       </option>
                                    ))}
                                 </select>
                                 <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !formData.coupon}
                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-none transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    {couponLoading ? '...' : 'Apply'}
                                 </button>
                              </div>
                              {couponError && <p className="text-xs text-red-500 font-semibold mt-1">{couponError}</p>}
                              {couponData && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Discount Applied: -₹{discount}</p>}
                           </div>

                           {/* GST Number */}
                           <div className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                 GST Number <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                 type="text"
                                 name="gst"
                                 placeholder="22AAAAA0000A1Z5"
                                 value={formData.gst}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:bg-white text-slate-900 text-sm px-4 py-2.5 rounded-none transition-all outline-none font-medium placeholder:text-slate-400 uppercase"
                              />
                           </div>
                        </div>
                     </div>

                     {/* COMPLETE PAYMENT BUTTON (SQUARE) */}
                     <div className="pt-2">
                        <button 
                           onClick={handlePayment} 
                           type="button" 
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-none font-bold text-base shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                           <span>Complete Payment • ₹{displayTotal}</span>
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                           </svg>
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                           <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              256-Bit SSL Encrypted
                           </span>
                           <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Instant LMS Access
                           </span>
                        </div>
                     </div>

                  </form>
               </div>

               {/* RIGHT SIDEBAR: Sticky breakdown on desktop */}
               <aside className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-20">
                     <CheckoutBreakdown
                        basePrice={basePrice}
                        discount={discount}
                        gstRate={gstRate}
                        couponData={couponData}
                     />
                  </div>
               </aside>
            </div>
         </div>

         {/* OTP MODAL */}
         {showOTPModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white border border-slate-300 p-6 rounded-none max-w-sm w-full shadow-2xl space-y-4">
                  <div>
                     <h3 className="font-bold text-lg text-slate-900">Verify Email Address</h3>
                     <p className="text-xs text-slate-500 mt-1">Enter the 6-digit OTP sent to <strong className="text-blue-600">{formData.email}</strong></p>
                  </div>
                  <input
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                     placeholder="Enter 6-digit OTP"
                     className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 text-sm rounded-none text-center tracking-widest font-mono font-bold outline-none"
                  />
                  <div className="flex gap-2.5 justify-end">
                     <button type="button" onClick={() => { setShowOTPModal(false); setOtp(''); setOtpMessage('') }} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-none text-xs font-semibold text-slate-700 cursor-pointer">
                        Cancel
                     </button>
                     <button type="button" onClick={verifyOtp} disabled={verifyingOtp} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50">
                        {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                     </button>
                  </div>
                  {otpMessage && <p className="text-xs text-slate-500 text-center font-medium">{otpMessage}</p>}
               </div>
            </div>
         )}

         {/* SUCCESS MODAL */}
         {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
               <div className="bg-white border border-slate-300 p-8 md:p-10 max-w-md w-full relative rounded-none shadow-2xl text-center space-y-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-none mx-auto flex items-center justify-center border border-emerald-300">
                     <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                     </svg>
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-2xl font-bold text-slate-900">Enrollment Confirmed!</h3>
                     <p className="text-sm text-slate-600">
                        Your payment was successful. The course has been activated on your account.
                     </p>
                  </div>

                  <button
                     onClick={() => navigate('/dashboard/my-courses')}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-none font-bold text-sm shadow-md hover:bg-blue-800 transition-all flex justify-center items-center gap-2 cursor-pointer"
                  >
                     <span>Go to My Courses</span>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                  </button>
               </div>
            </div>
         )}

      </div>
   )
}

export default Checkout
