import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../services/authService'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await loginApi(email, password)
    const data = response.data

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImageUrl: data.profileImageUrl,
    }))

    setToken(data.token)
    setUser({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImageUrl: data.profileImageUrl,
    })

    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }
