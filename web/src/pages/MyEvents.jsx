import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useLanguage } from '../context/LanguageContext';
import authorizedFetch from '../utils/apiClient';

const MyEvents = () => {
  const containerRef = useRef(null);
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [activeMeetingModal, setActiveMeetingModal] = useState(null);

  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const rawBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
    const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${clean}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const res = await authorizedFetch('/events/my/registered-events');
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load registered events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((evt) => {
      const matchesSearch =
        evt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.ticket?.ticketNo?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const eventEnd = evt.endDate ? new Date(evt.endDate) : (evt.startDate ? new Date(evt.startDate) : null);

      if (activeFilter === 'upcoming') {
        return eventEnd ? eventEnd >= now : true;
      }
      if (activeFilter === 'past') {
        return eventEnd ? eventEnd < now : false;
      }
      return true;
    });
  }, [events, searchQuery, activeFilter]);

  useEffect(() => {
    if (!loading && filteredEvents.length >= 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.event-card-reveal',
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.08,
          }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, filteredEvents.length]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f8fafc] relative overflow-x-clip text-slate-900 flex flex-col">
      <DashboardHeader />

      <main className="flex-grow flex flex-col p-6 pt-32 md:px-12 md:pb-16 md:pt-40 w-full max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2171B5] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Student Activity
            </span>
            <h1 className="font-montserrat text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              My Booked Events
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl">
              Access your registered workshops, webinars, and masterclasses. Launch live Zoom / Google Meet sessions and view official ticket receipts.
            </p>
          </div>

          {/* Quick Stats / Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="px-5 py-2.5 bg-[#2171B5] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              <span>Explore All Events</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past Sessions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#2171B5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by event title, ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2171B5] focus:ring-2 focus:ring-[#2171B5]/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-[#2171B5]/30 border-t-[#2171B5] rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Loading your booked events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200/90 rounded-3xl p-10 text-center space-y-5 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2171B5] flex items-center justify-center mx-auto text-2xl font-bold">
              📅
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">
                {searchQuery || activeFilter !== 'all' ? 'No matching events found' : 'No Booked Events Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                {searchQuery || activeFilter !== 'all'
                  ? 'Try clearing your search query or changing your filter tab.'
                  : 'You have not registered for any live events or webinars yet. Discover our upcoming transformative sessions!'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/events"
                className="inline-block px-6 py-3 bg-[#2171B5] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
              >
                Browse Upcoming Sessions
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const isPast = evt.endDate && new Date(evt.endDate) < new Date();
              const hasOnlineLink = Boolean(evt.onlineLink?.url);

              return (
                <div
                  key={evt._id}
                  className="event-card-reveal bg-white border border-slate-200 hover:border-[#2171B5]/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 overflow-hidden">
                    {evt.thumbnail ? (
                      <img
                        src={getMediaUrl(evt.thumbnail)}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl font-black">
                        ✦
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                        {evt.ticket?.status === 'registered' ? 'Confirmed Seat' : evt.ticket?.status || 'Enrolled'}
                      </span>
                      {evt.type && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {evt.type}
                        </span>
                      )}
                    </div>

                    {isPast && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 backdrop-blur-md text-slate-300">
                          Completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-xs font-bold text-[#2171B5]">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                        </svg>
                        <span>
                          {formatDate(evt.startDate)}
                          {evt.startDate && ` • ${formatTime(evt.startDate)}`}
                        </span>
                      </div>

                      <h3 className="font-montserrat text-lg font-black text-slate-900 group-hover:text-[#2171B5] transition-colors line-clamp-2">
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {evt.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      {/* Ticket Info Box */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                            Ticket Number
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {evt.ticket?.ticketNo || 'TKT-CONFIRMED'}
                          </span>
                        </div>
                        {evt.onlineLink?.platform && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                              Platform
                            </span>
                            <span className="font-bold text-[#2171B5] uppercase">
                              {evt.onlineLink.platform}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {hasOnlineLink ? (
                        <div className="space-y-2">
                          <a
                            href={evt.onlineLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                            <span>👉 Join Live Session</span>
                          </a>

                          {(evt.onlineLink.meetingId || evt.onlineLink.password) && (
                            <button
                              type="button"
                              onClick={() => setActiveMeetingModal(evt)}
                              className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-[#2171B5] transition cursor-pointer"
                            >
                              View Meeting ID & Passcode ▾
                            </button>
                          )}
                        </div>
                      ) : evt.venue?.name ? (
                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-start gap-2">
                          <span className="text-sm">📍</span>
                          <span className="line-clamp-2">
                            {evt.venue.name}, {evt.venue.address || evt.venue.city}
                          </span>
                        </div>
                      ) : null}

                      {/* Download Invoice / Community Link */}
                      <div className="flex items-center gap-2 pt-1">
                        {evt.ticket?.invoice ? (
                          <a
                            href={getMediaUrl(
                              evt.ticket.invoice.startsWith('/')
                                ? evt.ticket.invoice
                                : `/uploads/invoices/${evt.ticket.invoice}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 7.5V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Tax Invoice</span>
                          </a>
                        ) : null}

                        <a
                          href="https://chat.whatsapp.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-bold text-center transition flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5 fill-current text-[#25D366]" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                          <span>Community</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Meeting Credentials Modal */}
      {activeMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setActiveMeetingModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Live Session Credentials
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {activeMeetingModal.title}
              </h3>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono text-sm">
              {activeMeetingModal.onlineLink?.platform && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-sans text-xs">Platform:</span>
                  <span className="font-bold uppercase text-slate-900">{activeMeetingModal.onlineLink.platform}</span>
                </div>
              )}
              {activeMeetingModal.onlineLink?.meetingId && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-sans text-xs">Meeting ID:</span>
                  <span className="font-bold text-[#2171B5] select-all">{activeMeetingModal.onlineLink.meetingId}</span>
                </div>
              )}
              {activeMeetingModal.onlineLink?.password && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans text-xs">Passcode:</span>
                  <span className="font-bold text-slate-900 select-all">{activeMeetingModal.onlineLink.password}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={activeMeetingModal.onlineLink?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center transition shadow-md shadow-blue-500/20"
              >
                Launch Room Now →
              </a>
              <button
                type="button"
                onClick={() => setActiveMeetingModal(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
