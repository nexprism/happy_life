import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents } from '../redux/slices/eventSlice'
import CourseCard from '../components/CourseCard'
import EventHero from '../components/EventHero'
import RollingText from '../components/RollingText'
import { eventData as fallbackEventData } from '../constants/events'
import { useLanguage } from '../context/LanguageContext'
import gsap from 'gsap'

const getImageUrl = (thumb) => {
  if (!thumb) return '/courses/workshop.png'
  const normalized = String(thumb).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(normalized)) return normalized
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com'
  return normalized.startsWith('/') ? `${baseUrl}${normalized}` : `${baseUrl}/${normalized}`
}

const Events = () => {
  const dispatch = useDispatch()
  const { eventList, loading } = useSelector((state) => state.events || {})
  const authUser = useSelector((state) => state.auth?.user)
  const { t } = useLanguage()

  const [activeEventModal, setActiveEventModal] = useState(null)
  const [eventFormData, setEventFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regError, setRegError] = useState('')
  const [banners, setBanners] = useState([])

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com'
        const res = await fetch(`${BASE_URL}/banners?isActive=true`)
        if (res.ok) {
          const json = await res.json()
          const list = json?.data?.banners || []
          const activeEventBanners = list.filter(
            (b) => b.isActive !== false && (!b.type || b.type === 'all_events' || b.type === 'event')
          )
          activeEventBanners.sort((a, b) => (b.priority || 0) - (a.priority || 0))
          setBanners(activeEventBanners)
        }
      } catch (err) {
        console.error('Failed to load event banners:', err)
      }
    }
    loadBanners()
  }, [])

  useEffect(() => {
    dispatch(fetchEvents({ status: 'published', limit: 50 }))
    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      gsap.from('.events-hero-reveal', {
        y: 40,
        opacity: 0,
        filter: 'blur(10px)',
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out'
      })
    })

    return () => ctx.revert()
  }, [dispatch])

  useEffect(() => {
    if (authUser) {
      setEventFormData({
        fullName: authUser.name || authUser.fullName || '',
        email: authUser.email || '',
        phone: authUser.phone || authUser.mobile || ''
      })
    }
  }, [authUser])

  const openEventModal = (event) => {
    setActiveEventModal(event)
    setRegSuccess(false)
    setRegError('')
  }

  const handleRegisterEvent = async (e) => {
    e.preventDefault()
    if (!activeEventModal) return

    setIsRegistering(true)
    setRegError('')

    const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://happy-life-sx03.onrender.com'
    const token = typeof window !== 'undefined' ? localStorage.getItem('edrilla_token') : null
    const headers = {
      'Content-Type': 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const rawPrice = activeEventModal.price ? parseFloat(activeEventModal.price.toString()) : 0

      if (rawPrice > 0) {
        // Paid Event
        const checkRes = await fetch(`${BASE_URL}/events/${activeEventModal._id || activeEventModal.id}/check-register`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            guestEmail: eventFormData.email,
            guestName: eventFormData.fullName,
            is_verify: true
          })
        })
        const checkData = await checkRes.json()

        if (!checkRes.ok || !checkData.success) {
          throw new Error(checkData.message || 'Unable to register for this event')
        }

        if (checkData.is_valid === false) {
          throw new Error(checkData.message || 'Already registered or registration unavailable')
        }

        if (checkData.razorpay) {
          const loadRazorpayScript = () => new Promise((resolve, reject) => {
            if (window.Razorpay) return resolve(true)
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
            document.body.appendChild(script)
          })

          await loadRazorpayScript()

          const options = {
            key: checkData.razorpay.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: checkData.razorpay.order?.amount || Math.round((checkData.razorpay.amount || 0) * 100),
            currency: checkData.razorpay.currency || 'INR',
            name: 'Happy Life Astro',
            description: `Event: ${activeEventModal.title}`,
            order_id: checkData.razorpay.order?.id,
            prefill: {
              name: eventFormData.fullName,
              email: eventFormData.email,
              contact: eventFormData.phone || ''
            },
            handler: async function (response) {
              try {
                const regRes = await fetch(`${BASE_URL}/events/${activeEventModal._id || activeEventModal.id}/register`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    guestEmail: eventFormData.email,
                    guestName: eventFormData.fullName,
                    guestPhone: eventFormData.phone
                  })
                })
                const regData = await regRes.json()
                if (regRes.ok && regData.success) {
                  setRegSuccess(true)
                } else {
                  setRegError(regData.message || 'Payment confirmation failed')
                }
              } catch (err) {
                setRegError(err.message || 'Payment processing error')
              }
            }
          }

          const rzp = new window.Razorpay(options)
          rzp.open()
        }
      } else {
        // Free Event Registration
        const regRes = await fetch(`${BASE_URL}/events/${activeEventModal._id || activeEventModal.id}/register`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            guestEmail: eventFormData.email,
            guestName: eventFormData.fullName,
            guestPhone: eventFormData.phone
          })
        })
        const regData = await regRes.json()
        if (regRes.ok && regData.success) {
          setRegSuccess(true)
        } else {
          setRegError(regData.message || 'Event registration failed')
        }
      }
    } catch (err) {
      setRegError(err.message || 'Failed to complete registration')
    } finally {
      setIsRegistering(false)
    }
  }

  // Use API events if available, otherwise display curated events
  const displayedEvents = (eventList && eventList.length > 0) ? eventList : fallbackEventData
  // Display active admin banners in the hero section; fall back to displayedEvents if no banners are defined
  const heroItems = (banners && banners.length > 0) ? banners : displayedEvents

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 min-h-screen pt-28 pb-24 px-4 md:px-12 selection:bg-accent selection:text-white">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* 1. Header Section */}
        <div className="events-hero-reveal flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200/80 pb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-montserrat text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Live & Upcoming
            </div>
            <h1 className="font-montserrat text-slate-900 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Upcoming <span className="text-accent">Events</span>
            </h1>
            <p className="font-montserrat text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Join live interactive masterclasses, experiential Astro-Vastu workshops, and exclusive gatherings led by Dr. Yogesh Sharma.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-montserrat text-slate-500 uppercase tracking-widest font-bold">
            <span className="text-accent">•</span> <span>HYBRID SESSIONS</span>
            <span className="text-accent">•</span> <span>REMOTELY AVAILABLE</span>
          </div>
        </div>

        {/* 2. Optional Highlight Showcase Banner */}
        {heroItems && heroItems.length > 0 && (
          <div className="events-hero-reveal rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
            <EventHero events={heroItems} />
          </div>
        )}

        {/* 3. Event Cards Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              All Scheduled Sessions
            </h2>
            <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-slate-500">
              {displayedEvents.length} {displayedEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-24 text-accent font-montserrat font-bold tracking-widest animate-pulse">
                LOADING UPCOMING EVENTS...
              </div>
            ) : displayedEvents.map((event) => {
              const eventPrice = event.price ? `₹${event.price}` : (event.originalPrice ? `₹${event.originalPrice}` : 'FREE')
              const eventType = event.type ? event.type.toUpperCase() : ''
              const eventCategory = event.category ? event.category.toUpperCase() : 'EVENT'
              const categoryBadge = eventType ? `${eventType} • ${eventCategory}` : eventCategory

              return (
                <CourseCard
                  key={event._id || event.id}
                  item={{
                    id: event._id || event.id,
                    title: event.title,
                    category: categoryBadge,
                    description: event.description,
                    image: getImageUrl(event.thumbnail || event.image),
                    landingPageUrl: event.landingPageUrl,
                    buttonText: event.landingPageUrl ? (event.buttonText || 'EXPLORE MORE') : (event.buttonText || (eventPrice === 'FREE' ? 'Register Free' : `Register • ${eventPrice}`)),
                    price: eventPrice,
                    isNew: event.isNew !== undefined ? event.isNew : true,
                    onRegister: () => openEventModal(event)
                  }}
                  onRegister={() => openEventModal(event)}
                  variant="event"
                />
              )
            })}
          </div>
        </div>

      </div>

      {/* 4. Event Registration Modal */}
      {activeEventModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveEventModal(null)
          }}
          className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveEventModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
            >
              ✕
            </button>

            {regSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h3 className="font-montserrat text-2xl font-bold text-slate-900">Registration Successful!</h3>
                <p className="font-montserrat text-xs text-slate-600">
                  You are registered for <span className="font-bold text-slate-900">{activeEventModal.title}</span>. Access details have been sent to your email.
                </p>
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="px-6 py-2.5 bg-accent text-white rounded-full font-montserrat text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterEvent} className="space-y-6">
                <div>
                  <span className="text-[10px] font-montserrat font-bold tracking-widest text-accent uppercase">
                    Event Registration
                  </span>
                  <h3 className="font-montserrat text-2xl font-bold text-slate-900 mt-1 leading-tight">
                    {activeEventModal.title}
                  </h3>
                  <p className="font-montserrat text-xs text-slate-500 mt-1">
                    {activeEventModal.price ? `Admission: ₹${activeEventModal.price}` : 'Admission: Free'}
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-montserrat">
                    {regError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.fullName}
                      onChange={(e) => setEventFormData({ ...eventFormData, fullName: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={eventFormData.email}
                      onChange={(e) => setEventFormData({ ...eventFormData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={eventFormData.phone}
                      onChange={(e) => setEventFormData({ ...eventFormData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3.5 bg-accent text-white font-montserrat text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isRegistering ? 'Processing...' : (activeEventModal.price ? `Proceed to Pay • ₹${activeEventModal.price}` : 'Confirm Free Registration')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
