import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-[240px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-40 transition-all">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div className="relative w-full hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search logs, interns, or projects..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Utility buttons */}
        <div className="hidden sm:flex items-center gap-1 border-r border-gray-200 pr-4 mr-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {user?.role || 'Role'}
            </p>
          </div>
          <span className="material-symbols-outlined text-gray-400 text-[18px] hidden lg:block">
            expand_more
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors lg:hidden"
          title="Logout"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
