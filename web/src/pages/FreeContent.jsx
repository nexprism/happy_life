import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import gsap from 'gsap'
import { freePdfsData, freeClassesData, freeTestsData, freeContentCategories } from '../data/freeContentData'
import RollingText from '../components/RollingText'
import { useLanguage } from '../context/LanguageContext'

const FreeContent = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()
  const containerRef = useRef(null)

  // URL Tab handling
  const initialTab = searchParams.get('tab') || 'all'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Modals state
  const [activePdfModal, setActivePdfModal] = useState(null)
  const [activeClassModal, setActiveClassModal] = useState(null)
  const [activeQuizModal, setActiveQuizModal] = useState(null)

  // Interactive Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizTimer, setQuizTimer] = useState(0)

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['all', 'pdfs', 'classes', 'tests'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setSearchParams({ tab: tabKey })
  }

  // Quiz Timer effect
  useEffect(() => {
    let interval = null
    if (activeQuizModal && !quizSubmitted) {
      interval = setInterval(() => {
        setQuizTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeQuizModal, quizSubmitted])

  // GSAP Animations on Mount
  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.free-hero-reveal',
        { y: 35, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.12, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.free-card-reveal',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [activeTab, selectedCategory])

  // Filter Data
  const filteredPdfs = useMemo(() => {
    return freePdfsData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory])

  const filteredClasses = useMemo(() => {
    return freeClassesData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory])

  const filteredTests = useMemo(() => {
    return freeTestsData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory])

  // Quiz Handling
  const startQuiz = (test) => {
    setActiveQuizModal(test)
    setCurrentQuizIndex(0)
    setSelectedAnswers({})
    setQuizSubmitted(false)
    setQuizTimer(0)
  }

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const calculateScore = () => {
    if (!activeQuizModal) return { score: 0, percentage: 0, total: 0 }
    let correctCount = 0
    activeQuizModal.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++
      }
    })
    const total = activeQuizModal.questions.length
    const percentage = Math.round((correctCount / total) * 100)
    return { score: correctCount, total, percentage }
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-dark pt-36 sm:pt-40 md:pt-44 pb-28 text-slate-900">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb Header */}
        <div className="free-hero-reveal flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-amber-600 transition-colors">
            {t('home')}
          </Link>
          <span>/</span>
          <span className="text-amber-600">{t('freeContent')}</span>
        </div>

        {/* Hero Section */}
        <div className="free-hero-reveal flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 font-mono text-[11px] font-bold tracking-wider uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              100% Free Learning Portal
            </div>
            <h1 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
              Free <span className="font-normal text-amber-600">Knowledge Hub</span>
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Discover authentic Vedic wisdom and Astro-Vastu knowledge with our curated repository of downloadable PDF guides, insightful video lectures & remedies by Dr. Yogesh Sharma, and astrological quizzes.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-sm text-center">
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-600">{freePdfsData.length}+</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">PDF Notes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-sm text-center">
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-600">{freeClassesData.length}+</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Classes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-sm text-center">
              <div className="font-mono text-xl sm:text-2xl font-black text-amber-600">{freeTestsData.length}+</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Quizzes</div>
            </div>
          </div>
        </div>

        {/* Search and Navigation Bar */}
        <div className="free-hero-reveal mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Content Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>All ({freePdfsData.length + freeClassesData.length + freeTestsData.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('pdfs')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'pdfs'
                  ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>PDFs & Notes ({freePdfsData.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('classes')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'classes'
                  ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Classes & Video ({freeClassesData.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('tests')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'tests'
                  ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="m9 14 2 2 4-4" />
              </svg>
              <span>Tests & Quizzes ({freeTestsData.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, lectures..."
              className="w-full bg-white/90 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="free-hero-reveal mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Filter by:
          </span>
          {freeContentCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-amber-300 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Grids */}
        <div className="mt-10 space-y-14">
          {/* 1. PDFs Section */}
          {(activeTab === 'all' || activeTab === 'pdfs') && filteredPdfs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                      Downloadable Study Notes & Cheatsheets
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Free PDF guides ready for instant offline reading.</p>
                  </div>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => handleTabChange('pdfs')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                  >
                    <span>View all ({freePdfsData.length})</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="free-card-reveal group bg-white border border-slate-200/80 hover:border-amber-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M10 12h4" />
                            <path d="M10 16h4" />
                          </svg>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                            {pdf.badge}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-medium">{pdf.fileSize} • {pdf.pages} pgs</span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                        {pdf.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {pdf.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {pdf.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium">
                            {topic}
                          </span>
                        ))}
                        {pdf.topics.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[10px] font-medium">
                            +{pdf.topics.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setActivePdfModal(pdf)}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center flex items-center justify-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Preview & Read</span>
                      </button>

                      <button
                        onClick={() => {
                          alert(`Downloading: ${pdf.title} (${pdf.fileSize})`);
                        }}
                        title="Direct Download"
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-amber-100 border border-slate-200 text-slate-700 hover:text-amber-800 flex items-center justify-center transition-colors shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Video Classes Section */}
          {(activeTab === 'all' || activeTab === 'classes') && filteredClasses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                      Free Video Lectures & Masterclasses
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Watch comprehensive, production-grade video lessons online.</p>
                  </div>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => handleTabChange('classes')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                  >
                    <span>View all ({freeClassesData.length})</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="free-card-reveal group bg-white border border-slate-200/80 hover:border-amber-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail Preview */}
                      <div
                        onClick={() => setActiveClassModal(cls)}
                        className="relative aspect-video w-full mb-4 overflow-hidden rounded-xl bg-slate-900 cursor-pointer"
                      >
                        <img
                          src={cls.thumbnail}
                          alt={cls.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 shadow-xl flex items-center justify-center pl-1 group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        </div>

                        {/* Badges on Thumbnail */}
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                          {cls.level}
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {cls.duration}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                          {cls.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">{cls.views} views</span>
                      </div>

                      <h3
                        onClick={() => setActiveClassModal(cls)}
                        className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug cursor-pointer"
                      >
                        {cls.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {cls.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                          {cls.instructor.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{cls.instructor}</div>
                          <div className="text-[10px] text-slate-400">{cls.role}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveClassModal(cls)}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-400 hover:text-white text-amber-900 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Watch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Tests / Quizzes Section */}
          {(activeTab === 'all' || activeTab === 'tests') && filteredTests.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                      Interactive Practice Quizzes & Mock Tests
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Assess your technical depth with real-time score calculation and explanations.</p>
                  </div>
                </div>
                {activeTab === 'all' && (
                  <button
                    onClick={() => handleTabChange('tests')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
                  >
                    <span>View all ({freeTestsData.length})</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="free-card-reveal group bg-white border border-slate-200/80 hover:border-amber-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                            {test.badge}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-medium">
                            {test.questionsCount} Questions • {test.durationMinutes} mins
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {test.description}
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span className="font-bold text-slate-800">{test.rating}</span>
                        </div>
                        <span>•</span>
                        <div>{test.attempts} candidates tested</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-mono text-slate-500">
                        Difficulty: <span className="font-bold text-slate-800">{test.difficulty}</span>
                      </div>
                      <button
                        onClick={() => startQuiz(test)}
                        className="py-2.5 px-5 bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5"
                      >
                        <span>Start Test</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPdfs.length === 0 && filteredClasses.length === 0 && filteredTests.length === 0 && (
            <div className="text-center py-24 bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No resources matched your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or searching for another term.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setActiveTab('all')
                }}
                className="mt-5 px-5 py-2.5 bg-amber-500 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. PDF PREVIEW MODAL */}
      {/* ======================================================== */}
      {activePdfModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    {activePdfModal.category} • {activePdfModal.fileSize}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{activePdfModal.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setActivePdfModal(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{activePdfModal.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Topics Covered</h4>
                <div className="flex flex-wrap gap-2">
                  {activePdfModal.topics.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Snippet Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sample Page / Code Preview</h4>
                <div className="bg-slate-950 text-amber-300 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{activePdfModal.sampleSnippet}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{activePdfModal.pages} Pages</span> formatted PDF Document
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Download started for "${activePdfModal.title}"`);
                    setActivePdfModal(null);
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Free PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VIDEO LECTURE PLAYER MODAL */}
      {/* ======================================================== */}
      {activeClassModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeClassModal.videoUrl}
                title={activeClassModal.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Details */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                    <span>{activeClassModal.category}</span>
                    <span>•</span>
                    <span>{activeClassModal.duration}</span>
                    <span>•</span>
                    <span>{activeClassModal.level}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {activeClassModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveClassModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold text-sm flex items-center justify-center">
                  {activeClassModal.instructor.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{activeClassModal.instructor}</div>
                  <div className="text-xs text-slate-500">{activeClassModal.role}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Lecture Overview</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{activeClassModal.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What you will learn</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeClassModal.takeaways.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Free open lecture provided by Happy Life</span>
              <button
                onClick={() => setActiveClassModal(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. INTERACTIVE QUIZ MODAL */}
      {/* ======================================================== */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Quiz Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Interactive Assessment • {activeQuizModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeQuizModal.title}</h3>
              </div>

              {/* Timer & Close */}
              <div className="flex items-center gap-3">
                {!quizSubmitted && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatTimer(quizTimer)}</span>
                  </div>
                )}
                <button
                  onClick={() => setActiveQuizModal(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quiz Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {!quizSubmitted ? (
                // Ongoing Quiz
                <div>
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 mb-2">
                    <span>
                      Question {currentQuizIndex + 1} of {activeQuizModal.questions.length}
                    </span>
                    <span>
                      {Math.round(((currentQuizIndex + 1) / activeQuizModal.questions.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{
                        width: `${((currentQuizIndex + 1) / activeQuizModal.questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Question Content */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-snug">
                    {activeQuizModal.questions[currentQuizIndex].question}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-3">
                    {activeQuizModal.questions[currentQuizIndex].options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[currentQuizIndex] === optIdx
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuizIndex, optIdx)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-slate-900 font-bold shadow-sm'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Quiz Results Summary
                <div className="space-y-6">
                  {(() => {
                    const result = calculateScore()
                    const isPassed = result.percentage >= 60
                    return (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div
                          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-black mb-3 ${
                            isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isPassed ? '✓' : '!'}
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 font-montserrat">
                          {isPassed ? 'Great Job! Assessment Completed' : 'Good Attempt! Keep Practicing'}
                        </h4>
                        <div className="mt-2 text-3xl font-mono font-black text-amber-600">
                          {result.score} / {result.total} ({result.percentage}%)
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Time taken: <span className="font-mono font-bold text-slate-800">{formatTimer(quizTimer)}</span>
                        </p>
                      </div>
                    )
                  })()}

                  {/* Answers Breakdown with Explanations */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Review & Explanations</h5>
                    <div className="space-y-4">
                      {activeQuizModal.questions.map((q, idx) => {
                        const userAnswer = selectedAnswers[idx]
                        const isCorrect = userAnswer === q.correctIndex
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border text-xs ${
                              isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-bold text-slate-900 font-mono">Q{idx + 1}. {q.question}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                                }`}
                              >
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="mt-2 text-slate-600">
                              <p>
                                <strong className="text-slate-800">Correct Answer:</strong> {q.options[q.correctIndex]}
                              </p>
                              <p className="mt-1 text-slate-500">
                                <strong className="text-slate-700">Explanation:</strong> {q.explanation}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Footer Controls */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {!quizSubmitted ? (
                <>
                  <button
                    onClick={() => setCurrentQuizIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuizIndex === 0}
                    className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-600 disabled:opacity-30 hover:text-slate-900"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-3">
                    {currentQuizIndex < activeQuizModal.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuizIndex((prev) => prev + 1)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md"
                      >
                        Submit Test ✓
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <button
                    onClick={() => startQuiz(activeQuizModal)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Retake Quiz ↺
                  </button>
                  <button
                    onClick={() => setActiveQuizModal(null)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Done & Exit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FreeContent
