import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-animate', 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out' }
      );

      // Section scroll animations
      gsap.utils.toArray('.scroll-section').forEach(section => {
        gsap.fromTo(section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            }
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden pt-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-100 rounded-full blur-[120px] -z-10" />
        
        <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-8 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Our Story
        </div>
        
        <h1 className="hero-animate font-black text-slate-900 mb-8 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
          Transforming Lives Through <br className="hidden md:block" />
          Vedic Wisdom <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">& Practical Remedies.</span>
        </h1>
        
        <p className="hero-animate text-lg md:text-2xl text-slate-600 max-w-3xl leading-relaxed font-medium">
          Happy Life Astro is an astrology and Vastu consultancy led by Dr. Yogesh Sharma, dedicated to providing practical, logical, and doable remedies for modern life challenges.
        </p>
      </section>

      {/* 2. STATS SECTION */}
      <section className="scroll-section px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-slate-100">
          {[
            { value: "500K+", label: "Community Members" },
            { value: "15+ Yrs", label: "Astrological Experience" },
            { value: "100%", label: "Logical & Non-Superstitious" },
            { value: "24/7", label: "Learning & Guidance Access" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4">
              <span className="text-3xl md:text-5xl font-black text-slate-900 mb-2">{stat.value}</span>
              <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WHO WE ARE & MISSION */}
      <section className="scroll-section px-6 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:h-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Dr. Yogesh Sharma Guidance" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <h3 className="text-white text-3xl font-bold mb-3">Our Mission</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                To simplify the profound science of Vedic Astrology, Numerology, and Vastu Shastra into practical, actionable habits that bring peace, health, financial prosperity, and mental clarity.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="font-black text-slate-900 mb-8 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
              Astrology that works <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-[#2171B5]">for your modern life.</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                We believe astrology is a blueprint of planetary energies—not a system of fear or fatalism. Dr. Yogesh Sharma brings a refreshing, unorthodox approach: no black magic, no overnight false guarantees, and no burdensome rituals.
              </p>
              <p>
                Whether dealing with career bottlenecks, financial struggles, relationship friction, or home energy imbalances (Vastu dosha), our consultations and courses empower you with easy, everyday remedies that yield real harmony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY OFFERINGS */}
      <section className="scroll-section px-6 py-24 bg-slate-900 text-white mt-16 rounded-[3rem] mx-4 md:mx-10 relative overflow-hidden">
        {/* Dark theme decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-black mb-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Our Key Focus Areas</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">Comprehensive Astro-Vastu guidance and learning modules designed to harmonize your life.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Vedic Kundli Analysis",
                desc: "In-depth birth chart analysis decoding planetary positions, mahadashas, and life transitions."
              },
              {
                icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Non-Destructive Vastu Shastra",
                desc: "Identify and rectify spatial energy imbalances in your home or office without demolition."
              },
              {
                icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Planetary Remedies (Upay)",
                desc: "Practical, cost-effective daily remedies for Rahu, Ketu, Shani, and Venus alignments."
              },
              {
                icon: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Numerology & Name Correction",
                desc: "Align your life path and business names with supportive numerical frequencies."
              },
              {
                icon: <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Live Webinars & Masterclasses",
                desc: "Interactive video sessions and courses directly mentored by Dr. Yogesh Sharma."
              },
              {
                icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
                title: "Horoscope & Transit Forecasts",
                desc: "Monthly and annual astrological forecasts for all 12 zodiac signs from Aries to Pisces."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors backdrop-blur-sm group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
