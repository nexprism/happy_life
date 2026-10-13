import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, googleLoginUser, clearAuthError, requestPasswordReset } from '../redux/slices/authSlice'
import { useGoogleLogin } from '@react-oauth/google'
import { useLanguage } from '../context/LanguageContext'

import './Login.css'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error, token } = useSelector((state) => state.auth)
  const { t } = useLanguage()

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate(from, { replace: true })
  }, [token, navigate, from])

  // Clear error when inputs change
  useEffect(() => {
    if (error) dispatch(clearAuthError())
  }, [email, password])

  useEffect(() => {
    if (!forgotOpen) {
      setForgotError('')
      setForgotMessage('')
      return
    }

    setForgotEmail(email.trim())
  }, [forgotOpen, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    const resultAction = await dispatch(loginUser({ email: email.trim(), password }))
    if (loginUser.fulfilled.match(resultAction)) {
      navigate(from, { replace: true })
    }
  }

  const openForgotModal = () => {
    setForgotEmail(email.trim())
    setForgotError('')
    setForgotMessage('')
    setForgotOpen(true)
  }

  const closeForgotModal = () => {
    if (forgotLoading) return
    setForgotOpen(false)
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()

    const targetEmail = forgotEmail.trim()
    if (!targetEmail || !targetEmail.includes('@')) {
      setForgotError('Enter a valid email address.')
      return
    }

    setForgotLoading(true)
    setForgotError('')
    setForgotMessage('')

    try {
      const response = await dispatch(requestPasswordReset({ email: targetEmail })).unwrap()
      setForgotMessage(response?.message || 'Reset instructions have been sent to your email.')
    } catch (err) {
      setForgotError(err || 'Unable to send reset link.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const resultAction = await dispatch(googleLoginUser({
          googleAccessToken: tokenResponse.access_token,
          deviceId: 'browser',
          platform: 'web'
        }));
        if (googleLoginUser.fulfilled.match(resultAction)) {
          navigate(from, { replace: true })
        }
      } catch (err) {
        console.error('Google Login Error:', err);
      }
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <div className="login-container">
      {/* Left Section: Login Form */}
      <div className="login-left">
        <div className="flex items-center justify-between w-full mb-8">
          <Link to="/" className="login-logo flex items-center gap-2.5">
            <img src="/logo/osa_logo.png" alt="Happy Life Logo" className="h-11 w-auto object-contain" />
          </Link>
        </div>

        <div className="login-form-wrap">
          <h1 className="login-title text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('welcomeBackTitle')}</h1>
          <p className="login-subtitle">{t('loginSubtitle')}</p>

          <button type="button" className="google-btn" onClick={() => handleGoogleLogin()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.87 14.13c-.22-.67-.35-1.38-.35-2.13s.13-1.46.35-2.13V7.03H2.18C1.43 8.53 1 10.21 1 12s.43 3.47 1.18 4.97l3.69-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.03l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z" fill="#EA4335" />
            </svg>
            {t('continueWithGoogle')}
          </button>

          <div className="divider">
            <span>{t('orEmail')}</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="login-email">{t('emailAddress')}</label>
              </div>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="login-password">{t('password')}</label>
                <button type="button" className="forgot-link" onClick={openForgotModal}>{t('forgotPassword')}</button>
              </div>
              <div className="password-field-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`signin-btn ${loading ? 'signin-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="signin-spinner" />
                  AUTHENTICATING...
                </>
              ) : (
                t('signIn')
              )}
            </button>
          </form>

          <div className="signup-text">
            {t('donthaveAccount')} <Link to="/signup" className="signup-link">{t('signUpNow')}</Link>
          </div>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} HAPPY LIFE. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Section: Visual/Info */}
      <div className="login-right">
        <div className="system-status">
          <div className="status-dot"></div>
          ASTRO-VASTU PORTAL
        </div>

        <div className="bg-text-wrap">
          <div className="bg-text">Align.</div>
          <div className="bg-text">Prosper.</div>
          <div className="bg-text">Harmonize.</div>
        </div>

        <div className="testimonial-card">
          <p className="testimonial-quote">
            "The practical guidance and logical Astro-Vastu remedies by Dr. Yogesh Sharma transformed our environment and brought profound clarity to our life."
          </p>
        </div>

        <div className="stats-wrap">
          <div className="stat-item">
            <span className="stat-value">12.4k</span>
            <span className="stat-label">{t('activeLearners')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">98.2%</span>
            <span className="stat-label">{t('completionRate')}</span>
          </div>
        </div>

        <p className="right-description">
          Connect with authentic Vedic wisdom and personalized Astro-Vastu remedies for lasting peace and prosperity.
        </p>

        <div className="nav-arrows">
          <button type="button" className="arrow-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="arrow-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {forgotOpen && (
        <div className="forgot-modal-backdrop" onClick={closeForgotModal}>
          <div className="forgot-modal" onClick={(event) => event.stopPropagation()}>
            <div className="forgot-modal__header">
              <div>
                <p className="forgot-modal__eyebrow">{t('forgotPassword')}</p>
                <h2 className="forgot-modal__title text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] transition-colors">{t('requestResetLink')}</h2>
              </div>
              <button type="button" className="forgot-modal__close" onClick={closeForgotModal} aria-label="Close forgot password dialog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <p className="forgot-modal__copy">
              {t('requestResetLinkDesc')}
            </p>

            {forgotError && <div className="forgot-modal__status forgot-modal__status--error">{forgotError}</div>}
            {forgotMessage && <div className="forgot-modal__status forgot-modal__status--success">{forgotMessage}</div>}

            <form className="forgot-modal__form" onSubmit={handleForgotSubmit}>
              <label className="forgot-modal__label" htmlFor="forgot-email">{t('emailAddress')}</label>
              <input
                id="forgot-email"
                type="email"
                className="forgot-modal__input"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <div className="forgot-modal__actions">
                <button type="button" className="forgot-modal__secondary" onClick={closeForgotModal} disabled={forgotLoading}>
                  {t('cancelBtn')}
                </button>
                <button type="submit" className="forgot-modal__primary" disabled={forgotLoading}>
                  {forgotLoading ? t('sendingBtn') : t('sendResetLinkBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

