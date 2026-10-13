import React from 'react';

const LockedModal = ({ isOpen, onClose, title = 'Locked Lesson', message = '' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 z-10 shadow-2xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-montserrat text-2xl text-slate-900">{title}</h3>
                        <p className="mt-2 text-slate-600 text-sm font-medium">{message}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 text-lg">✕</button>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-accent text-slate-950 font-black uppercase tracking-widest rounded-full shadow-accent-soft">Close</button>
                </div>
            </div>
        </div>
    );
};

export default LockedModal;
