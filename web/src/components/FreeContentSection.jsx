import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { freePdfsData, freeClassesData, freeTestsData } from '../data/freeContentData'
import RollingText from './RollingText'
import { useLanguage } from '../context/LanguageContext'

const FreeContentSection = () => {
  const [activeTab, setActiveTab] = useState('all')
  const { t } = useLanguage()

  const samplePdfs = freePdfsData.slice(0, 2)
  const sampleClasses = freeClassesData.slice(0, 2)
  const sampleTests = freeTestsData.slice(0, 2)

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono text-[10px] font-bold tracking-wider uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Zero Cost Open Learning
          </div>
          <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            Explore <span className="font-normal text-amber-600">Free Resources</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm max-w-xl">
            Download high-yield PDF cheat sheets, watch full video lectures, and practice interactive quizzes with zero fees.
          </p>
        </div>

        <Link
          to="/free-content"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm shrink-0"
        >
          <span>Explore All Free Library</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'all', label: 'All Highlights', icon: '⭐' },
          { key: 'pdfs', label: 'PDFs & Notes', icon: '📄' },
          { key: 'classes', label: 'Video Classes', icon: '🎥' },
          { key: 'tests', label: 'Practice Quizzes', icon: '📝' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PDF Highlight Card */}
        {(activeTab === 'all' || activeTab === 'pdfs') && samplePdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="group bg-white border border-slate-200/80 hover:border-amber-400 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 uppercase">
                  PDF • {pdf.fileSize}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                {pdf.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{pdf.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 font-medium">{pdf.pages} Pages Guide</span>
              <Link
                to={`/free-content?tab=pdfs`}
                className="text-xs font-mono font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Read PDF</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}

        {/* Video Class Highlight Card */}
        {(activeTab === 'all' || activeTab === 'classes') && sampleClasses.map((cls) => (
          <div
            key={cls.id}
            className="group bg-white border border-slate-200/80 hover:border-amber-400 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-2xl bg-slate-900">
                <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center pl-0.5 group-hover:bg-amber-400 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                  {cls.duration}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                {cls.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cls.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">{cls.instructor}</span>
              <Link
                to={`/free-content?tab=classes`}
                className="text-xs font-mono font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Watch Class</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}

        {/* Test Highlight Card */}
        {(activeTab === 'all' || activeTab === 'tests') && sampleTests.map((test) => (
          <div
            key={test.id}
            className="group bg-white border border-slate-200/80 hover:border-amber-400 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                  {test.questionsCount} Qs • {test.durationMinutes}m
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                {test.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{test.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">Level: <strong className="text-slate-800">{test.difficulty}</strong></span>
              <Link
                to={`/free-content?tab=tests`}
                className="text-xs font-mono font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Take Quiz</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FreeContentSection
