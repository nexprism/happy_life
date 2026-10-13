import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import RollingText from '../components/RollingText'
import CourseCard from '../components/CourseCard'

const questions = [
  { id: 1, text: "You feel more energized after spending time with a group of people.", trait: 'E' },
  { id: 2, text: "You enjoy vibrant social events with lots of people.", trait: 'E' },
  { id: 3, text: "You often spend time exploring unrealistic yet intriguing ideas.", trait: 'N' },
  { id: 4, text: "Your travel plans are more likely to look like a rough list of ideas than a detailed itinerary.", trait: 'P' },
  { id: 5, text: "You rely more on your heart than your head when making important decisions.", trait: 'F' },
  { id: 6, text: "At a party, you tend to stand near the walls rather than in the center of the room.", trait: 'I' },
  { id: 7, text: "You prioritize logic over emotions in difficult situations.", trait: 'T' },
]

const resultData = {
  type: 'ENFP',
  name: 'Campaigner',
  shortIntro: 'Enthusiastic, creative, and sociable free spirits, who can always find a reason to smile.',
  tags: ['EXTROVERTED', 'INTUITIVE', 'FEELING', 'PROSPECTING'],
  traits: [
    { left: 'INTROVERTED', right: 'EXTROVERTED', score: 100, activeSide: 'right' },
    { left: 'OBSERVANT', right: 'INTUITIVE', score: 88, activeSide: 'right' },
    { left: 'THINKING', right: 'FEELING', score: 100, activeSide: 'right' },
    { left: 'JUDGING', right: 'PROSPECTING', score: 91, activeSide: 'right' },
  ],
  tabs: {
    overview: {
      title: 'Characteristics',
      content: [
        'ENFPs, also known as Campaigners, are enthusiastic, creative, and sociable free spirits.',
        'They are extroverted, intuitive, feeling and perceiving.',
        'ENFPs are known for their infectious energy and enthusiasm, their deep curiosity about the world, and their ability to inspire and motivate others.',
        'They thrive on human connections and seek to understand and explore new possibilities and ideas.'
      ]
    },
    strengths: {
      title: 'Strengths',
      content: [
        'Excellent communicators and motivators who inspire those around them.',
        'Highly creative with a unique ability to connect seemingly unrelated ideas.',
        'Intuitive and empathetic, able to understand others\' deeper emotions and motivations.',
        'Passionate about personal growth and exploring fresh perspectives.'
      ]
    },
    career: {
      title: 'Career Paths',
      content: [
        'Creative fields such as writing, design, and entertainment.',
        'People-oriented roles like counseling, coaching, and public relations.',
        'Innovative environments where brainstorming and unconventional ideas are valued.',
        'Non-profit and advocacy work that aligns with their personal values.'
      ]
    }
  },
  recommendedCourses: [
    { 
        id: 1, 
        category: "MARKETING",
        title: "Vibe Marketing", 
        description: "Build a brand that resonates on a human level. Master the art of emotional connection as an ENFP.",
        price: "$199.00",
        image: "/courses/course_1.png" 
    },
    { 
        id: 2, 
        category: "ENTREPRENEURSHIP",
        title: "Solopreneur", 
        description: "Turn your creative energy into a sustainable business model that preserves your freedom.",
        price: "$249.00",
        image: "/courses/course_2.png" 
    },
    { 
        id: 3, 
        category: "ADVERTISING",
        title: "Facebook Ads Mastery", 
        description: "Reach the right audience with your message through precise targeting and storytelling.",
        price: "$159.00",
        image: "/courses/architecture.png" 
    },
    { 
        id: 4, 
        category: "CREATIVE",
        title: "The Art of Content", 
        description: "Channel your intuition into high-impact content that inspires and motivates your audience.",
        price: "$129.00",
        image: "/courses/motion.png" 
    },
    { 
        id: 5, 
        category: "BRANDING",
        title: "Branding Masterclass", 
        description: "Develop a unique brand identity that reflects your authentic self and values.",
        price: "$299.00",
        image: "/courses/typography.png" 
    }
  ]
}

const PersonalityTest = () => {
  const containerRef = useRef(null)
  const dashboardRef = useRef(null)
  const [testState, setTestState] = useState('intro') // 'intro', 'quiz', 'calculating', 'results'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      if (testState === 'intro') {
        gsap.fromTo('.pt-reveal', 
          { y: 60, opacity: 0, filter: 'blur(20px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power4.out', stagger: 0.2 }
        )
      } else if (testState === 'quiz') {
         gsap.fromTo('.quiz-content-reveal', 
          { y: 40, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out', stagger: 0.1 }
        )
      } else if (testState === 'results') {
        gsap.fromTo('.result-reveal', 
          { y: 40, opacity: 0, filter: 'blur(10px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out', stagger: 0.15 }
        )
      }
    }, containerRef)
    return () => ctx.revert()
  }, [testState])

  const handleStart = () => {
    gsap.to('.pt-reveal', {
      y: -40, opacity: 0, filter: 'blur(20px)', duration: 0.8, ease: 'power4.in',
      onComplete: () => setTestState('quiz')
    })
  }

  const handleAnswer = (score) => {
    const updatedAnswers = { ...answers, [questions[currentIndex].id]: score }
    setAnswers(updatedAnswers)
    
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        gsap.to('.quiz-inner', {
            y: -20, opacity: 0, duration: 0.4, ease: 'power2.in',
            onComplete: () => {
                setCurrentIndex(currentIndex + 1)
                gsap.fromTo('.quiz-inner', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })
            }
        })
      }, 300)
    } else {
      setTestState('calculating')
      setTimeout(() => setTestState('results'), 2500)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      gsap.to('.quiz-inner', {
        y: 20, opacity: 0, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          setCurrentIndex(currentIndex - 1)
          gsap.fromTo('.quiz-inner', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })
        }
      })
    }
  }

  if (testState === 'results') {
    return (
      <div ref={containerRef} className="min-h-screen bg-dark pt-44 pb-24 px-4 md:px-12 relative">
         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="pt-bg-circle absolute top-1/4 -left-20 w-[800px] h-[800px] border border-accent/20 blur-[150px] opacity-20 rounded-full" />
            <div className="pt-bg-circle absolute bottom-1/4 -right-20 w-[600px] h-[600px] border border-accent/10 blur-[120px] opacity-10 rounded-full" />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-20 mb-24 result-reveal">
                <div className="w-48 h-48 bg-accent rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(139, 92, 246,0.3)] shrink-0 group hover:scale-105 transition-transform duration-500">
                   <div className="text-center">
                     <span className="block text-dark font-montserrat text-5xl font-bold tracking-tighter leading-none mb-1">{resultData.type}</span>
                     <span className="block text-dark/60 font-montserrat text-[9px] font-bold tracking-[0.2em] uppercase">Core Alpha</span>
                   </div>
                </div>
                <div className="text-center md:text-left pt-4">
                  <h1 className="font-montserrat text-normal mb-6 overflow-visible text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                    Your Type: <span className="text-accent underline-lime">{resultData.name}</span>
                  </h1>
                  <p className="font-montserrat text-xs md:text-sm text-description/80 max-w-2xl leading-relaxed uppercase tracking-widest mb-10">
                    {resultData.shortIntro}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {resultData.tags.map((tag, i) => (
                        <span key={i} className="px-6 py-2 border border-white/10 rounded-full font-montserrat text-[9px] font-bold text-accent tracking-[0.2em] bg-white/5 uppercase">
                            {tag}
                        </span>
                    ))}
                  </div>
                </div>
            </div>

            {/* Main Interactive Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-32">
                {/* Left: Traits */}
                <div className="lg:col-span-5 space-y-10 result-reveal">
                   <div className="flex items-center gap-6 mb-12">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_#8B5CF6]" />
                      <h3 className="font-montserrat text-[14px] font-bold tracking-[0.5em] text-normal uppercase">Biological Calibration</h3>
                   </div>
                   {resultData.traits.map((trait, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="flex justify-between items-center mb-5">
                            <span className={`font-montserrat text-[9px] font-bold tracking-[0.3em] transition-colors duration-500 ${trait.activeSide === 'left' ? 'text-accent' : 'text-description/80'}`}>{trait.left}</span>
                            <span className={`font-montserrat text-[9px] font-bold tracking-[0.3em] transition-colors duration-500 ${trait.activeSide === 'right' ? 'text-accent' : 'text-description/80'}`}>{trait.right}</span>
                        </div>
                        <div className="h-[2px] bg-white/5 rounded-full relative overflow-hidden">
                            <div 
                              className="absolute h-full bg-accent shadow-[0_0_20px_#8B5CF6] transition-all duration-[2000ms] ease-out-quart"
                              style={{ width: `${trait.score}%`, left: trait.activeSide === 'right' ? 'auto' : 0, right: trait.activeSide === 'right' ? 0 : 'auto' }}
                            />
                        </div>
                        <div className="mt-3 flex justify-between">
                            <span className="font-montserrat text-[8px] text-description/80 tracking-[0.4em] uppercase">Core Accuracy Threshold 99.8%</span>
                            <span className="font-montserrat text-[14px] font-bold text-accent tracking-widest">{trait.score}% {trait.activeSide === 'right' ? trait.right : trait.left}</span>
                        </div>
                      </div>
                   ))}
                </div>

                {/* Right: Detailed Analysis Tabs */}
                <div className="lg:col-span-7 flex flex-col result-reveal">
                    <div className="flex border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
                        {Object.keys(resultData.tabs).map((tabKey) => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`px-10 py-5 font-montserrat text-[14px] font-bold tracking-[0.5em] uppercase transition-all relative shrink-0
                                    ${activeTab === tabKey ? 'text-accent' : 'text-description/80 hover:text-normal'}`}
                            >
                                {tabKey}
                                {activeTab === tabKey && (
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-accent shadow-[0_0_10px_#8B5CF6]" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-10 md:p-14 lg:p-16 rounded-[2rem] flex-1 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <span className="font-montserrat text-[90px] font-black tracking-tighter text-white leading-none">0{Object.keys(resultData.tabs).indexOf(activeTab) + 1}</span>
                        </div>
                        <h4 className="font-montserrat text-4xl text-normal mb-10 font-semibold tracking-tight underline-lime decoration-accent/30">{resultData.tabs[activeTab].title}</h4>
                        <div className="space-y-8">
                            {resultData.tabs[activeTab].content.map((p, i) => (
                                <p key={i} className="font-montserrat text-[11px] text-description/80 leading-[2.2] tracking-widest uppercase">
                                    <span className="text-accent/30 mr-4 font-bold">»</span> {p}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Courses Section */}
            <div className="result-reveal pt-12 border-t border-white/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
                    <div>
                        <h2 className="font-montserrat text-normal mb-4 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Recommended Architecture</h2>
                        <p className="font-montserrat text-[9px] text-description/80 tracking-[0.5em] uppercase">Accelerated learning paths tailored to your frequency.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border border-dark bg-accent flex items-center justify-center text-dark font-bold text-[8px]">AM</div>
                            <div className="w-10 h-10 rounded-full border border-dark bg-white/20 backdrop-blur-sm flex items-center justify-center text-normal font-bold text-[8px]">+4</div>
                        </div>
                        <span className="font-montserrat text-[8px] font-bold text-description/30 tracking-[0.2em] uppercase">Join the Campaigner Network</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                   {resultData.recommendedCourses.map((course, i) => (
                      <div key={course.id} className="group">
                        <CourseCard 
                            item={course}
                            variant="course"
                        />
                      </div>
                   ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-12 border-t border-white/5">
                   <button 
                      onClick={() => { setTestState('intro'); setCurrentIndex(0); setAnswers({}); }}
                      className="group flex items-center gap-6 px-12 py-5 border border-white/10 font-montserrat text-[14px] font-bold tracking-[0.4em] uppercase text-description/80 hover:text-normal hover:bg-white/5 transition-all duration-500 rounded-full"
                   >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-180 transition-transform duration-700 opacity-40"><path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3" /></svg>
                      RESET TEST PROTOCOL
                   </button>
                   <Link 
                      to="/"
                      className="group relative px-20 py-5 bg-accent text-dark font-montserrat text-[11px] font-bold tracking-[0.5em] uppercase shadow-accent-soft hover:scale-105 transition-all duration-500 overflow-hidden"
                   >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                      RETURN TO HUB
                   </Link>
                </div>
            </div>
         </div>
      </div>
    )
  }

  if (testState === 'calculating') {
    return (
        <div className="h-screen bg-dark pt-32 pb-12 px-4 md:px-12 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="relative w-24 h-24 mb-12">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
                <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin shadow-[0_0_20px_rgba(139, 92, 246,0.3)]" />
            </div>
            <h2 className="font-montserrat text-normal mb-4 opacity-0 animate-reveal-up text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Synthesizing Your Frequency</h2>
            <p className="font-montserrat text-[9px] text-description tracking-[0.5em] uppercase opacity-30 animate-pulse">Mapping Core Intelligence...</p>
        </div>
    )
  }

  return (
    <div ref={containerRef} className="h-[100dvh] bg-dark pt-20 md:pt-24 pb-12 px-4 md:px-12 flex flex-col items-center justify-start relative overflow-hidden">
      
      {/* Editorial Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="pt-bg-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[0.5px] border-white/5 rounded-full scale-125" />
        <div className="pt-bg-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-[0.5px] border-white/5 rounded-full scale-110" />
        {/* Mobile specific glow */}
        <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-accent/5 blur-[100px] rounded-full" />
      </div>

      {testState === 'intro' ? (
        <div className="max-w-4xl w-full text-center relative z-10 flex-1 flex flex-col justify-between py-8 md:py-12 lg:py-16">
          <div className="pt-reveal flex flex-col items-center">
             <span className="block font-montserrat text-[9px] md:text-[10px] text-accent tracking-[0.5em] md:tracking-[0.8em] uppercase mb-4 opacity-70">
                Core Matrix / Frequency Scan
             </span>
             <div className="w-[1px] h-12 md:h-20 bg-accent/20" />
          </div>

          <div className="pt-reveal">
            <h1 className="font-montserrat text-normal mb-8 md:mb-10 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
              Discover Your <br />
              <span className="text-accent underline-lime">Frequency</span>
            </h1>
            <p className="font-montserrat text-[9px] md:text-[10px] text-description/80 max-w-sm md:max-w-xl mx-auto leading-[2] tracking-[0.3em] uppercase">
              Map your core traits against the <br className="md:hidden" /> intelligence matrix.
            </p>
          </div>

          <div className="pt-reveal flex flex-col items-center gap-8 md:gap-10">
            <div className="hidden md:flex items-center gap-10 opacity-20">
                <span className="font-montserrat text-[8px] tracking-[0.4em] uppercase">Status: Initializing</span>
                <div className="w-24 h-[1px] bg-white/20" />
                <span className="font-montserrat text-[8px] tracking-[0.4em] uppercase">Protocol: A-01</span>
            </div>
            <button 
              onClick={handleStart} 
              className="group relative overflow-hidden bg-accent text-dark px-14 md:px-20 py-5 md:py-6 font-montserrat text-[14px] md:text-[11px] font-bold tracking-[0.5em] md:tracking-[0.6em] uppercase shadow-accent-soft hover:scale-[1.02] active:scale-95 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
              <RollingText text="INITIALIZE TEST" />
            </button>
            <span className="md:hidden font-montserrat text-[7px] text-description/80 tracking-[0.5em] uppercase">Est. Time: 03:00 / Scan</span>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl w-full relative z-10 flex flex-col h-full grow py-8 md:py-12">
            
            <div className="quiz-inner w-full flex flex-col h-full justify-between">
                {/* HUD / Progress */}
                <div className="w-full flex items-center justify-center h-12 relative quiz-content-reveal">
                    <span className="absolute left-0 font-montserrat text-[8px] md:text-[9px] text-description/30 tracking-[0.3em] font-bold">
                       QUESTION {currentIndex + 1} / {questions.length}
                    </span>
                    <div className="h-[1.5px] bg-white/5 w-full md:w-2/3 lg:w-1/2 relative overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_15px_#8B5CF6]" 
                          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Area - Taking more space */}
                <div className="flex-1 flex flex-col justify-center py-10 md:py-16 text-center">
                    <h2 className="quiz-content-reveal font-montserrat text-normal mb-12 md:mb-20 max-w-3xl mx-auto px-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                        "{questions[currentIndex].text}"
                    </h2>

                    <div className="quiz-content-reveal flex flex-col items-center gap-10 md:gap-20">
                        <div className="flex items-center justify-center gap-4 md:gap-12 lg:gap-16 w-full">
                            <span className="hidden md:block font-montserrat text-[8px] font-bold text-description/80 tracking-[0.4em] uppercase shrink-0">Disagree</span>
                            <div className="flex items-center gap-3 md:gap-5 lg:gap-8">
                                {[1, 2, 3, 4, 5].map((level) => {
                                    const sizes = [
                                        'w-14 h-14 md:w-18 md:h-18', 
                                        'w-10 h-10 md:w-13 md:h-13', 
                                        'w-8 h-8 md:w-11 md:h-11', 
                                        'w-10 h-10 md:w-13 md:h-13', 
                                        'w-14 h-14 md:w-18 md:h-18'
                                    ]
                                    return (
                                        <button 
                                          key={level}
                                          onClick={() => handleAnswer(level)}
                                          onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
                                            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
                                            gsap.to(e.currentTarget.querySelector('.dot-inner'), { x, y, duration: 0.4, ease: 'power2.out' });
                                          }}
                                          onMouseLeave={(e) => {
                                            gsap.to(e.currentTarget.querySelector('.dot-inner'), { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
                                          }}
                                          className={`${sizes[level-1]} rounded-full border border-white/20 transition-all duration-500 flex items-center justify-center group/btn-circle relative overflow-hidden cursor-pointer
                                            ${answers[questions[currentIndex].id] === level 
                                                ? 'border-accent bg-accent/20 scale-110 shadow-accent-small' 
                                                : 'hover:border-accent/60 hover:scale-110'}`}
                                        >
                                            <div className={`absolute inset-0 bg-accent/10 transition-all duration-500 ${answers[questions[currentIndex].id] === level ? 'opacity-100' : 'opacity-0 scale-50 group-hover/btn-circle:opacity-100 group-hover/btn-circle:scale-100'}`} />
                                            <div className={`dot-inner w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-accent shadow-[0_0_20px_#8B5CF6] transition-all duration-500 relative z-10 
                                                ${answers[questions[currentIndex].id] === level ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover/btn-circle:scale-125 group-hover/btn-circle:opacity-100'}`} 
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                            <span className="hidden md:block font-montserrat text-[8px] font-bold text-description/80 tracking-[0.4em] uppercase shrink-0">Agree</span>
                        </div>
                        
                        {/* Mobile specific labels */}
                        <div className="md:hidden flex justify-between w-full px-8 opacity-40 font-montserrat text-[7px] font-bold tracking-[0.4em] uppercase">
                            <span>Disagree</span>
                            <span>Agree</span>
                        </div>
                    </div>
                </div>

                {/* Navigation - Locked to bottom */}
                <div className="w-full flex items-center justify-between h-20 quiz-content-reveal">
                    <button 
                      onClick={handlePrev} 
                      disabled={currentIndex === 0}
                      className={`group flex items-center gap-4 md:gap-6 font-montserrat text-[9px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all duration-500 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-description/30 hover:text-normal'}`}
                    >
                        <div className="w-6 md:w-8 h-[1px] bg-white/10 transition-transform group-hover:scale-x-125 origin-left" />
                        PREV
                    </button>
                    
                    <button 
                       disabled={!answers[questions[currentIndex].id]}
                       onClick={() => handleAnswer(answers[questions[currentIndex].id])}
                       className={`group flex items-center gap-6 md:gap-8 font-montserrat text-[9px] md:text-[11px] font-bold tracking-[0.4em] md:tracking-[0.6em] uppercase transition-all duration-500
                        ${!answers[questions[currentIndex].id] ? 'opacity-0 pointer-events-none' : 'text-accent hover:tracking-[0.8em]'}`}
                    >
                        {currentIndex === questions.length - 1 ? 'Calculate' : 'Next Step'}
                        <div className="w-8 md:w-12 h-[1px] bg-accent transition-transform group-hover:scale-x-150 origin-right shadow-[0_0_10px_#8B5CF6]" />
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default PersonalityTest
