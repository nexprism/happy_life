import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MobileExclusiveModal = ({ isOpen, onClose }) => {
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' });
            gsap.fromTo(contentRef.current, 
                { scale: 0.9, y: 30, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }
            );

            const handleKeyDown = (e) => {
                if (e.key === 'Escape') handleClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    const handleClose = () => {
        gsap.to(contentRef.current, { scale: 0.9, y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
        gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.in', onComplete: onClose });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                ref={overlayRef}
                onClick={handleClose}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md opacity-0"
            />
            
            {/* Modal Content */}
            <div 
                ref={contentRef}
                className="relative w-full max-w-sm sm:max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-black/80 overflow-hidden opacity-0"
            >
                {/* Decorative Background Beam */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-[#4b9ee5]/50 to-transparent" />

                {/* Close Button Top Right */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
                    aria-label="Close"
                >
                    ✕
                </button>
                
                {/* Icon Container */}
                <div className="relative group pt-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#2171B5]/10 border border-[#2171B5]/30 flex items-center justify-center mx-auto transition-transform duration-500 group-hover:scale-105">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-[#4b9ee5]">
                            <path d="M22 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z"/>
                            <path d="m15 15-6-6"/>
                            <path d="m9 15 6-6"/>
                            <path d="M12 19v3"/>
                            <path d="M9 22h6"/>
                        </svg>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h2 className="font-montserrat text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                        Mobile Exclusive <span className="text-[#4b9ee5]">Content</span>
                    </h2>
                    <p className="font-montserrat text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xs mx-auto">
                        This tactical transmission is restricted to mobile architecture. 
                        <span className="block mt-1 text-[#4b9ee5] font-semibold">Download our app now to continue!</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-1">
                    <button className="w-full bg-[#2171B5] hover:bg-[#1b5c94] text-white py-3.5 px-6 rounded-xl font-montserrat text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#2171B5]/25 hover:shadow-[#2171B5]/40 active:scale-95 cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Download App
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="font-montserrat text-xs text-slate-400 hover:text-white uppercase tracking-wider font-semibold transition-colors block mx-auto underline underline-offset-4 decoration-white/10 hover:decoration-white/30 cursor-pointer"
                    >
                        Close Dispatch
                    </button>
                </div>

                {/* Security Tag */}
                <div className="pt-2 border-t border-white/10">
                    <p className="font-montserrat text-[10px] text-slate-500 uppercase tracking-widest font-medium">End of Transmission // Protocol 7-B</p>
                </div>
            </div>
        </div>
    );
};

export default MobileExclusiveModal;
