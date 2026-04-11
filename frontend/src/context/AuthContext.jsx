import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mhf_token'))
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('mhf_user')) } catch { return null }
  })

  const saveAuth = useCallback((accessToken, email) => {
    localStorage.setItem('mhf_token', accessToken)
    localStorage.setItem('mhf_user', JSON.stringify({ email }))
    setToken(accessToken)
    setUser({ email })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mhf_token')
    localStorage.removeItem('mhf_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
