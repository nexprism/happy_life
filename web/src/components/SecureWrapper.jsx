import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SecureWrapper = ({ children }) => {
    const [isBlurred, setIsBlurred] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Only apply strict security on dashboard routes (or you can apply everywhere)
        const isDashboard = location.pathname.startsWith('/dashboard');
        
        if (!isDashboard) return;

        // 1. Block Context Menu (Right Click)
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // 2. Block Keyboard Shortcuts (PrintScreen, F12, Ctrl+C, Ctrl+P, Ctrl+S, Ctrl+U)
        const handleKeyDown = (e) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (DevTools & View Source)
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
            ) {
                e.preventDefault();
            }

            // Block Print (Ctrl+P), Save (Ctrl+S), Copy (Ctrl+C)
            if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
            }
            
            // Mac equivalents (Cmd+C, Cmd+P, Cmd+S)
            if (e.metaKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
            }
        };

        // 3. Block PrintScreen Key explicitly
        const handleKeyUp = (e) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText(''); // Attempt to clear clipboard
                setIsBlurred(true);
                setTimeout(() => setIsBlurred(false), 3000); // blur for 3 seconds
            }
        };

        // 4. Focus/Blur handling - Only hide content when tab/window is hidden (document.hidden)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            } else {
                setIsBlurred(false);
            }
        };

        // Window blur: Ignore blur events when user clicks into iframes (e.g. YouTube, Vimeo, video players)
        const handleBlur = () => {
            setTimeout(() => {
                if (document.activeElement?.tagName === 'IFRAME') {
                    // User clicked inside a video player iframe; do not blur
                    return;
                }
                if (document.hidden) {
                    setIsBlurred(true);
                }
            }, 100);
        };
        const handleFocus = () => {
            setIsBlurred(false);
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname]);

    return (
        <>
            <style>
                {`
                /* Prevent text selection globally in this wrapper */
                .secure-wrapper-content {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }

                /* If someone tries to print the page, hide everything */
                @media print {
                    body {
                        display: none !important;
                    }
                }
                `}
            </style>

            {isBlurred && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000',
                    color: '#fff',
                    zIndex: 9999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)' }}>Security Measure</h2>
                    <p style={{ fontFamily: 'var(--font-body)' }}>Content hidden to protect course material.</p>
                </div>
            )}

            <div className="secure-wrapper-content" style={{ filter: isBlurred ? 'blur(20px)' : 'none', pointerEvents: isBlurred ? 'none' : 'auto' }}>
                {children}
            </div>
        </>
    );
};

export default SecureWrapper;
