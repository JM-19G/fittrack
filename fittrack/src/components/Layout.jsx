import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: '⬡', label: 'Home' },
  { to: '/log', icon: '✚', label: 'Log' },
  { to: '/history', icon: '◷', label: 'History' },
  { to: '/goals', icon: '◎', label: 'Goals' },
  { to: '/progress', icon: '↗', label: 'Progress' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-white/10 px-6 h-14 flex items-center justify-between">
        <span className="text-green-400 font-bold text-xl tracking-tight">
          FitTrack
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-t border-white/10 flex justify-around items-center py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition text-xs font-medium
              ${isActive
                ? 'text-green-400 bg-green-400/10'
                : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}