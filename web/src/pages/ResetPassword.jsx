import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword, clearAuthError } from '../redux/slices/authSlice'
import { useLanguage } from '../context/LanguageContext'
import './ResetPassword.css'

const ResetPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error } = useSelector((state) => state.auth)
  const { t } = useLanguage()

  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (error) dispatch(clearAuthError())
  }, [newPassword, confirmPassword])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    setSuccessMessage('')

    if (!token) {
      setLocalError('Reset token is missing from the link.')
      return
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    try {
      const response = await dispatch(
        resetPassword({ token, newPassword, confirmPassword })
      ).unwrap()
      setSuccessMessage(response?.message || 'Password updated successfully.')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1800)
    } catch (err) {
      setLocalError(err || 'Unable to reset password.')
    }
  }

  const displayError = localError || error

  return (
    <div className="reset-page">
      <div className="reset-page__panel">
        <Link to="/" className="reset-page__logo flex items-center gap-2.5">
          <img src="/logo/osa_logo.png" alt="Happy Life Logo" className="h-11 w-auto object-contain" />
        </Link>

        <p className="reset-page__eyebrow">{t('resetPasswordTitle')}</p>
        <h1 className="reset-page__title text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">Set a new password</h1>
        <p className="reset-page__copy">
          Use the token from your email link to complete the password change.
        </p>

        {displayError && <div className="reset-page__notice reset-page__notice--error">{displayError}</div>}
        {successMessage && <div className="reset-page__notice reset-page__notice--success">{successMessage}</div>}

        <form className="reset-page__form" onSubmit={handleSubmit}>
          <div className="reset-page__field">
            <label className="reset-page__label" htmlFor="new-password">{t('newPassword')}</label>
            <div className="reset-page__password-wrap">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                className="reset-page__input"
                placeholder="Enter a new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-page__toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="reset-page__field">
            <label className="reset-page__label" htmlFor="confirm-password">{t('confirmPassword')}</label>
            <div className="reset-page__password-wrap">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="reset-page__input"
                placeholder="Repeat the new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="reset-page__toggle"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label="Toggle password confirmation visibility"
              >
                {showConfirm ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="reset-page__meta">
            <span className="reset-page__token-label">{t('token')}</span>
            <span className="reset-page__token-value">{token ? `${token.slice(0, 8)}...${token.slice(-8)}` : 'Missing'}</span>
          </div>

          <button type="submit" className="reset-page__submit" disabled={loading}>
            {loading ? 'UPDATING...' : t('resetPasswordTitle')}
          </button>
        </form>

        <div className="reset-page__footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
