import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import sanitizeDisplay from '../utils/textSanitize'
import LessonTrackItem from '../components/dashboard/LessonTrackItem';
import MobileExclusiveModal from '../components/dashboard/MobileExclusiveModal';
import LockedModal from '../components/dashboard/LockedModal';
import authorizedFetch from '../utils/apiClient';
import { useTracker } from '../components/ActivityTracker';

const courseCurriculum = [
    {
        _id: 'm1',
        title: 'Architectural Foundations',
        lessons: [
            { _id: 'l1', title: 'Spatial Geometry & Theory', type: 'video', progress: 100 },
            { _id: 'l2', title: 'Material Resistance Protocol', type: 'video', progress: 45 },
            { _id: 'l3', title: 'Structure Validation Quiz', type: 'quiz', progress: 0 },
        ]
    },
    {
        _id: 'm2',
        title: 'Advanced System Integration',
        lessons: [
            { _id: 'l4', title: 'Dynamic Loading States', type: 'video', progress: 0 },
            { _id: 'l5', title: 'Security Perimeter Setup', type: 'video', progress: 0 },
        ]
    }
];

import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseDetail } from '../redux/slices/courseSlice';
import { fetchLessonsStatus, setLessonStatus } from '../redux/slices/dripSlice';
import socketService from '../services/socketService';

const DashboardCoursePlayer = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentCourse, detailLoading, error } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.auth);
    const dripStatuses = useSelector((state) => state.drip?.statuses || {});
    const dripLoading = useSelector((state) => state.drip?.loading);
    const dripError = useSelector((state) => state.drip?.error);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [lockedModalOpen, setLockedModalOpen] = useState(false);
    const [lockedModalMessage, setLockedModalMessage] = useState('');
    const [isObscured, setIsObscured] = useState(false);
    const [securityWarning, setSecurityWarning] = useState('');
    const containerRef = useRef(null);
    const syncProgressRef = useRef(null);
    const lastVideoSyncTimeRef = useRef(0);
    const { trackEvent } = useTracker();

    console.log('Current Course Data:', currentCourse);
    console.log('Selected Lesson:', selectedLesson);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) {
            dispatch(fetchCourseDetail(id));
        }
    }, [id, dispatch]);

    const reportIncidentRef = useRef(null);
    // Updated on every render so the latest selectedLesson and currentCourse are always available
    reportIncidentRef.current = async (incidentType, extraDetails = {}) => {
        if (!currentCourse || !user) return;
        try {
            const videoId = selectedLesson?.videoLessons?.[0]?._id || selectedLesson?.videoLessons?.[0]?.id || selectedLesson?.videoLessonId || selectedLesson?.videoId || null;
            const body = JSON.stringify({
                incidentType: incidentType,
                courseId: currentCourse._id || id,
                videoId: videoId || null,
                lessonId: selectedLesson?._id || null,
                details: {
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    videoType: selectedLesson?.videoLessons?.[0]?.sourcePlatform || "unknown",
                    sessionId: "sess_" + Math.random().toString(36).substr(2, 9),
                    ...extraDetails
                }
            });
            await authorizedFetch('/security/incidents', { method: 'POST', body });
        } catch (e) {
            console.warn("Failed to report security incident:", e);
        }
    };

    // Anti-Piracy / Security Logic
    useEffect(() => {
        const preventDevTools = (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
                (e.ctrlKey && ['U', 'u'].includes(e.key)) ||
                (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) // Mac specific
            ) {
                e.preventDefault();
                setSecurityWarning('Unauthorized action detected. Continued violations will result in account suspension.');
                if (reportIncidentRef.current) reportIncidentRef.current('DEV_TOOLS_OPEN_ATTEMPT', { key: e.key });
                return false;
            }
        };

        const preventRightClick = (e) => {
            e.preventDefault();
            setSecurityWarning('Unauthorized action detected. Inspecting or copying content is strictly prohibited.');
            if (reportIncidentRef.current) reportIncidentRef.current('RIGHT_CLICK_ATTEMPT');
            return false;
        };
        
        const preventCopyPaste = (e) => {
            e.preventDefault();
            setSecurityWarning('Unauthorized action detected. Copying course content is strictly prohibited.');
            return false;
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsObscured(true);
                if (reportIncidentRef.current) reportIncidentRef.current('SCREEN_OBSCURED', { reason: 'visibility_hidden' });
            } else {
                setIsObscured(false);
            }
        };

        const handleBlur = () => {
            setTimeout(() => {
                if (document.activeElement?.tagName === 'IFRAME') {
                    // User clicked inside the video player iframe; do not obscure
                    return;
                }
                if (document.hidden) {
                    setIsObscured(true);
                    if (reportIncidentRef.current) reportIncidentRef.current('SCREEN_OBSCURED', { reason: 'window_blur' });
                }
            }, 100);
        };
        const handleFocus = () => setIsObscured(false);

        // Add event listeners
        window.addEventListener('keydown', preventDevTools);
        document.addEventListener('contextmenu', preventRightClick);
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('dragstart', preventCopyPaste);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            // Cleanup
            window.removeEventListener('keydown', preventDevTools);
            document.removeEventListener('contextmenu', preventRightClick);
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('dragstart', preventCopyPaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        if (currentCourse && !detailLoading) {
            const ctx = gsap.context(() => {
                gsap.fromTo('.player-reveal',
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
        }
    }, [currentCourse, detailLoading]);

    // Automatically open first module accordion if none selected
    useEffect(() => {
        if (currentCourse && !selectedLesson && !detailLoading) {
            const firstModule = currentCourse.modules?.[0];
            if (firstModule) {
                setActiveAccordion(firstModule._id || 0);
            }
        }
    }, [currentCourse, detailLoading]);

    // Fetch unlock/progress statuses for lessons in currentCourse with bounded concurrency
    useEffect(() => {
        if (!currentCourse || !user) return;

        const lessons = [];
        (currentCourse.modules || []).forEach((m) => {
            (m.lessons || []).forEach((l) => {
                lessons.push({ ...(l || {}), courseId: currentCourse._id || id });
            });
        });

        if (lessons.length > 0) {
            dispatch(fetchLessonsStatus({ userId: user._id || user.id || user?.userId, lessons }));
        }
    }, [currentCourse, user, id, dispatch]);


    const refreshStatuses = () => {
        if (!currentCourse || !user) return;
        const lessons = [];
        (currentCourse.modules || []).forEach((m) => {
            (m.lessons || []).forEach((l) => lessons.push({ ...(l || {}), courseId: currentCourse._id || id }));
        });
        if (lessons.length > 0) dispatch(fetchLessonsStatus({ userId: user._id || user.id || user?.userId, lessons }));
    };

    const handleLessonPlay = async (lesson) => {
        // If lesson is a quiz, navigate to the quiz flow instead of video player
        const lid = lesson._id || lesson.id;
        const lessonStatus = dripStatuses[lid];
        if (lessonStatus && lessonStatus.unlocked === false) {
            setLockedModalMessage('This lesson is currently locked. Complete prerequisites to unlock it.');
            setLockedModalOpen(true);
            return;
        }
        // Check if OTP needs refresh (TTL is usually 300s / 5m)
        const video = lesson.videoLessons?.[0];
        const isVdoCipher = video?.sourcePlatform === 'videocypher';
        
        if (isVdoCipher && video.vdoCipherPlayback) {
            const fetchedAt = new Date(video.vdoCipherPlayback.fetchedAt).getTime();
            const now = new Date().getTime();
            const ageInSeconds = (now - fetchedAt) / 1000;
            
            // If OTP is older than 4 minutes (240s), refresh the whole course detail to get new tokens
            if (ageInSeconds > 240) {
                await dispatch(fetchCourseDetail(id));
                // After refresh, the lesson object in 'currentCourse' will have new tokens
                // We need to find the updated lesson object
                return; // The useEffect or a subsequent click will handle it, or we can find it now
            }
        }

        if (lesson.ismobileOnly && lesson.type !== 'quiz') {
            setIsMobileModalOpen(true);
        } else {
            // Log lesson play event
            trackEvent('play_lesson', {
                lessonId: lesson._id || lesson.id,
                title: lesson.title,
                type: lesson.type || 'video',
                courseId: currentCourse?._id || id,
            });

            // notify server about last played video (include tokens)
            try {
                const videoId = lesson.videoLessons?.[0]?._id || lesson.videoLessons?.[0]?.id || lesson.videoLessonId || lesson.videoId || null;
                if (videoId) {
                    const body = JSON.stringify({ courseId: currentCourse._id || id, videoLessonId: videoId });
                    const r = await authorizedFetch('/course-completion/update-last-video', { method: 'POST', body });
                    if (r.status === 401) {
                        console.warn('update-last-video returned 401');
                    }
                } else {
                    console.warn('update-last-video skipped: no video id available for lesson', lesson._id || lesson.id);
                }
            } catch (e) {
                console.warn('update-last-video error', e);
            }

            if (lesson?.type === 'assignment') {
            navigate(`/dashboard/assignment/${id}/${lesson._id || lesson.id}`);
            return;
        }

        if (lesson?.type === 'text') {
            navigate(`/dashboard/reading/${id}/${lesson._id || lesson.id}`);
            return;
        }

        if (lesson?.type === 'quiz') {
            navigate(`/dashboard/quiz/${id}/${lesson._id || lesson.id}`);
            return;
        }

        setSelectedLesson(lesson);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isDirectVideoUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        const clean = url.toLowerCase().split('?')[0];
        if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mkv') || clean.endsWith('.mov')) {
            return true;
        }
        if (url.includes('/video/upload/') || url.includes('res.cloudinary.com')) {
            return true;
        }
        if (url.includes('blob:')) return true;
        return false;
    };

    const getVideoSrc = (lesson) => {
        if (!lesson) return '';
        
        // Handle case where videoLessons is an array
        if (Array.isArray(lesson.videoLessons) && lesson.videoLessons.length > 0) {
            const video = lesson.videoLessons[0];
            
            let decVideoId = video.videoId;
            let decSecureUrl = video.secureUrl;
            let decVideoUrl = video.videoUrl;
            if (video.isEncrypted) {
                const dec = (s) => s?.startsWith('ENC_') ? atob(s.replace('ENC_', '')).split('').reverse().join('') : s;
                decVideoId = dec(video.videoId);
                decSecureUrl = dec(video.secureUrl);
                decVideoUrl = dec(video.videoUrl);
            }

            if (video.sourcePlatform === 'videocypher' && video.vdoCipherPlayback) {
                return `https://player.vdocipher.com/v2/?otp=${video.vdoCipherPlayback.otp}&playbackInfo=${video.vdoCipherPlayback.playbackInfo}`;
            }
            if (video.sourcePlatform === 'youtube') {
                const ytId = decVideoId || decVideoUrl?.split('v=')[1]?.split('&')[0] || decSecureUrl?.split('v=')[1]?.split('&')[0] || decVideoUrl?.split('youtu.be/')[1]?.split('?')[0] || decVideoUrl;
                const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
                return `https://www.youtube.com/embed/${ytId}?enablejsapi=1&origin=${origin}&modestbranding=1&rel=0&controls=1&showinfo=0&fs=1`;
            }
            if (video.sourcePlatform === 'vimeo') {
                const url = decSecureUrl || decVideoUrl || video.embedUrl || '';
                if (url.includes('player.vimeo.com/video/')) {
                    const separator = url.includes('?') ? '&' : '?';
                    return `${url}${separator}api=1&title=0&byline=0&portrait=0&dnt=1`;
                }
                const cleanId = decVideoId || url.replace(/^https?:\/\/(?:www\.)?vimeo\.com\//, '').split('?')[0];
                return `https://player.vimeo.com/video/${cleanId}?api=1&title=0&byline=0&portrait=0&dnt=1`;
            }
            if (decVideoUrl) return decVideoUrl;
            if (decSecureUrl) return decSecureUrl;
        }
        
        // Handle direct fileUrl or legacy schema
        if (lesson.fileUrl) return lesson.fileUrl;
        if (lesson.video && lesson.video.url) {
            return lesson.video.url;
        }
        if (lesson.source) return lesson.source;
        
        return '';
    };

    const videoSrc = getVideoSrc(selectedLesson);

    // Automatic video progress sync effect (Handles YouTube, Vimeo, VdoCipher postMessages & active watching ticker)
    useEffect(() => {
        if (!selectedLesson || !user) return;
        const lid = selectedLesson._id || selectedLesson.id;
        if (!lid) return;

        const lessonDuration = (selectedLesson.duration ? Number(selectedLesson.duration) * 60 : 0) || 
                               selectedLesson.videoLessons?.[0]?.duration || 
                               300;

        let accumulatedTime = 0;
        const currentInitialProgress = dripStatuses[lid]?.progress || 0;
        if (currentInitialProgress > 0) {
            accumulatedTime = (currentInitialProgress / 100) * lessonDuration;
        }

        const syncProgress = async (pct, currentTime, duration, isComplete = false) => {
            const roundedPct = Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
            const prevProgress = dripStatuses[lid]?.progress || 0;

            if (roundedPct < prevProgress && !isComplete) return;

            // 1. Instant Redux update for real-time progress bar UI in curriculum index
            dispatch(setLessonStatus({
                lessonId: lid,
                status: {
                    progress: Math.max(prevProgress, roundedPct),
                    unlocked: true,
                    completed: isComplete || roundedPct >= 80
                }
            }));

            // 2. Sync to Backend
            try {
                const targetCourseId = currentCourse?._id || id;
                const videoId = selectedLesson?.videoLessons?.[0]?._id || selectedLesson?.videoLessons?.[0]?.id || selectedLesson?.videoId || lid;

                await authorizedFetch(`/courses/${targetCourseId}/lessons/${lid}/progress`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        progressPercentage: roundedPct,
                        currentTime: Math.round(currentTime),
                        duration: Math.round(duration),
                        watchTime: Math.round(currentTime),
                        completed: isComplete || roundedPct >= 80
                    })
                });

                if (socketService?.socket?.connected) {
                    socketService.socket.emit('video-progress', {
                        videoId,
                        userId: user._id || user.id,
                        currentTime: Math.round(currentTime),
                        duration: Math.round(duration),
                        courseId: targetCourseId,
                        lessonId: lid
                    });
                }

                if ((isComplete || roundedPct >= 80) && !dripStatuses[lid]?.completed) {
                    await authorizedFetch(`/${targetCourseId}/${lid}/complete`, { method: 'POST' });
                    refreshStatuses();
                }
            } catch (err) {
                console.warn('[Progress] Sync error:', err);
            }
        };

        syncProgressRef.current = syncProgress;

        // Window message listener for YouTube / Vimeo / VdoCipher postMessage events
        const handlePostMessage = (event) => {
            try {
                let data = event.data;
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch (e) {}
                }
                if (!data) return;

                // YouTube IFrame API messages
                if (data.event === 'infoDelivery' && data.info) {
                    const { currentTime, duration, playerState } = data.info;
                    if (duration && currentTime !== undefined) {
                        const pct = (currentTime / duration) * 100;
                        syncProgress(pct, currentTime, duration, playerState === 0 || pct >= 95);
                    }
                }

                // Vimeo messages
                if (data.event === 'timeupdate' && data.data) {
                    const { percent, seconds, duration } = data.data;
                    const dur = duration || lessonDuration;
                    const pct = (percent != null ? percent * 100 : (seconds / dur) * 100);
                    syncProgress(pct, seconds, dur, pct >= 95);
                }
                if (data.event === 'ended') {
                    syncProgress(100, lessonDuration, lessonDuration, true);
                }

                // VdoCipher messages
                if (data.type === 'timeupdate' && data.currentTime !== undefined) {
                    const { currentTime, duration } = data;
                    const dur = duration || lessonDuration;
                    const pct = (currentTime / dur) * 100;
                    syncProgress(pct, currentTime, dur, pct >= 95);
                }
                if (data.type === 'ended' || data.event === 'ended') {
                    syncProgress(100, lessonDuration, lessonDuration, true);
                }
            } catch (e) {}
        };

        window.addEventListener('message', handlePostMessage);

        // Fallback ticker: smoothly increments progress as student watches the video
        const intervalId = setInterval(() => {
            if (document.hidden) return; // Only tick when user is actively on the tab
            accumulatedTime += 5;
            const computedPct = Math.min(100, (accumulatedTime / lessonDuration) * 100);
            syncProgress(computedPct, accumulatedTime, lessonDuration, computedPct >= 95);
        }, 5000);

        return () => {
            window.removeEventListener('message', handlePostMessage);
            clearInterval(intervalId);
        };
    }, [selectedLesson?._id || selectedLesson?.id, currentCourse?._id, user?._id]);

    if (detailLoading) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-8 space-y-6">
                <div className="bg-red-500/10 border border-red-500/20 p-12 text-center space-y-4 max-w-xl">
                    <p className="font-montserrat text-[10px] text-red-500 uppercase tracking-[0.4em] font-black">Decryption Error</p>
                    <p className="font-montserrat text-2xl text-red-500/80">{error}</p>
                    <button 
                        onClick={() => dispatch(fetchCourseDetail(id))}
                        className="px-12 py-4 bg-red-500/20 text-red-500 font-montserrat text-[10px] uppercase tracking-widest hover:bg-red-500/30 transition-all"
                    >
                        Re-establish Protocol
                    </button>
                </div>
            </div>
        );
    }

    if (!currentCourse) return null;

    return (
        <div ref={containerRef} className="min-h-screen bg-dark text-white selection:bg-accent/40 relative overflow-x-hidden">
            <DashboardHeader />
            
            <main className="pt-20 pb-4 px-4">
                <div className="space-y-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-8 player-reveal opacity-0">
                        <div className="space-y-4">
                           <Link to="/dashboard/my-courses" className="font-montserrat text-[8px] text-accent/40 uppercase tracking-[0.4em] hover:text-accent transition-colors flex items-center gap-2">
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
                               Return to Curriculum
                           </Link>
                           <h1 className="font-montserrat text-normal uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                               {sanitizeDisplay(currentCourse.title)}
                           </h1>
                           <div className="flex items-center gap-6 pt-2">
                               <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(139, 92, 246,0.5)]" />
                                   <span className="font-montserrat text-[9px] text-accent font-black uppercase tracking-widest leading-none">
                                       {selectedLesson ? `Viewing: ${selectedLesson.title}` : 'Session Protocol Active'}
                                   </span>
                                </div>
                               <span className="font-montserrat text-[8px] text-description/20 uppercase tracking-[0.4em] leading-none">
                                   {currentCourse.modules?.length || 0} Modules Curated
                               </span>
                           </div>
                        </div>
                    </div>

                    {/* Dashboard Video Area */}
                    {selectedLesson && (
                        <div 
                            className="animate-in fade-in duration-700 w-full aspect-video bg-[#0d0d0d] border border-white/5 relative overflow-hidden flex items-center justify-center group shadow-2xl mb-8"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
                                {selectedLesson.type === 'video' || (selectedLesson.videoLessons?.length > 0) || selectedLesson.type === 'video-lesson' || selectedLesson.fileUrl ? (
                                    videoSrc ? (
                                        isDirectVideoUrl(videoSrc) ? (
                                            <video 
                                                src={videoSrc}
                                                controls
                                                playsInline
                                                className={`w-full h-full object-contain absolute inset-0 z-0 transition-all duration-300 ${isObscured ? 'opacity-0 pointer-events-none filter blur-xl' : 'opacity-100'}`}
                                                onTimeUpdate={(e) => {
                                                    const cur = e.target.currentTime;
                                                    const dur = e.target.duration || ((selectedLesson.duration ? selectedLesson.duration * 60 : 0) || 300);
                                                    if (dur > 0) {
                                                        const pct = (cur / dur) * 100;
                                                        const lid = selectedLesson._id || selectedLesson.id;
                                                        dispatch(setLessonStatus({
                                                            lessonId: lid,
                                                            status: { progress: Math.round(pct), unlocked: true }
                                                        }));

                                                        const now = Date.now();
                                                        if (now - lastVideoSyncTimeRef.current > 4000) {
                                                            lastVideoSyncTimeRef.current = now;
                                                            if (syncProgressRef.current) {
                                                                syncProgressRef.current(pct, cur, dur, pct >= 95);
                                                            }
                                                        }
                                                    }
                                                }}
                                                onEnded={async () => {
                                                    const lid = selectedLesson._id || selectedLesson.id;
                                                    const targetCourseId = currentCourse?._id || id;
                                                    dispatch(setLessonStatus({
                                                        lessonId: lid,
                                                        status: { progress: 100, unlocked: true, completed: true }
                                                    }));
                                                    try {
                                                        await authorizedFetch(`/${targetCourseId}/${lid}/complete`, { method: 'POST' });
                                                        refreshStatuses();
                                                    } catch (e) {}
                                                }}
                                            />
                                        ) : (
                                            <iframe 
                                                src={videoSrc} 
                                                className={`w-full h-full border-0 absolute inset-0 z-0 transition-all duration-300 ${isObscured ? 'opacity-0 pointer-events-none filter blur-xl' : 'opacity-100'}`}
                                                allowFullScreen
                                                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                                                title={selectedLesson.title}
                                                onError={() => {
                                                    if (reportIncidentRef.current) {
                                                        reportIncidentRef.current('VDOCIPHER_PLAYER_ERROR', { error: 'Failed to initialize VdoPlayer' });
                                                    }
                                                }}
                                            />
                                        )
                                    ) : (
                                        <div className="text-center space-y-4 z-10 relative">
                                            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                            </div>
                                            <p className="font-montserrat text-[10px] text-red-500/80 uppercase tracking-widest">Media Source Not Found</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center space-y-4 z-10 relative">
                                        <div className="w-16 h-16 bg-accent/10 text-accent border border-accent/20 rounded-full flex items-center justify-center mx-auto">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM12 6v6l4 2"/></svg>
                                        </div>
                                        <p className="font-montserrat text-[10px] text-accent/80 uppercase tracking-widest">Protocol Type Unrecognized</p>
                                    </div>
                                )}
                                
                                {/* Obscured Overlay for Screen Sharing Prevention */}
                                {isObscured && (
                                    <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center pointer-events-none">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20 mb-4">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11h8"/><path d="M12 15V7"/>
                                        </svg>
                                        <p className="font-montserrat text-[10px] text-white/50 uppercase tracking-[0.4em]">Content Protected</p>
                                    </div>
                                )}

                                {/* Security Watermark */}
                                {user?.email && (
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-50">
                                        <div className="absolute animate-float-slow opacity-[0.03] md:opacity-[0.05] whitespace-nowrap">
                                            <p className="font-montserrat text-[10px] md:text-[14px] text-white tracking-[0.2em] font-black uppercase">
                                                {user.email} • {user.email} • {user.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DRM Troubleshooting Note */}
                    {selectedLesson?.videoLessons?.[0]?.sourcePlatform === 'videocypher' && (
                        <div className="player-reveal opacity-0 py-2 border-l-2 border-accent/20 pl-4">
                            <p className="font-montserrat text-[8px] text-description/80 uppercase tracking-[0.4em] leading-relaxed">
                                Security Protocol: If feed decryption fails, ensure <span className="text-accent/60 font-black">Incognito Mode</span> is disabled and <span className="text-accent/60 font-black">Protected Content</span> is allowed in system settings.
                            </p>
                        </div>
                    )}

                    {/* Curated Curriculum Accordion */}
                    <div className="player-reveal opacity-0 space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                           <p className="font-montserrat text-[8px] text-accent uppercase tracking-[0.6em] font-black underline decoration-accent/20 underline-offset-4">Dossier Index</p>
                           <div className="h-[1px] bg-white/5 flex-1" />
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-[12px] text-description/80">Status:</div>
                            {dripLoading ? (
                                <div className="text-[12px] text-accent">Fetching lesson statuses...</div>
                            ) : dripError ? (
                                <div className="text-[12px] text-red-400">Error fetching statuses</div>
                            ) : (
                                <div className="text-[12px] text-green-400">Statuses loaded</div>
                            )}
                            <button onClick={refreshStatuses} className="ml-4 px-3 py-1 bg-white/5 border border-white/5 text-[12px]">Refresh</button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {currentCourse.modules?.map((module, i) => (
                                <div 
                                    key={module._id || i}
                                    className={`group border transition-all duration-500 rounded-xl bg-white
                                        ${activeAccordion === (module._id || i) ? 'border-amber-400 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <button 
                                        onClick={() => setActiveAccordion(activeAccordion === (module._id || i) ? null : (module._id || i))}
                                        className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-10 h-10 border rounded-lg flex items-center justify-center font-montserrat text-[10px] transition-all duration-700
                                                ${activeAccordion === (module._id || i) ? 'bg-amber-400 text-slate-950 border-amber-400 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700'}`}>
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className={`font-montserrat text-xl md:text-2xl lowercase tracking-tight transition-colors ${activeAccordion === (module._id || i) ? 'text-slate-900 font-semibold' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                    {sanitizeDisplay(module.title)}
                                                </h3>
                                                <p className="font-montserrat text-[8px] text-slate-500 uppercase tracking-widest">
                                                    {module.lessons?.length || 0} Lessons Integrated
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`transition-transform duration-700 ${activeAccordion === (module._id || i) ? 'rotate-180 text-amber-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m18 15-6-6-6 6"/></svg>
                                        </div>
                                    </button>
                                    
                                    <div className={`transition-all duration-500 ease-in-out ${activeAccordion === (module._id || i) ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                        <div className="border-t border-slate-200 divide-y divide-slate-100">
                                            {module.lessons?.map((lesson, li) => {
                                                const lid = lesson._id || lesson.id || li;
                                                const status = dripStatuses[lid] || {};
                                                const progress = status.progress ?? lesson.progress ?? 0;
                                                const unlocked = typeof status.unlocked === 'boolean' ? status.unlocked : true;
                                                return (
                                                    <LessonTrackItem 
                                                        key={lesson._id || li}
                                                        title={lesson.title}
                                                                type={lesson.type}
                                                        progress={progress}
                                                        unlocked={unlocked}
                                                        isActive={selectedLesson?._id === lesson._id}
                                                        onPlay={() => handleLessonPlay(lesson)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <MobileExclusiveModal 
                isOpen={isMobileModalOpen} 
                onClose={() => setIsMobileModalOpen(false)} 
            />
            <LockedModal isOpen={lockedModalOpen} onClose={() => setLockedModalOpen(false)} message={lockedModalMessage} />

            {/* SECURITY WARNING MODAL */}
            {securityWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
                    <div className="bg-dark border border-red-500/30 p-8 md:p-12 max-w-lg w-full relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] group">
                        {/* Decorative background */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 relative">
                                <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20" />
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500 stroke-red-500">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2.5" strokeLinecap="round" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>

                            <div className="space-y-2">
                                <p className="font-montserrat text-[10px] text-red-500 uppercase tracking-[0.4em] font-black">Security Violation</p>
                                <h3 className="font-montserrat text-3xl md:text-4xl text-normal tracking-tight">Warning Issued.</h3>
                                <p className="font-montserrat text-[11px] text-normal/70 uppercase tracking-widest mt-4 leading-relaxed">
                                    {securityWarning}
                                </p>
                            </div>

                            <button 
                                onClick={() => setSecurityWarning('')}
                                className="mt-4 w-full bg-red-500/20 text-red-500 py-5 font-montserrat text-xs font-black uppercase tracking-[0.4em] hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCoursePlayer;
