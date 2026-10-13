import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import { useLanguage } from '../context/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

const defaultFaqData = {
  Content: [
    { id: "01", q: "How often is new astrological content added?", a: "We regularly update course modules, case studies, and practical chart analyses to ensure you have the latest predictive insights." },
    { id: "02", q: "Are these courses suitable for beginners?", a: "Yes! Our curriculum is designed to guide you step-by-step from core Vedic astrology fundamentals to advanced chart interpretation." },
    { id: "03", q: "How long do I have access to the lessons?", a: "You have 24/7 unlimited access to all course modules and video lessons based on your enrollment plan (1 Month, 3 Months, or 1 Year)." },
    { id: "04", q: "Can I revisit previous lessons after completing them?", a: "Yes. Your active enrollment allows unlimited revisits to any module you've unlocked to practice and refine your knowledge." },
    { id: "05", q: "Is there a certification upon course completion?", a: "Yes, you will receive an official, verified Happy Life Astro Certificate of Completion upon finishing all modules." },
    { id: "06", q: "Can I interact with instructors or ask questions?", a: "Yes, questions can be submitted via the student discussion forum and during scheduled live Q&A sessions." }
  ],
  Subscription: [
    { id: "s01", q: "What are the benefits of enrolling in this course?", a: "Immediate access to high-definition video masterclasses, detailed course notes, divisional chart blueprints, and certification." },
    { id: "s02", q: "How do I enroll in the course?", a: "Select your desired access plan on the pricing section, click 'Continue to Buy', and complete the secure payment." },
    { id: "s03", q: "What payment methods are supported?", a: "We support all major payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking." },
    { id: "s04", q: "Can I access the course on multiple devices?", a: "Yes, your account allows flexible learning on laptop, desktop, tablet, and mobile browsers." }
  ],
  Technical: [
    { id: "t01", q: "What are the system requirements for streaming?", a: "A modern web browser (Chrome, Safari, Edge, or Firefox) and a standard broadband or 4G/5G mobile connection." },
    { id: "t02", q: "Is the platform mobile compatible?", a: "Yes! The LMS dashboard and video players are fully responsive and optimized for mobile learning." },
    { id: "t03", q: "What if a video does not play or load?", a: "Ensure hardware acceleration is enabled in your browser and your connection is stable. You can also contact support for assistance." }
  ]
}

const FAQSection = ({ course }) => {
  const containerRef = useRef(null)
  const { t } = useLanguage()

  // Format custom course FAQs from admin if available
  const courseCustomFaqs = Array.isArray(course?.faqs) && course.faqs.length > 0
    ? course.faqs.map((f, i) => ({
        id: f._id || `c-faq-${i}`,
        q: f.question || f.q,
        a: f.answer || f.a,
        category: f.category || 'Course FAQs'
      }))
    : [];

  const dynamicFaqData = {
    ...(courseCustomFaqs.length > 0 ? { 'Course FAQs': courseCustomFaqs } : {}),
    ...defaultFaqData
  };

  const categories = Object.keys(dynamicFaqData);
  const [activeTab, setActiveTab] = useState(categories[0] || 'Content');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !dynamicFaqData[activeTab]) {
      setActiveTab(categories[0]);
    }
  }, [course]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-box',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          }
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [activeTab])

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto py-20 relative px-4 sm:px-6">

      {/* 1. Header Area with Mode Switcher */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-accent" />
          <span className="font-montserrat text-xs text-accent tracking-[0.3em] uppercase font-bold">Frequently Asked Questions</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <h2 className="font-montserrat text-normal max-w-2xl text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            Everything you need to know about our astrological masterclasses.
          </h2>

          <div className="flex gap-4 border-b border-border pb-2 overflow-x-auto no-scrollbar">
            {categories.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setHoveredId(null)
                }}
                className={`font-montserrat text-xs tracking-wider uppercase font-bold transition-all duration-300 pb-2 relative whitespace-nowrap cursor-pointer
                       ${activeTab === tab ? 'text-accent font-black' : 'text-description hover:text-normal'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-accent" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FAQ Accordion Items */}
      <div className="space-y-3">
        {dynamicFaqData[activeTab]?.map((item) => (
          <div
            key={item.id}
            className={`faq-box group border rounded-none transition-all duration-300 overflow-hidden
              ${hoveredId === item.id 
                ? 'border-accent bg-accent/[0.04] shadow-md' 
                : 'border-border bg-card hover:border-accent/40 hover:bg-slate-50/50 shadow-sm'}`}
          >
            <button
              onClick={() => setHoveredId(hoveredId === item.id ? null : item.id)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <h4 className="font-montserrat text-xl md:text-2xl text-normal font-semibold tracking-tight leading-snug group-hover:text-accent transition-colors">
                  {item.q}
                </h4>
              </div>

              <div className={`shrink-0 w-8 h-8 rounded-none border flex items-center justify-center transition-all duration-300
                 ${hoveredId === item.id ? 'rotate-45 border-accent bg-accent text-white' : 'border-border bg-slate-50 text-description group-hover:border-accent/60 group-hover:text-normal'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </button>

            {/* Answer Body */}
            {hoveredId === item.id && (
              <div className="px-5 md:px-6 pb-6 pt-0 border-t border-border/50 mt-2">
                <p className="font-montserrat text-sm md:text-base text-description leading-relaxed max-w-3xl pt-4 font-normal">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  )
}

export default FAQSection
