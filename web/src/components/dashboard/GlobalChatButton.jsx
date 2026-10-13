import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

const GlobalChatButton = () => {
  useEffect(() => {
    // Pop-in reveal for the Support Protocol FAB
    gsap.fromTo('.chat-fab', 
      { scale: 0, rotation: -90, opacity: 0 },
      { 
        scale: 1, 
        rotation: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'back.out(1.7)',
        delay: 1.5 
      }
    )
  }, [])

  return (
    <div className="fixed bottom-10 right-10 z-[200] chat-fab opacity-0 pointer-events-auto">
      <Link to="/dashboard/messages" className="group relative block">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Main Button Body */}
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center relative z-10 shadow-accent-soft hover:scale-110 active:scale-95 transition-all duration-300">
           
           {/* Chat Icon - Clean Support Protocol */}
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-dark">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
           </svg>
           
           {/* Urgent Signal (Notification Dot) */}
           <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full border-[3px] border-dark shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
           
           {/* Hover Ripple */}
           <div className="absolute inset-0 rounded-full border border-dark/10 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000" />
        </div>

        {/* Label (Visible on Hover) */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 font-montserrat text-[8px] text-accent font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-500 whitespace-nowrap pointer-events-none">
           Support Protocol <span className="text-normal opacity-40 ml-2">v.2.1</span>
        </div>
      </Link>
    </div>
  )
}

export default GlobalChatButton
