import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", loading = false }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 backdrop-blur-sm bg-slate-900/60 animate-in fade-in duration-500" 
         onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="w-full max-w-[420px] bg-white border border-slate-200 p-8 relative overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6">
        
        {/* Content Section */}
        <div className="flex flex-col items-center text-center gap-4 relative z-10">
           <div className="w-14 h-14 rounded-full border border-amber-200 flex items-center justify-center bg-amber-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-700">
                 <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
           
           <div className="space-y-2">
              <h3 className="font-montserrat text-3xl text-slate-900 font-bold tracking-tighter leading-tight">
                 {title}
              </h3>
              <p className="font-montserrat text-[10px] text-slate-600 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto font-medium">
                 {message}
              </p>
           </div>
        </div>

        {/* Action Protocol Cluster */}
        <div className="flex flex-col gap-3 relative z-10">
           <button 
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-4 bg-accent text-slate-950 font-montserrat text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-105 transition-all rounded-full shadow-accent-soft disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <span className="relative z-10">{loading ? 'Processing...' : confirmText}</span>
           </button>
           
           <button 
              onClick={onClose}
              disabled={loading}
              className="w-full py-3.5 border border-slate-200 text-slate-700 font-montserrat text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-slate-100 transition-all rounded-full"
           >
              {cancelText}
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
