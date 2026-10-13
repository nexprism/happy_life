import React from 'react';

export default function SessionExpiredPopup({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-dark border border-red-500/30 p-8 md:p-12 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center group">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 relative">
                <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-500 stroke-red-500">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            <div className="space-y-2">
                <p className="font-montserrat text-[10px] text-red-500 uppercase tracking-[0.4em] font-black">Security Alert</p>
                <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Session Expired</h2>
                <p className="font-montserrat text-[11px] text-normal/70 uppercase tracking-widest mt-2 leading-relaxed">
                    {message}
                </p>
            </div>

            <button 
                onClick={onClose}
                className="mt-4 w-full bg-red-500/20 text-red-500 py-4 font-montserrat text-xs font-black uppercase tracking-[0.4em] hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
            >
                Log In Again
            </button>
        </div>
      </div>
    </div>
  );
}
