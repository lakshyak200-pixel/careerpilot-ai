import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Rocket,
  Compass,
  FileSearch,
  MessageSquare,
  Map,
  Search,
  Bell,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Flame,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setShowSearch(false)
  }, [location])

  const navLinks = [
    { name: 'Home', path: '/', icon: Flame },
    { name: 'Explore Careers', path: user ? '/dashboard/explore-careers' : '/explore-careers', icon: Compass },
    { name: 'Resume Analyzer', path: '/dashboard/resume-analysis', icon: FileSearch },
    { name: 'Mock Interviews', path: '/dashboard/mock-interview', icon: MessageSquare },
    { name: 'Learning Roadmap', path: '/dashboard/roadmap', icon: Map },
  ]

  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const initials = userDisplayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST'

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const destination = user ? '/dashboard/explore-careers' : '/explore-careers'
      navigate(`${destination}?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActiveLink = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path.includes('explore-careers')) {
      return location.pathname.includes('explore-careers')
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-[#161616]/95 backdrop-blur-md border-[#2E2E2E] shadow-xl'
          : 'bg-[#1A1A1A] border-[#2A2A2A]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Brand Logo (Manhwa18-inspired orange pilot flame) */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#FF8C00] to-[#E67E00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.3)] group-hover:scale-105 transition-transform">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-black font-extrabold" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1">
                CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#A1A1AA] font-bold -mt-1 hidden sm:block">
                AI Career Discovery
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links with Orange Highlights */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActiveLink(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#FF8C00] text-black shadow-[0_0_12px_rgba(255,140,0,0.35)]'
                      : 'text-[#D4D4D8] hover:text-[#FF8C00] hover:bg-[#242424]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right: Search, Notifications & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar / Icon */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search careers & skills..."
                    autoFocus
                    className="w-48 sm:w-64 bg-[#121212] border border-[#FF8C00] text-xs text-white placeholder-gray-500 rounded-lg px-3 py-1.5 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-1 p-1 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  title="Search careers & tools"
                  className="p-2 text-gray-300 hover:text-[#FF8C00] hover:bg-[#242424] rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <button
                type="button"
                title="Notifications"
                onClick={() => navigate('/dashboard')}
                className="relative p-2 text-gray-300 hover:text-[#FF8C00] hover:bg-[#242424] rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8C00] rounded-full shadow-[0_0_8px_#FF8C00]" />
              </button>
            )}

            {/* User Profile Avatar or Login/Signup */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  title="Open Dashboard"
                  className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#242424] hover:bg-[#2C2C2C] border border-[#333333] hover:border-[#FF8C00]/40 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[#FF8C00] text-black text-xs font-black flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-xs font-bold text-white hidden md:inline max-w-[100px] truncate">
                    {userDisplayName.split(' ')[0]}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#242424] rounded-lg transition-colors hidden sm:block"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-gray-200 hover:text-white hover:bg-[#242424] rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-extrabold text-black bg-[#FF8C00] hover:bg-[#FFA024] rounded-lg transition-all shadow-[0_0_14px_rgba(255,140,0,0.35)]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-[#242424] rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-5 h-5 text-[#FF8C00]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-[#161616] border-b border-[#2A2A2A] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActiveLink(link.path)
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold ${
                  active
                    ? 'bg-[#FF8C00] text-black font-extrabold'
                    : 'text-gray-300 hover:bg-[#222222] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            )
          })}

          <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <Link to="/dashboard" className="text-xs font-bold text-[#FF8C00] flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs font-bold text-red-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full pt-1">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center text-xs font-bold bg-[#242424] border border-[#333333] text-white rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center text-xs font-bold bg-[#FF8C00] text-black rounded-lg"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
