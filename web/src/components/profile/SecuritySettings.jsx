import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLanguage } from '../../context/LanguageContext'
import { changePassword, clearPasswordStatus } from '../../redux/slices/profileSlice'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const SecuritySettings = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { passwordLoading, passwordError, passwordSuccess } = useSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')

  // Clear states when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearPasswordStatus())
    }
  }, [dispatch])

  // Sync redux success
  useEffect(() => {
    if (passwordSuccess) {
      setLocalSuccess(t('passwordUpdatedSuccess') || 'Password updated successfully!')
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      const timer = setTimeout(() => {
        setLocalSuccess('')
        dispatch(clearPasswordStatus())
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [passwordSuccess, dispatch, t])

  // Sync redux error
  useEffect(() => {
    if (passwordError) {
      setLocalError(passwordError)
    }
  }, [passwordError])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (localError) setLocalError('')
    if (localSuccess) setLocalSuccess('')
  }

  const handleCancel = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setLocalError('')
    setLocalSuccess('')
    dispatch(clearPasswordStatus())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setLocalSuccess('')
    dispatch(clearPasswordStatus())

    const { oldPassword, newPassword, confirmPassword } = formData

    if (!oldPassword.trim()) {
      setLocalError(t('currentPasswordRequired') || 'Current password is required')
      return
    }

    if (!newPassword.trim()) {
      setLocalError(t('newPasswordRequired') || 'New password is required')
      return
    }

    if (newPassword.length < 6) {
      setLocalError(t('passwordTooShort') || 'New password must be at least 6 characters long')
      return
    }

    if (newPassword === oldPassword) {
      setLocalError(t('passwordMustBeDifferent') || 'New password must be different from current password')
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError(t('passwordsDoNotMatch') || 'New password and confirm password do not match')
      return
    }

    dispatch(changePassword({ oldPassword, newPassword, confirmPassword }))
  }

  return (
    <div className="space-y-8">
      
      {/* -------------------- SECURITY HEADER -------------------- */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
         <h2 className="font-montserrat text-slate-900 lowercase flex items-center gap-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">
            <Lock className="w-7 h-7 text-amber-600" />
            {t('security') || 'Security'} <span className="text-slate-400 font-normal">Settings</span>
         </h2>
      </div>

      {/* -------------------- STATUS ALERTS -------------------- */}
      {localSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-montserrat">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{localSuccess}</span>
        </div>
      )}

      {localError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-montserrat">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* -------------------- CREDENTIAL ROTATION FORM -------------------- */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200/80 p-6 md:p-8 rounded-2xl relative overflow-hidden group">
         
         {/* Current Password */}
         <div className="space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('currentPasswordLabel') || 'Current Password'}
            </label>
            <div className="relative">
              <input 
                type={showOld ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-white border border-slate-200 p-3.5 pr-10 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showOld ? 'Hide password' : 'Show password'}
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
         </div>

         {/* New Password */}
         <div className="space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('newPasswordLabel') || 'New Password'}
            </label>
            <div className="relative">
              <input 
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-white border border-slate-200 p-3.5 pr-10 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
         </div>

         {/* Confirm Password */}
         <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="font-montserrat text-[10px] text-slate-700 uppercase tracking-[0.3em] font-bold">
               {t('confirmPasswordLabel') || 'Confirm Password'}
            </label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-white border border-slate-200 p-3.5 pr-10 font-montserrat text-xs text-slate-900 focus:border-amber-500 transition-all outline-none rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit"
              disabled={passwordLoading}
              className="flex-1 px-8 py-4 bg-accent text-slate-950 font-montserrat text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all rounded-full shadow-accent-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                t('updatePasswordBtn') || 'Update Password'
              )}
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              disabled={passwordLoading}
              className="flex-1 px-8 py-4 border border-slate-300 text-slate-700 hover:bg-slate-200/50 font-montserrat text-xs font-bold uppercase tracking-[0.3em] transition-all rounded-full cursor-pointer disabled:opacity-50"
            >
              {t('cancelBtn') || 'Cancel'}
            </button>
         </div>

      </form>

    </div>
  )
}

export default SecuritySettings
