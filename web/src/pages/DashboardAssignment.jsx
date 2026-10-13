import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseDetail } from '../redux/slices/courseSlice';
import sanitizeDisplay from '../utils/textSanitize';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import authorizedFetch from '../utils/apiClient';

const DashboardAssignment = () => {
    const { courseId, id } = useParams();
    const dispatch = useDispatch();
    const { currentCourse, detailLoading } = useSelector((state) => state.courses);

    const [activeTab, setActiveTab] = useState('instructions'); // 'instructions', 'submission', 'my_submissions'
    const [writtenResponse, setWrittenResponse] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!currentCourse || String(currentCourse._id) !== String(courseId)) {
            dispatch(fetchCourseDetail(courseId));
        }
    }, [courseId, dispatch, currentCourse]);

    useEffect(() => {
        if (activeTab === 'my_submissions' && id) {
            fetchUserSubmissions();
        }
    }, [activeTab, id]);

    const fetchUserSubmissions = async () => {
        if (!assignment?._id) return;
        setSubmissionsLoading(true);
        try {
            const response = await authorizedFetch(`/assignment-submissions/my`);
            if (response.ok) {
                const data = await response.json();
                // Filter submissions for this specific assignment
                const filtered = (data.data || []).filter(sub => {
                    const subAssignmentId = typeof sub.assignmentId === 'object' ? sub.assignmentId?._id : sub.assignmentId;
                    return String(subAssignmentId) === String(assignment._id);
                });
                setSubmissions(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // Find the lesson/assignment in the loaded course
    let assignment = null;
    let lessonTitle = '';
    if (currentCourse) {
        for (const m of currentCourse.modules || []) {
            for (const l of m.lessons || []) {
                const lid = l._id || l.id;
                if (String(lid) === String(id) && l.assignment) {
                    assignment = l.assignment;
                    lessonTitle = l.title;
                    break;
                }
            }
            if (assignment) break;
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!writtenResponse && selectedFiles.length === 0) {
            alert('Please provide a written response or attach a file.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('submissionText', writtenResponse);
            selectedFiles.forEach((file) => {
                formData.append('attachments', file);
            });
            formData.append('courseId', courseId);
            formData.append('lessonId', id);
            formData.append('assignmentId', assignment._id);

            const response = await authorizedFetch(`/assignment-submissions/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setWrittenResponse('');
                setSelectedFiles([]);
                setShowSuccessModal(true);
                fetchUserSubmissions();
            } else {
                const err = await response.json();
                alert(err.message || 'Submission failed. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (detailLoading) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="min-h-screen bg-dark text-white flex items-center justify-center p-8">
                <div className="max-w-2xl text-center space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h2 className="font-montserrat text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Assignment Briefing Not Found</h2>
                    <p className="text-description/60 font-montserrat uppercase tracking-widest text-[10px]">Security Clearance Failure or Invalid Mission ID</p>
                    <Link to="/dashboard/my-courses" className="inline-block px-12 py-4 bg-accent text-dark font-montserrat font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all">Return to Command</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white selection:bg-accent/40 relative">
            <DashboardHeader />
            
            <main className="pt-20 pb-4 px-6">
                <div className="space-y-8">
                    {/* Header Protocol */}
                    <div className="space-y-6">
                        <Link to={`/dashboard/course/${courseId}`} className="font-montserrat text-[8px] text-accent/40 uppercase tracking-[0.4em] hover:text-accent transition-colors flex items-center gap-2">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
                            Return to Session
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <p className="font-montserrat text-[10px] text-orange-400 uppercase tracking-[0.4em] font-black">Mission Objective: Assignment</p>
                                <h1 className="font-montserrat text-normal uppercase text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
                                    {sanitizeDisplay(assignment.title || lessonTitle)}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/5">
                        {[
                            { id: 'instructions', label: 'Instructions' },
                            { id: 'submission', label: 'Submission' },
                            { id: 'my_submissions', label: 'My submissions' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-4 font-montserrat text-[10px] uppercase tracking-widest transition-all relative
                                    ${activeTab === tab.id ? 'text-accent font-black bg-white/[0.03]' : 'text-normal/40 hover:text-normal/60'}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left Column: Contextual Content */}
                        <div className="lg:col-span-8">
                            {activeTab === 'instructions' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(139, 92, 246,0.5)]" />
                                            <h3 className="font-montserrat text-[12px] text-accent uppercase tracking-widest font-black">Assignment Instructions</h3>
                                        </div>
                                        <div className="p-8 bg-white/[0.02] border border-white/5 font-montserrat text-md md:text-md text-normal/70 leading-relaxed space-y-6 break-all">
                                            {assignment.description.split('\n').map((para, i) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Embedded Resources */}
                                    {(assignment.documentFile || assignment.attachmentFile) && (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(139, 92, 246,0.5)]" />
                                                <h3 className="font-montserrat text-[12px] text-accent uppercase tracking-widest font-black">Resources & Materials</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {assignment.documentFile && (
                                                    <div className="p-6 bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-montserrat text-[12px] text-normal uppercase tracking-widest font-black">Assignment Document</p>
                                                                <p className="font-montserrat text-[9px] text-normal/40 uppercase tracking-widest">PDF attachment</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={(() => {
                                                                const file = assignment.documentFile;
                                                                if (!file) return '#';
                                                                if (file.startsWith('http')) return file;
                                                                const rawBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                                                                const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                                                                return `${baseUrl}${file.startsWith('/') ? '' : '/'}${file}`;
                                                            })()} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="px-6 py-3 bg-accent text-dark font-montserrat text-[10px] uppercase tracking-widest font-black hover:scale-105 transition-all"
                                                        >
                                                            View PDF
                                                        </a>
                                                    </div>
                                                )}
                                                {assignment.attachmentFile && (
                                                    <div className="p-6 bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                            </div>
                                                            <div>
                                                                <p className="font-montserrat text-[12px] text-normal uppercase tracking-widest font-black">Reference Document</p>
                                                                <p className="font-montserrat text-[9px] text-normal/40 uppercase tracking-widest">Additional reference material</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={(() => {
                                                                const file = assignment.attachmentFile;
                                                                if (!file) return '#';
                                                                if (file.startsWith('http')) return file;
                                                                const rawBase = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE || 'https://happy-life-sx03.onrender.com';
                                                                const baseUrl = rawBase.replace(/\/api\/v1\/?$/, '');
                                                                return `${baseUrl}${file.startsWith('/') ? '' : '/'}${file}`;
                                                            })()} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="px-6 py-3 bg-accent text-dark font-montserrat text-[10px] uppercase tracking-widest font-black hover:scale-105 transition-all"
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'submission' && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-montserrat text-[16px] text-normal uppercase tracking-widest font-black">Submit Your Work</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="font-montserrat text-[11px] text-normal uppercase tracking-widest font-black">Written Response</label>
                                                <textarea 
                                                    value={writtenResponse}
                                                    onChange={(e) => setWrittenResponse(e.target.value)}
                                                    placeholder="Type your response here..."
                                                    className="w-full h-64 bg-white/[0.02] border border-white/5 p-6 font-montserrat text-lg text-normal/80 focus:border-accent/40 focus:bg-white/[0.04] transition-all outline-none resize-none"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="font-montserrat text-[11px] text-normal uppercase tracking-widest font-black">File Attachments</label>
                                                <div 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full py-16 border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-accent/20 transition-all cursor-pointer group text-center rounded-lg"
                                                >
                                                    <input 
                                                        type="file" 
                                                        multiple 
                                                        ref={fileInputRef} 
                                                        onChange={handleFileChange}
                                                        className="hidden" 
                                                    />
                                                    <div className="space-y-4">
                                                        <div className="w-12 h-12 flex items-center justify-center mx-auto text-normal group-hover:text-accent group-hover:scale-110 transition-all">
                                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="font-montserrat text-[14px] text-normal uppercase tracking-widest">Drag and drop files here, or</p>
                                                            <button className="px-6 py-2 bg-accent text-dark font-montserrat text-[11px] uppercase tracking-widest font-black">Browse Files</button>
                                                            <p className="font-montserrat text-[9px] text-normal/40 uppercase tracking-widest mt-2">Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB each)</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedFiles.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {selectedFiles.map((file, i) => (
                                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent/60"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                                    <span className="font-montserrat text-[9px] uppercase tracking-widest truncate">{file.name}</span>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-red-500/40 hover:text-red-500">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-center pt-4">
                                                <button 
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="px-16 py-4 bg-accent/80 text-dark font-montserrat font-black uppercase tracking-[0.1em] text-[14px] hover:bg-accent transition-all flex items-center gap-3 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin" />
                                                            Transmitting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                                            Submit Assignment
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'my_submissions' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h3 className="font-montserrat text-[16px] text-normal uppercase tracking-widest font-black">My Submissions for This Course</h3>

                                    {submissionsLoading ? (
                                        <div className="py-20 text-center">
                                            <p className="font-montserrat text-[14px] text-normal uppercase tracking-widest">Loading submissions...</p>
                                        </div>
                                    ) : submissions.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <p className="font-montserrat text-normal/40 text-xl">No submissions yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {submissions.map((sub, i) => (
                                                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <p className="font-montserrat text-[10px] text-normal/40 uppercase tracking-widest">Submitted On</p>
                                                            <p className="font-montserrat text-[12px] text-normal uppercase tracking-widest font-black">
                                                                {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right space-y-1">
                                                            <p className="font-montserrat text-[10px] text-normal/40 uppercase tracking-widest">Status</p>
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'approved' ? 'bg-green-400' : sub.status === 'rejected' ? 'bg-red-400' : sub.status === 'submitted' ? 'bg-blue-400' : 'bg-orange-400 animate-pulse'}`} />
                                                                <p className="font-montserrat text-[12px] text-normal uppercase tracking-widest font-black">
                                                                    {sub.status || 'Pending Review'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {sub.feedback && (
                                                        <div className="pt-6 border-t border-white/5 space-y-3">
                                                            <p className="font-montserrat text-[10px] text-accent uppercase tracking-widest font-black">Feedback</p>
                                                            <p className="font-montserrat text-md text-normal/80">{sub.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Mission Parameters */}
                        <div className="lg:col-span-4 lg:sticky lg:top-20 h-fit space-y-8">
                            <div className="bg-white/[0.02] border border-white/5 p-8 space-y-8">
                                <h3 className="font-montserrat text-[12px] text-white uppercase tracking-widest font-black">Mission Parameters</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className="font-montserrat text-[9px] text-normal uppercase tracking-widest">Time Limit</span>
                                        <span className="font-montserrat text-[11px] text-normal uppercase tracking-widest font-black">{assignment.duration} Minutes</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className="font-montserrat text-[9px] text-normal uppercase tracking-widest">Score Potential</span>
                                        <span className="font-montserrat text-[11px] text-normal uppercase tracking-widest font-black">{assignment.score} / {assignment.maxScore} PTS</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                                        <span className="font-montserrat text-[9px] text-normal uppercase tracking-widest">Language</span>
                                        <span className="font-montserrat text-[11px] text-normal uppercase tracking-widest font-black">{assignment.language}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setActiveTab('submission')}
                                    className="w-full py-5 bg-accent text-dark font-montserrat font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(139, 92, 246,0.15)]"
                                >
                                    Initiate Submission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Success Modal Protocol */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-[#1a1a1a] border border-white/5 p-8 rounded-2xl shadow-2xl space-y-8 relative overflow-hidden group">
                        {/* Tactical Glow Effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-all duration-700" />
                        
                        <div className="space-y-6 text-center relative z-10">
                            <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="font-montserrat text-normal text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Mission Success</h2>
                                <p className="font-montserrat text-[10px] text-normal/40 uppercase tracking-[0.3em]">Objective Secured & Transmitted</p>
                            </div>

                            <p className="font-montserrat text-[12px] text-normal/70 leading-relaxed uppercase tracking-wider">
                                Your assignment has been submitted successfully. You will receive feedback within 2-3 working days.
                            </p>

                            <div className="pt-4 flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        setActiveTab('my_submissions');
                                    }}
                                    className="w-full py-4 bg-accent text-dark font-montserrat font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all"
                                >
                                    Continue to Progress
                                </button>
                                <button 
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-4 bg-white/[0.02] border border-white/5 text-normal font-montserrat font-black uppercase tracking-widest text-[11px] hover:bg-white/[0.05] transition-all"
                                >
                                    Back to Assignment
                                </button>
                            </div>
                        </div>

                        {/* Tactical Metadata Overlay */}
                        <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-10">
                            <p className="font-montserrat text-[8px] uppercase tracking-[1em]">SYSTEM.SECURE.TRANSMISSION.OK</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAssignment;
