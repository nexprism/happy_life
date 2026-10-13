import React from 'react';

const LessonTrackItem = ({ title, progress, isActive, onPlay, unlocked = true, type = 'video' }) => {
    const getIcon = () => {
        switch (type) {
            case 'quiz':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                );
            case 'assignment':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                );
            case 'text':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                );
            default:
                return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>;
        }
    };

    const getLabel = () => {
        switch (type) {
            case 'quiz':
                return <span className="font-montserrat text-[8px] bg-purple-600/20 text-purple-400 border border-purple-600/30 px-2 py-0.5 uppercase tracking-widest font-black">Quiz</span>;
            case 'assignment':
                return <span className="font-montserrat text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 uppercase tracking-widest font-black">Assignment</span>;
            case 'text':
                return <span className="font-montserrat text-[8px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 uppercase tracking-widest font-black">Reading</span>;
            default:
                return (
                    <>
                        <span className="font-montserrat text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 uppercase tracking-widest font-black">Video</span>
                        <span className="font-montserrat text-[8px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 uppercase tracking-widest font-black">Secure</span>
                    </>
                );
        }
    };

    const getButtonText = () => {
        switch (type) {
            case 'quiz': return 'Take Quiz';
            case 'assignment': return 'Submit';
            case 'text': return 'Read';
            default: return 'Play';
        }
    };

    return (
        <div className={`group flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 md:p-6 border transition-all duration-300 hover:border-accent/30 bg-white/[0.01] 
            ${isActive ? 'border-accent/40 bg-accent/[0.02]' : 'border-white/5 hover:bg-white/[0.02]'}`}>
            
            <div className="flex items-start md:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                {/* Tactical Icon */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0
                    ${isActive ? 'bg-accent text-white border-accent' : 'bg-white/5 border-white/10 text-accent/60 group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10'}`}>
                    {getIcon()}
                </div>

                <div className="space-y-2 sm:space-y-3 flex-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h4 className="font-montserrat text-sm sm:text-base font-bold text-normal tracking-tight truncate leading-tight group-hover:text-accent transition-colors">
                            {title}
                        </h4>
                        <div className="flex gap-2">
                            {getLabel()}
                        </div>
                    </div>

                    {/* Tactical Progress Protocol */}
                    <div className="space-y-1.5 max-w-sm">
                        <div className="flex justify-between items-center font-montserrat text-[9px] font-black tracking-[0.2em] uppercase">
                                <span className="text-description/80">Progress: {typeof progress === 'number' ? (Math.round(progress) === progress ? `${progress}%` : `${progress.toFixed(1)}%`) : `${progress}%`}</span>
                            </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-full relative overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-1000 ease-out-quint shadow-[0_0_15px_rgba(33,113,181,0.4)]" 
                                    style={{ width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%` }} 
                                />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 md:mt-0 md:pl-6 flex items-center pr-2 shrink-0">
                {unlocked ? (
                    <button 
                        onClick={onPlay}
                        className="relative bg-accent text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-montserrat text-xs sm:text-sm font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md group/btn overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
                        {getButtonText()}
                    </button>
                ) : (
                    <button
                        onClick={onPlay}
                        className="relative bg-white/5 text-description px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-montserrat text-xs sm:text-sm font-semibold uppercase tracking-widest opacity-80 cursor-not-allowed border border-white/10"
                    >
                        <div className="inline-flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Locked
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default LessonTrackItem;
