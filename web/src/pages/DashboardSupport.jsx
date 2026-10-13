import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useDispatch, useSelector } from 'react-redux';
import { createSupportTicket, fetchMyTickets, resetSupportState } from '../redux/slices/supportSlice';
import { useLanguage } from '../context/LanguageContext';

const DashboardSupport = () => {
    const dispatch = useDispatch();
    const { t } = useLanguage();
    const { tickets, loading, submitting, error, success } = useSelector((state) => state.support);
    const { user } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState('raise');
    const [queryType, setQueryType] = useState('general');
    const [charCount, setCharCount] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    const quickEmojis = ['🆘', '⚠️', '🐞', '💳', '📧', '📎', '💬', '⚡'];

    // Form State
    const [formData, setFormData] = useState({
        userName: user?.name || '',
        userEmail: user?.email || '',
        userPhone: '',
        subject: '',
        description: '',
        priority: 'medium',
        attachment: null
    });

    useEffect(() => {
        if (activeTab === 'my') {
            dispatch(fetchMyTickets());
        }
    }, [dispatch, activeTab]);

    useEffect(() => {
        if (success) {
            alert('TICKET ESTABLISHED. PROTOCOL INITIATED.');
            setFormData({
                userName: user?.name || '',
                userEmail: user?.email || '',
                userPhone: '',
                subject: '',
                description: '',
                priority: 'medium',
                attachment: null
            });
            setCharCount(0);
            dispatch(resetSupportState());
        }
    }, [success, dispatch, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'description') setCharCount(value.length);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 10 * 1024 * 1024) {
            alert('ASSET EXCEEDS PARAMETERS: Max 10MB allowed.');
            return;
        }
        setFormData(prev => ({ ...prev, attachment: file }));
    };

    const addEmoji = (emoji) => {
        setFormData(prev => ({ ...prev, description: prev.description + emoji }));
        setCharCount(prev => prev + emoji.length);
        setShowEmojis(false);
    };

    const handleSubmit = () => {
        if (!formData.subject || !formData.description || !formData.userEmail) {
            alert('CRITICAL FIELDS MISSING: Subject, Description, and Email are required.');
            return;
        }

        const data = new FormData();
        data.append('subject', `${formData.subject}`);
        data.append('category', queryType);
        data.append('description', formData.description);
        data.append('priority', formData.priority);
        data.append('userName', formData.userName);
        data.append('userEmail', formData.userEmail);
        data.append('userPhone', formData.userPhone);
        if (formData.attachment) {
            data.append('attachment', formData.attachment);
        }

        dispatch(createSupportTicket(data));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const ctx = gsap.context(() => {
            gsap.fromTo('.support-reveal',
                { y: 20, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    stagger: 0.1, 
                    ease: 'power3.out' 
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [activeTab]);

    const queryTypes = [
        { id: 'general', title: 'General Inquiry', desc: 'General requests', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { id: 'technical', title: 'Technical Support', desc: 'Issues & troubleshooting', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
        { id: 'bug', title: 'Bug Report', desc: 'Unexpected behavior', icon: 'M9.172 19.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M9.172 19.172a4 4 0 0 1 5.656 0' },
        { id: 'billing', title: 'Billing & Payments', desc: 'Payments & subs', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z' }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400/30 relative overflow-x-hidden">
            <DashboardHeader />
            
            <main className="pt-24 pb-16 px-4 md:px-12">
                <div className="max-w-[1600px] mx-auto space-y-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-8 support-reveal opacity-0">
                        <div className="space-y-3">
                           <p className="font-montserrat text-xs text-amber-800 uppercase tracking-[0.4em] font-black">{t('supportProtocolTag')}</p>
                           <h1 className="font-montserrat text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                               {t('supportCenter')}
                           </h1>
                        </div>
                        
                        <div className="text-right group relative hidden md:block">
                           <p className="font-montserrat text-[9px] text-slate-500 uppercase tracking-[0.4em] mb-1 font-bold">{t('activeDispatches')}</p>
                           <p className="font-montserrat text-3xl md:text-5xl text-slate-900 leading-none font-bold tracking-tighter">04</p>
                           <div className="absolute -bottom-2 right-0 w-12 h-[2px] bg-amber-400 group-hover:w-full transition-all duration-700" />
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-center py-6 border-y border-slate-200 gap-6 support-reveal opacity-0">
                        <div className="flex items-center gap-4 bg-slate-100 p-1.5 border border-slate-200 rounded-2xl w-full md:w-auto">
                            <button 
                                onClick={() => setActiveTab('raise')}
                                className={`font-montserrat text-xs font-black uppercase tracking-[0.3em] transition-all relative px-10 py-3 rounded-xl  
                                  ${activeTab === 'raise' ? 'text-slate-950 bg-amber-400 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                            >
                                {t('raiseTicket')}
                            </button>
                            <button 
                                onClick={() => setActiveTab('my')}
                                className={`font-montserrat text-xs font-black uppercase tracking-[0.3em] transition-all relative px-10 py-3 rounded-xl 
                                  ${activeTab === 'my' ? 'text-slate-950 bg-amber-400 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                            >
                                {t('myTickets')}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'raise' ? (
                        <div className="space-y-16">
                            {/* Layout Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                                {/* Contact Info */}
                                <div className="space-y-10 support-reveal opacity-0">
                                    <div className="space-y-2">
                                       <p className="font-montserrat text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">{t('infoArchitectureTag')}</p>
                                       <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight uppercase leading-none">{t('contactInfo')}</h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase text-slate-600">{t('fullNameLabel')} *</label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        name="userName"
                                                        value={formData.userName}
                                                        onChange={handleInputChange}
                                                        placeholder={t('enterYourName')} 
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 tracking-widest uppercase placeholder:text-slate-400 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase text-slate-600">{t('emailAddressLabel')} *</label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
                                                    </div>
                                                    <input 
                                                        type="email" 
                                                        name="userEmail"
                                                        value={formData.userEmail}
                                                        onChange={handleInputChange}
                                                        placeholder={t('enterYourEmail')} 
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 tracking-widest uppercase placeholder:text-slate-400 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase text-slate-600">{t('phoneNumberLabel')}</label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                    </div>
                                                    <input 
                                                        type="tel" 
                                                        name="userPhone"
                                                        value={formData.userPhone}
                                                        onChange={handleInputChange}
                                                        placeholder={t('enterYourPhone')} 
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 tracking-widest uppercase placeholder:text-slate-400 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase text-slate-600">{t('subjectLabel')} *</label>
                                                <div className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleInputChange}
                                                        placeholder="SUBJECT" 
                                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 tracking-widest uppercase placeholder:text-slate-400 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Select Query */}
                                <div className="space-y-10 support-reveal opacity-0">
                                    <div className="space-y-2">
                                       <p className="font-montserrat text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">{t('strategicClassificationTag')}</p>
                                       <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight uppercase leading-none">{t('supportCategory')}</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {queryTypes.map((type) => (
                                            <div 
                                                key={type.id}
                                                onClick={() => setQueryType(type.id)}
                                                className={`p-6 border rounded-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[150px] shadow-sm
                                                  ${queryType === type.id ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                                  ${queryType === type.id ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={type.icon}/></svg>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className={`font-montserrat text-xs font-bold uppercase tracking-[0.2em] ${queryType === type.id ? 'text-amber-900' : 'text-slate-900'}`}>{type.title}</h4>
                                                    <p className="font-montserrat text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">{type.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description & Attachments */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 support-reveal opacity-0">
                                <div className="lg:col-span-8 space-y-10">
                                    <div className="space-y-2">
                                       <p className="font-montserrat text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">{t('detailedDossierTag')}</p>
                                       <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight uppercase leading-none">{t('intelligenceBriefingTitle')}</h3>
                                    </div>
                                    <div className="relative">
                                        <textarea 
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder={t('describeSituationPlaceholder')}
                                            className="w-full bg-white border border-slate-200 rounded-2xl p-6 h-64 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 tracking-widest uppercase resize-none placeholder:text-slate-400 shadow-sm"
                                        />
                                        
                                        {/* Emoji Trigger */}
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <button 
                                                onClick={() => setShowEmojis(!showEmojis)}
                                                className={`p-2 transition-colors ${showEmojis ? 'text-amber-600' : 'text-slate-400 hover:text-amber-600'}`}
                                                title="Neural Symbols"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                            </button>
                                            
                                            {showEmojis && (
                                                <div className="absolute top-12 right-0 bg-white border border-slate-200 rounded-xl p-3 flex gap-2 z-50 shadow-xl animate-in fade-in slide-in-from-top-2">
                                                    {quickEmojis.map(emoji => (
                                                        <button 
                                                            key={emoji}
                                                            onClick={() => addEmoji(emoji)}
                                                            className="hover:scale-125 transition-transform p-1"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute bottom-6 right-8 font-montserrat text-[10px] text-amber-800 font-bold tracking-widest uppercase">
                                            {charCount} / 1000
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-10">
                                    <div className="space-y-2">
                                       <p className="font-montserrat text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">{t('supportingAssetsTag')}</p>
                                       <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight uppercase leading-none">{t('attachmentsTitle')}</h3>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden" 
                                        accept="image/*,.pdf"
                                    />
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-10 h-64 flex flex-col items-center justify-center gap-4 hover:border-amber-400 transition-all cursor-pointer group bg-white shadow-sm
                                          ${formData.attachment ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                          ${formData.attachment ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 group-hover:bg-amber-400 group-hover:text-slate-950'}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                {formData.attachment ? <path d="M20 6L9 17l-5-5"/> : <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12"/>}
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-montserrat text-xs font-bold uppercase tracking-[0.2em] text-slate-900">
                                                {formData.attachment ? formData.attachment.name : t('submitAssetsLabel')}
                                            </p>
                                            <p className="font-montserrat text-[9px] text-slate-400 uppercase tracking-widest font-bold">{t('fileTypesMax')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Section (Strategic Action) */}
                            <div className="pt-24 pb-20 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 items-center gap-20 support-reveal opacity-0">
                                <div className="space-y-8">
                                    <h2 className="font-montserrat text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                                       {t('establishCommunication')}
                                    </h2>
                                    <p className="font-montserrat text-xs text-slate-600 leading-[2] uppercase tracking-widest max-w-md font-medium">
                                       {t('operativesResponseDesc')}
                                    </p>
                                    <div className="pt-6">
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="bg-amber-400 text-slate-950 px-10 py-5 rounded-xl font-montserrat text-xs font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {submitting ? 'PROTOCOL INITIATED...' : t('submitDispatch')}
                                        </button>
                                        {error && <p className="font-montserrat text-[9px] text-red-500 uppercase tracking-widest mt-4">{error}</p>}
                                    </div>
                                </div>
                                
                                <div className="relative group overflow-hidden border border-slate-200 rounded-3xl aspect-video md:aspect-square lg:aspect-auto h-full min-h-[300px] shadow-sm">
                                    <img 
                                      src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" 
                                      alt="Support Protocol Visual" 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="support-reveal opacity-0 space-y-8">
                            <div className="space-y-2">
                                <p className="font-montserrat text-[9px] text-amber-800 uppercase tracking-[0.4em] font-black">{t('intelligenceLogTag')}</p>
                                <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight uppercase">{t('raisedTickets')}</h3>
                            </div>
                            
                            <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/90 border-b border-slate-200 font-montserrat text-xs text-amber-900 uppercase tracking-[0.2em] font-black">
                                            <th className="p-6 border-r border-slate-200">{t('protocolIdCol')}</th>
                                            <th className="p-6 border-r border-slate-200">{t('briefingSubjectCol')}</th>
                                            <th className="p-6 border-r border-slate-200">{t('classificationCol')}</th>
                                            <th className="p-6 border-r border-slate-200">{t('currentStateCol')}</th>
                                            <th className="p-6 text-right">{t('timestampCol')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="p-16 text-center font-montserrat text-xs text-amber-800 tracking-[0.3em] animate-pulse uppercase">{t('retrievingDispatches')}</td>
                                            </tr>
                                        ) : tickets.length > 0 ? (
                                            tickets.map((ticket) => (
                                                <tr key={ticket._id} className="hover:bg-slate-50 transition-all cursor-pointer group">
                                                    <td className="p-6 font-montserrat text-xs text-amber-800 font-bold tracking-widest">#{ticket._id?.slice(-6).toUpperCase()}</td>
                                                    <td className="p-6 font-montserrat text-lg text-slate-900 font-bold group-hover:text-amber-600 transition-colors">{ticket.subject}</td>
                                                    <td className="p-6">
                                                        <span className="font-montserrat text-[10px] border border-slate-200 bg-slate-50 px-3 py-1 rounded-full text-slate-700 uppercase tracking-widest font-bold">{ticket.category}</span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500' : ticket.status === 'open' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                            <span className="font-montserrat text-xs text-slate-900 font-bold uppercase tracking-widest">{ticket.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right font-montserrat text-xs text-slate-500 uppercase tracking-widest font-bold">
                                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-16 text-center font-montserrat text-xs text-slate-400 uppercase tracking-widest">{t('noDispatchesFound')}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardSupport;
