import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const { saveAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      saveAuth(res.data.access_token, email)
      navigate('/shop')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-card__header">
          <div className="auth-card__icon">🏡</div>
          <h1 className="display-heading auth-card__title">Welcome Back</h1>
          <p className="auth-card__sub">Sign in to your Muthoni Home Finds account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
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
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" id="login-to-register-link" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
