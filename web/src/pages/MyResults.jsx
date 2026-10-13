import React, { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { useLanguage } from '../context/LanguageContext'
import authorizedFetch from '../utils/apiClient'
import sanitizeDisplay from '../utils/textSanitize'

const MyResults = () => {
   const containerRef = useRef(null)
   const { t } = useLanguage()
   const [results, setResults] = useState([])
   const [loading, setLoading] = useState(true)
   const [searchQuery, setSearchQuery] = useState('')
   
   // Review Modal State
   const [selectedResult, setSelectedResult] = useState(null)
   const [activeReviewSectionIndex, setActiveReviewSectionIndex] = useState(0)
   const [activeReviewQuestionId, setActiveReviewQuestionId] = useState(null)

   useEffect(() => {
      window.scrollTo(0, 0)
      fetchResults()
   }, [])

   const fetchResults = async () => {
      setLoading(true)
      try {
         const res = await authorizedFetch('/quiz/my/submitted-quizzes?limit=100')
         const data = await res.json()
         if (res.ok && data.success) {
            setResults(data.data || [])
         }
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   const filteredResults = useMemo(() => {
      return results.filter(sub => {
         const title = sub.quiz?.quizTitle?.toLowerCase() || ''
         const course = sub.quiz?.course?.title?.toLowerCase() || ''
         const query = searchQuery.toLowerCase()
         return title.includes(query) || course.includes(query)
      })
   }, [results, searchQuery])

   useEffect(() => {
      if (!loading && results.length >= 0 && !selectedResult) {
         const ctx = gsap.context(() => {
            gsap.fromTo('.res-reveal',
               { y: 20, autoAlpha: 0 },
               {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.6,
                  ease: 'power2.out',
                  stagger: 0.1,
                  delay: 0.2
               }
            )
         }, containerRef)
         return () => ctx.revert()
      }
   }, [loading, results.length, selectedResult])

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      })
   }

   const formatTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleTimeString('en-US', {
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   // Prepare questions for review when a result is selected
   const allQuestions = useMemo(() => {
      if (!selectedResult || !selectedResult.quiz) return []
      const flat = []
      selectedResult.quiz.sections?.forEach((section, sIndex) => {
         section.questions?.forEach((q, qIndex) => {
            flat.push({
               ...q,
               sectionTitle: section.sectionTitle,
               sectionIndex: sIndex,
               originalIndex: qIndex,
               id: `${sIndex}-${qIndex}`
            })
         })
      })
      return flat
   }, [selectedResult])

   const selections = useMemo(() => {
      if (!selectedResult) return {}
      const map = {}
      selectedResult.answers?.forEach(ans => {
         // The answer format in DB is { question: string, selectedOption: string }
         // We need to map it back to question ID. Since we flattened questions, we can match by question text
         const q = allQuestions.find(q => q.question === ans.question)
         if (q) {
            map[q.id] = ans.selectedOption
         }
      })
      return map
   }, [selectedResult, allQuestions])

   if (selectedResult) {
      return (
         <div className="min-h-screen bg-[#f8fafc] relative selection:bg-amber-50/60 overflow-x-clip text-slate-900 flex flex-col">
            <DashboardHeader />
            <main className="flex-grow flex flex-col p-6 pt-32 md:px-12 md:pb-12 md:pt-40 w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
               <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <button
                     onClick={() => {
                        setSelectedResult(null)
                        setActiveReviewSectionIndex(0)
                        setActiveReviewQuestionId(null)
                     }}
                     className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                  >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                     </svg>
                  </button>
                  <div>
                     <h2 className="font-montserrat text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{selectedResult.quiz?.quizTitle || 'Quiz Review'}</h2>
                     <p className="text-sm text-slate-500">Score: <span className="font-bold text-[#2171B5]">{Math.round(selectedResult.score || 0)} / {Math.round(selectedResult.totalMarks || 0)}</span> ({Math.round(selectedResult.percentage || 0)}%)</p>
                  </div>
               </div>

               {/* REVIEW UI COPIED FROM DashboardQuiz */}
               <div className="bg-white border border-slate-200 w-full p-8 md:p-12 rounded-2xl shadow-sm space-y-8">
                  <div className="flex flex-col md:flex-row gap-8">
                     {/* Left Side: Navigation */}
                     <div className="w-full md:w-1/3 flex flex-col gap-8 border-r border-slate-100 pr-4">
                        {/* Section Tabs */}
                        {selectedResult.quiz?.sections && selectedResult.quiz.sections.length > 1 && (
                           <div className="space-y-3">
                              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Sections</h4>
                              <div className="flex flex-wrap gap-2">
                                 {selectedResult.quiz.sections.map((section, idx) => (
                                    <button
                                       key={idx}
                                       onClick={() => {
                                          setActiveReviewSectionIndex(idx)
                                          setActiveReviewQuestionId(null)
                                       }}
                                       className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${activeReviewSectionIndex === idx ? 'bg-[#2171B5] text-white border-[#2171B5]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                       {section.sectionTitle || `Section ${idx + 1}`}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}
                        
                        {/* Question Buttons */}
                        <div className="space-y-3">
                           <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Questions</h4>
                           <div className="flex flex-wrap gap-2">
                              {allQuestions.filter(q => q.sectionIndex === activeReviewSectionIndex).map((q) => {
                                 const globalIndex = allQuestions.findIndex(fq => fq.id === q.id) + 1
                                 const isActive = (activeReviewQuestionId === q.id) || (!activeReviewQuestionId && allQuestions.filter(aq => aq.sectionIndex === activeReviewSectionIndex)[0]?.id === q.id)
                                 const isCorrect = selections[q.id] === q.correctAnswer
                                 const isUnanswered = !selections[q.id]
                                 
                                 let bgClass = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                 if (isActive) {
                                    bgClass = "bg-slate-800 text-white border-slate-800 shadow-md"
                                 } else if (isCorrect) {
                                    bgClass = "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                 } else if (!isUnanswered) {
                                    bgClass = "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                 }

                                 return (
                                    <button
                                       key={q.id}
                                       onClick={() => setActiveReviewQuestionId(q.id)}
                                       className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded-lg border transition-all ${bgClass}`}
                                       title={`Question ${globalIndex}`}
                                    >
                                       {globalIndex}
                                    </button>
                                 )
                              })}
                           </div>
                        </div>
                     </div>

                     {/* Right Side: Question Detail */}
                     <div className="w-full md:w-2/3">
                        {(() => {
                           const reviewQuestions = allQuestions.filter(q => q.sectionIndex === activeReviewSectionIndex)
                           const reviewQ = allQuestions.find(q => q.id === activeReviewQuestionId) || reviewQuestions[0]
                           if (!reviewQ) return <p className="text-slate-500">No questions found in this section.</p>
                           
                           const userAns = selections[reviewQ.id]
                           const isCorrect = userAns === reviewQ.correctAnswer
                           const globalIdx = allQuestions.findIndex(q => q.id === reviewQ.id)

                           return (
                              <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-6">
                                 <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-bold text-xl text-slate-800 leading-snug">
                                       <span className="text-[#2171B5] mr-2">Q{globalIdx + 1}.</span> 
                                       {sanitizeDisplay(reviewQ.question)}
                                    </h3>
                                    {userAns ? (
                                       <span className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                          {isCorrect ? 'Correct' : 'Incorrect'}
                                       </span>
                                    ) : (
                                       <span className="shrink-0 px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Unanswered</span>
                                    )}
                                 </div>

                                 <div className="grid grid-cols-1 gap-3">
                                    {reviewQ.options.map((opt, oIdx) => {
                                       const isUserSelection = userAns === opt.label
                                       const isActualCorrect = reviewQ.correctAnswer === opt.label
                                       
                                       let optClass = "p-4 border rounded-xl text-slate-700 bg-slate-50 flex items-center justify-between"
                                       let icon = null
                                       
                                       if (isActualCorrect) {
                                          optClass = "p-4 border-2 border-green-500 bg-green-50 text-green-900 font-medium flex items-center justify-between"
                                          icon = <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                       } else if (isUserSelection && !isCorrect) {
                                          optClass = "p-4 border-2 border-red-400 bg-red-50 text-red-900 flex items-center justify-between"
                                          icon = <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                       }

                                       return (
                                          <div key={oIdx} className={optClass}>
                                             <div className="flex gap-3">
                                                <span className="font-bold opacity-50">{opt.label}.</span>
                                                <span>{sanitizeDisplay(opt.text)}</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                {isUserSelection && <span className="text-xs font-bold uppercase tracking-wider opacity-60">(Your Answer)</span>}
                                                {icon}
                                             </div>
                                          </div>
                                       )
                                    })}
                                 </div>

                                 {reviewQ.explanation && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-amber-100 bg-amber-50/50">
                                       <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                                          <svg className="w-5 h-5 text-[#2171B5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                          <span className="text-xs font-bold text-[#2171B5] uppercase tracking-wider">Explanation</span>
                                       </div>
                                       <div className="p-5 text-slate-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: reviewQ.explanation }} />
                                    </div>
                                 )}
                              </div>
                           )
                        })()}
                     </div>
                  </div>
               </div>
            </main>
         </div>
      )
   }

   return (
      <div ref={containerRef} className="min-h-screen bg-[#f8fafc] relative selection:bg-amber-50/60 overflow-x-clip text-slate-700">
         <DashboardHeader />

         <main className="relative pt-24 pb-20 z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 res-reveal">
               <div className="space-y-2">
                  <p className="font-mono text-xs text-[#2171B5] uppercase tracking-widest">{t('myActivity') || 'My Activity'}</p>
                  <h1 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                     My Results
                  </h1>
               </div>
               
               <div className="w-full md:w-72">
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2171B5] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                     </div>
                     <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2171B5] focus:shadow-sm transition-all"
                     />
                  </div>
               </div>
            </div>

            {loading ? (
               <div className="py-20 flex justify-center res-reveal">
                  <div className="w-8 h-8 border-2 border-[#2171B5]/30 border-t-[#2171B5] rounded-full animate-spin" />
               </div>
            ) : filteredResults.length === 0 ? (
               <div className="py-20 text-center space-y-4 res-reveal">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                     </svg>
                  </div>
                  <h3 className="text-xl font-medium text-slate-800">No results found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                     You haven't submitted any quizzes yet, or your search didn't match any results.
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((sub) => (
                     <div key={sub._id} className="group relative bg-white border border-slate-200 hover:border-[#2171B5]/50 hover:shadow-md rounded-2xl p-6 transition-all duration-300 flex flex-col res-reveal">
                        <div className="flex justify-between items-start mb-4">
                           <div className="space-y-1">
                              <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-[#2171B5] transition-colors">
                                 {sub.quiz?.quizTitle || 'Quiz'}
                              </h3>
                              {sub.quiz?.course?.title && (
                                 <p className="text-xs font-medium text-slate-500 line-clamp-1">{sub.quiz.course.title}</p>
                              )}
                           </div>
                           <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${sub.passed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {sub.passed ? 'Passed' : 'Failed'}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-6">
                           <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Score</p>
                              <p className="font-montserrat text-3xl font-bold text-[#2171B5]">{Math.round(sub.score || 0)} / {Math.round(sub.totalMarks || 0)}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Percentage</p>
                              <p className="font-montserrat text-3xl font-bold text-slate-700">{Number.isInteger(sub.percentage) ? sub.percentage : Number(sub.percentage).toFixed(1)}%</p>
                           </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                           <div className="space-y-0.5">
                              <p className="text-xs font-medium text-slate-600">{formatDate(sub.submittedAt)}</p>
                              <p className="text-[10px] text-slate-400">{formatTime(sub.submittedAt)}</p>
                           </div>
                           <button 
                              onClick={() => setSelectedResult(sub)}
                              className="px-5 py-2.5 bg-amber-50 hover:bg-[#2171B5] text-[#2171B5] hover:text-white border border-amber-100 hover:border-[#2171B5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                           >
                              Review
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>
      </div>
   )
}

export default MyResults
