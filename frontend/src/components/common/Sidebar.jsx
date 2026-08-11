import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Users', path: '/users', icon: 'group' },
  { name: 'Projects', path: '/projects', icon: 'folder' },
  { name: 'Tasks', path: '/tasks', icon: 'assignment' },
  { name: 'Work Logs', path: '/worklogs', icon: 'history' },
]

function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-200 flex flex-col py-6 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">
              widgets
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold text-blue-600 leading-none">
              InternTrack
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">
              Enterprise Suite
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 transition-colors group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-[3px] border-blue-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-l-[3px] border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-500 px-6 py-3 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
