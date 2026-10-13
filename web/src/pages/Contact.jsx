import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { submitLapaasTicket, resetSupportState } from '../redux/slices/supportSlice';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
    const dispatch = useDispatch();
    const { t } = useLanguage();
    const { user } = useSelector((state) => state.auth);
    const { submitting, error, success } = useSelector((state) => state.support);

    const containerRef = useRef(null);
    const scanLineRef = useRef(null);

    const [formData, setFormData] = useState({
        userName: user?.name || user?.fullName || '',
        userEmail: user?.email || '',
        code: '+91',
        phoneNumber: '',
        subject: 'General Inquiry',
        description: ''
    });

    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    useEffect(() => {
        dispatch(resetSupportState());
        window.scrollTo(0, 0);

        // GSAP Animations
        const ctx = gsap.context(() => {
            gsap.fromTo('.contact-reveal',
                { y: 40, opacity: 0, filter: 'blur(8px)' },
                {
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    stagger: 0.12,
                    ease: 'power3.out',
                    delay: 0.1
                }
            );

            // Subtle scrolling scanline effect on details card
            if (scanLineRef.current) {
                gsap.to(scanLineRef.current, {
                    top: '100%',
                    duration: 5,
                    repeat: -1,
                    ease: 'none'
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [dispatch]);

    // Prefill user data if auth state changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                userName: prev.userName || user.name || user.fullName || '',
                userEmail: prev.userEmail || user.email || ''
            }));
        }
    }, [user]);

    // Handle ticket submission status changes
    useEffect(() => {
        if (success) {
            setShowSuccessOverlay(true);
            // Reset form
            setFormData({
                userName: user?.name || user?.fullName || '',
                userEmail: user?.email || '',
                code: '+91',
                phoneNumber: '',
                subject: 'General Inquiry',
                description: ''
            });
            dispatch(resetSupportState());
        }
    }, [success, dispatch, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userName || !formData.userEmail || !formData.code || !formData.phoneNumber || !formData.subject) {
            alert('Please fill name, email, phone, and subject.');
            return;
        }

        const pageUrl = new URL(window.location.href);

        const payload = {
            name: formData.userName.trim(),
            email: formData.userEmail.trim(),
            phone: `${formData.code.trim()} ${formData.phoneNumber.trim()}`.trim(),
            subject: formData.subject,
            message: formData.description.trim() || '',
            source: 'Contact Form',
            extra: {
                website: window.location.hostname,
                pageUrl: window.location.href,
                referrer: document.referrer || '',
                formName: 'Contact Form',
                utm: {
                    source: pageUrl.searchParams.get('utm_source') || '',
                    medium: pageUrl.searchParams.get('utm_medium') || '',
                    campaign: pageUrl.searchParams.get('utm_campaign') || ''
                }
            }
        };

        dispatch(submitLapaasTicket(payload));
    };

    const subjectOptions = [
        'General Inquiry',
        'Solopreneur',
        'Personal Branding',
        'Studio Services',
        'Course Enquiry',
        'Course',
        'Collaboration',
        'Cohort Enrollment',
        'Offline Mentorship Enrollment',
        'Billing or Payment Issue',
        'Feedback',
        'Complaint',
        'Other'
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400/30 relative overflow-x-hidden pt-28 md:pt-36 pb-24 px-4 md:px-12 lg:px-20">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-400 blur-[150px] rounded-full animate-float-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-300 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Contact Header */}
                <div className="mb-20 contact-reveal">
                    <span className="font-montserrat text-[10px] font-bold text-amber-800 tracking-[0.5em] uppercase mb-4 block">
                        {t('getInTouch')}
                    </span>
                    <h1 className="font-montserrat uppercase select-none text-slate-900 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                        {t('contactUs')}
                    </h1>
                    <p className="font-montserrat text-slate-600 text-sm max-w-xl mt-6 leading-relaxed">
                        {t('contactDesc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-10 contact-reveal">
                        <div className="space-y-2">
                            <h2 className="font-montserrat text-slate-900 uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                                {t('sendMessage')}
                            </h2>
                            <div className="h-[2px] w-12 bg-amber-400 mt-4" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">{t('yourNameLabel')} *</label>
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        placeholder={t('enterYourName')}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-montserrat text-xs text-slate-900 focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">{t('emailAddressLabel')} *</label>
                                    <input
                                        type="email"
                                        name="userEmail"
                                        value={formData.userEmail}
                                        onChange={handleInputChange}
                                        placeholder={t('enterYourEmail')}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-montserrat text-xs text-slate-900 focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-1 space-y-2">
                                    <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">{t('phoneCodeLabel')} *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="+91"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-montserrat text-xs text-slate-900 focus:border-amber-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">{t('phoneNumberLabel')} *</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder={t('enterYourPhone')}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 font-montserrat text-xs text-slate-900 focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold block">{t('subjectLabel')} *</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 font-montserrat text-xs text-slate-900 focus:border-amber-500 outline-none transition-all shadow-sm cursor-pointer"
                                >
                                    {subjectOptions.map(opt => (
                                        <option key={opt} value={opt} className="bg-white text-slate-900">{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="font-montserrat text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">{t('messageLabel')}</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={t('tellUsHowHelp')}
                                    rows="5"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 outline-none focus:border-amber-500 transition-all font-montserrat text-xs text-slate-900 resize-vertical shadow-sm placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-amber-400 text-slate-950 py-5 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 shadow-sm font-black font-montserrat text-xs uppercase tracking-[0.4em]"
                            >
                                {submitting ? 'SENDING...' : t('sendMessageBtn')}
                            </button>

                            {error && <p className="font-montserrat text-[10px] text-red-500 uppercase tracking-widest text-center">{error}</p>}
                        </form>
                    </div>

                    {/* Right Column: Office Coordinates / Support Info */}
                    <div className="lg:col-span-5 space-y-8 contact-reveal lg:sticky lg:top-28">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[460px] shadow-xl">
                            {/* Scanning Effect */}
                            <div ref={scanLineRef} className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10 opacity-40 shadow-sm" />

                            <div className="space-y-8">
                                {/* Header bracket */}
                                <div className="flex justify-between items-center opacity-40">
                                    <span className="font-montserrat text-[8px] tracking-[0.4em] uppercase text-slate-500">Coordinates</span>
                                    <div className="h-[1px] w-16 bg-slate-300" />
                                    <span className="font-montserrat text-[8px] tracking-[0.1em] uppercase text-slate-500">Happy Life HQ</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Email Section */}
                                    <div className="space-y-2">
                                        <h3 className="font-montserrat text-xl text-amber-800 font-bold">{t('emailSupport')}</h3>
                                        <p className="font-montserrat text-xs text-slate-600 leading-relaxed">
                                            For general inquiries, course-related questions, or technical assistance:
                                        </p>
                                        <div className="pt-2">
                                            <a
                                                href="mailto:happylifereport@gmail.com"
                                                className="font-montserrat text-base md:text-lg font-bold text-slate-900 hover:text-amber-600 transition-colors break-all"
                                            >
                                                happylifereport@gmail.com
                                            </a>
                                        </div>
                                        <p className="font-montserrat text-[9px] text-slate-500 uppercase tracking-wider">
                                            Response timeframe: <span className="text-amber-800 font-bold">24–48 hours</span>
                                        </p>
                                    </div>

                                    {/* Address Section */}
                                    {/* <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <h3 className="font-montserrat text-xl text-amber-800 font-bold">{t('officeAddress')}</h3>
                                        <div className="font-montserrat text-sm text-slate-800 leading-relaxed">
                                            <p className="font-bold text-slate-900">Lapaas Digital Private Limited</p>
                                            <p className="text-slate-600">Sec 11, Rohini</p>
                                            <p className="text-slate-600">New Delhi, India</p>
                                        </div>
                                    </div> */}

                                    {/* Feedback Info Section */}
                                    <div className="space-y-1.5 pt-4 border-t border-slate-100">
                                        <h3 className="font-montserrat text-xl text-amber-800 font-bold">{t('feedbackSuggestions')}</h3>
                                        <p className="font-montserrat text-xs text-slate-600 leading-relaxed">
                                            Your feedback helps us improve. If you have ideas, suggestions, or feature requests, email us with the subject: <span className="text-amber-800 font-bold">"Feedback – [Your Name]"</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div className="pt-8 mt-8 border-t border-slate-100">
                                <h3 className="font-montserrat text-xl text-amber-800 font-bold mb-3">{t('socialMedia')}</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="font-montserrat text-xs text-slate-600">
                                        YouTube – <a href="https://youtube.com/@happylifeastro?si=6jttLMEZmVEyoDbS" target="_blank" rel="noopener noreferrer" className="text-amber-800 font-bold hover:underline transition-all">Happy Life Astro</a>
                                    </div>
                                    <div className="font-montserrat text-xs text-slate-600">
                                        Instagram – <a href="https://www.instagram.com/happy_life_astro?utm_source=qr&stkn=MTA5NHpxc2tpeXE4Yg%3D%3D" target="_blank" rel="noopener noreferrer" className="text-amber-800 font-bold hover:underline transition-all">@happy_life_astro</a>
                                    </div>
                                    <div className="font-montserrat text-xs text-slate-600">
                                        Email – <a href="mailto:happylifereport@gmail.com" className="text-amber-800 font-bold hover:underline transition-all">happylifereport@gmail.com</a>
                                    </div>
                                </div>
                            </div>

                            {/* Corner Brackets */}
                            <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-slate-200" />
                            <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-slate-200" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-slate-200" />
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-slate-200" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SUCCESS OVERLAY */}
            {showSuccessOverlay && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
                    <div className="bg-white border border-slate-200 p-8 md:p-12 max-w-lg w-full relative overflow-hidden shadow-2xl rounded-3xl">
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600 stroke-green-600">
                                    <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <span className="font-montserrat text-[9px] text-green-700 uppercase tracking-[0.4em] font-black">Message Sent</span>
                                <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tight">Thank You.</h3>
                                <p className="font-montserrat text-[10px] text-slate-600 uppercase tracking-widest mt-2">
                                    We have received your message. Our team aims to respond within 24–48 hours.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowSuccessOverlay(false)}
                                className="mt-4 w-full bg-amber-400 text-slate-950 py-4 rounded-xl font-montserrat text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform duration-300 shadow-sm"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
