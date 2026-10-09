import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const AboutSnapshot = () => {
   const containerRef = useRef(null);
   const imageRef = useRef(null);
   const textRef = useRef(null);

   useEffect(() => {
      const ctx = gsap.context(() => {
         // Image entrance
         gsap.from(imageRef.current, {
            scrollTrigger: {
               trigger: containerRef.current,
               start: 'top 80%',
            },
            x: -50,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
         });

         // Text stagger
         gsap.from('.snapshot-text', {
            scrollTrigger: {
               trigger: containerRef.current,
               start: 'top 75%',
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
         });
      }, containerRef);

      return () => ctx.revert();
   }, []);

   return (
      <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
         {/* Decorative background element */}
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-50 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
         
         <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left: Image Composite */}
            <div ref={imageRef} className="w-full lg:w-1/2 relative">
               <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-100">
                  <img 
                     src="/hero_section.png" 
                     alt="Bankers Grade Platform" 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
                     }}
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent mix-blend-overlay" />
               </div>
               
               {/* Floating stat card */}
               <div className="absolute -bottom-6 -right-6 md:bottom-10 md:-right-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px] animate-bounce-slow">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                     </svg>
                  </div>
                  <p className="text-2xl font-black text-slate-900 leading-none">100%</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Career Growth</p>
               </div>
            </div>

            {/* Right: Text Content */}
            <div ref={textRef} className="w-full lg:w-1/2">
               <div className="snapshot-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Who We Are
               </div>
               
               <h2 className="snapshot-text text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                  Your Ultimate Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Astrological Mastery.</span>
               </h2>
               
               <p className="snapshot-text text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                  Happy Life Astro is a premier online educational platform designed to empower learners with authentic Vedic Astrology, Vastu, Numerology, and spiritual wisdom. Transform your life and guide others with clarity and confidence.
               </p>

               <ul className="snapshot-text space-y-4 mb-10">
                  {[
                     "Comprehensive Vedic Astrology, Vastu & Numerology courses",
                     "Live interactive workshops & masterclasses by Dr. Yogesh Sharma",
                     "Verified certifications, personalized mentorship & study guides"
                  ].map((item, index) => (
                     <li key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                           </svg>
                        </div>
                        {item}
                     </li>
                  ))}
               </ul>

               <div className="snapshot-text">
                  <Link to="/about-us" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-amber-500 transition-colors duration-300 group">
                     Discover Our Story
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                     </svg>
                  </Link>
               </div>
            </div>

         </div>
      </section>
   );
};

export default AboutSnapshot;
