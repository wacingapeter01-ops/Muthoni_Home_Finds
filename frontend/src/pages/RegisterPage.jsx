import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import './AuthPages.css'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      setSuccess('Account created! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(' · '))
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__header">
          <div className="auth-card__icon">✨</div>
          <h1 className="display-heading auth-card__title">Create Account</h1>
          <p className="auth-card__sub">Join Muthoni Home Finds — it&apos;s free</p>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Min 9 chars, with number & symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
              Must be 9+ characters with a letter, number, and special character.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button id="reg-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" id="reg-to-login-link" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
