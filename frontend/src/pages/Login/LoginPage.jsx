import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      setLoading(true)
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen md:h-[800px] md:my-10 bg-white md:rounded-xl overflow-hidden md:shadow-xl border-0 md:border md:border-gray-200">
      {/* Left Side: Branding */}
      <div className="hidden md:flex flex-col w-1/2 bg-gray-50 p-12 relative overflow-hidden border-r border-gray-200">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <svg className="absolute top-[-10%] right-[-10%] w-96 h-96 text-blue-500" fill="currentColor" viewBox="0 0 200 200">
            <path d="M47.7,-64.7C61.4,-56.3,71.8,-42.6,78.2,-27.1C84.7,-11.6,87.1,5.6,81.4,19.9C75.8,34.2,62.1,45.5,48.5,55C35,64.5,21.5,72.1,5.7,75.1C-10.2,78.1,-28.4,76.5,-42.8,67.6C-57.1,58.7,-67.6,42.5,-73.3,25.4C-79,8.4,-79.8,-9.5,-73.4,-24.5C-67.1,-39.5,-53.6,-51.7,-39.1,-59.8C-24.6,-67.9,-9.2,-71.9,6.2,-79.6C21.6,-87.3,34.1,-73.1,47.7,-64.7Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute bottom-[-10%] left-[-10%] w-80 h-80 text-blue-400" fill="currentColor" viewBox="0 0 200 200">
            <path d="M51.1,-55.8C65.5,-44.7,75.8,-27.6,76.5,-10.1C77.2,7.4,68.2,25.3,55.1,38.8C42,52.3,24.8,61.4,5.9,63.2C-13,65,-30.2,59.5,-44.3,47.7C-58.4,35.9,-69.3,17.9,-70.7,-1C-72,-20,-63.8,-39.9,-49.6,-51.2C-35.4,-62.5,-15.1,-65.2,2.5,-68.2C20.1,-71.2,36.7,-66.9,51.1,-55.8Z" transform="translate(100 100)" />
          </svg>
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              <span className="material-symbols-outlined text-[22px]">widgets</span>
            </div>
            <span className="text-xl font-bold text-gray-900">InternTrack</span>
          </div>

          <div className="mt-auto mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4 max-w-sm">
              Empowering Internships
            </h1>
            <p className="text-base text-gray-500 max-w-md leading-relaxed">
              Streamline your workflow, manage projects seamlessly, and connect
              with your team in a professional, distraction-free environment
              built for enterprise scale.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-[24px]">widgets</span>
            </div>
            <span className="text-xl font-bold text-gray-900">InternTrack</span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })) }}
                className={`w-full px-4 py-3 rounded-lg border bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-400 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
                placeholder="name@company.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })) }}
                  className={`w-full px-4 py-3 pr-11 rounded-lg border bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-400 ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              Internal Access Only. Protected System.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
