import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

const SecuritySettings = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      
      {/* -------------------- SECURITY HEADER -------------------- */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
         <h2 className="font-montserrat text-slate-900 lowercase flex items-center gap-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {t('security') || 'Security'} <span className="text-slate-400 font-normal">Settings</span>
         </h2>
      </div>

      {/* -------------------- CREDENTIAL ROTATION -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200/80 p-6 md:p-8 rounded-2xl relative overflow-hidden group">
         
         <div className="space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('currentPasswordLabel') || 'Current Password'}
            </label>
            <input 
              type="password" placeholder="••••••••"
              className="w-full bg-white border border-slate-200 p-3.5 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
            />
         </div>

         <div className="space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('newPasswordLabel') || 'New Password'}
            </label>
            <input 
              type="password" placeholder="••••••••"
              className="w-full bg-white border border-slate-200 p-3.5 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
            />
         </div>

         <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('confirmPasswordLabel') || 'Confirm Password'}
            </label>
            <input 
              type="password" placeholder="••••••••"
              className="w-full bg-white border border-slate-200 p-3.5 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
            />
         </div>

         <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 px-8 py-4 bg-accent text-slate-950 font-montserrat text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all rounded-full shadow-accent-soft">{t('updatePasswordBtn') || 'Update Password'}</button>
            <button className="flex-1 px-8 py-4 border border-slate-300 text-slate-700 hover:bg-slate-200/50 font-montserrat text-xs font-bold uppercase tracking-[0.3em] transition-all rounded-full">{t('cancelBtn') || 'Cancel'}</button>
         </div>

      </div>

    </div>
  )
}

export default SecuritySettings
