import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, AlertCircle, Compass, Rocket } from 'lucide-react'
import Sidebar from './Sidebar'
import ProfileSwitcher from '../profile/ProfileSwitcher'
import TargetRoleOnboardingModal from '../profile/TargetRoleOnboardingModal'
import { useAuth } from '../../context/AuthContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/upload-resume': 'My Resumes & Upload',
  '/dashboard/resume-analysis': 'AI Resume Analysis',
  '/dashboard/skill-gap': 'Skill Gap Analysis',
  '/dashboard/mock-interview': 'AI Mock Interview Studio',
  '/dashboard/roadmap': 'Learning Roadmap',
  '/dashboard/explore-careers': 'Explore Career Roles',
  '/dashboard/profile': 'Profile & Account Settings',
  '/explore-careers': 'Explore Career Roles',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, isConfigured } = useAuth()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST'

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/dashboard/explore-careers?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2E2E2E]">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#FF8C00] rounded-full inline-block" />
                  <span>{pageTitle}</span>
                </h1>
                <p className="text-[11px] text-[#A1A1AA] hidden sm:block">
                  Welcome back, <strong className="text-white font-bold">{displayName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Target Job Profile Switcher */}
              <ProfileSwitcher />

              {/* Top Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search careers, skills..."
                  className="bg-[#121212] border border-[#303030] focus:border-[#FF8C00] text-xs text-white placeholder-gray-500 rounded-lg pl-9 pr-3 py-1.5 outline-none w-44 lg:w-56 transition-all"
                />
              </form>

              {/* Explore Link */}
              <Link
                to="/dashboard/explore-careers"
                title="Explore Career Catalog"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#2E2E2E] border border-[#353535] text-xs font-bold text-gray-200 hover:text-[#FF8C00] rounded-lg transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-[#FF8C00]" />
                <span>Careers</span>
              </Link>

              {/* Notifications */}
              <button
                type="button"
                title="Notifications"
                className="relative p-2 text-gray-300 hover:text-[#FF8C00] hover:bg-[#252525] rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF8C00] rounded-full shadow-[0_0_6px_#FF8C00]" />
              </button>

              {/* Profile Avatar */}
              <Link
                to="/dashboard/profile"
                title={`${displayName} - Profile`}
                className="w-8 h-8 rounded-lg bg-[#FF8C00] text-black font-black text-xs flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_10px_rgba(255,140,0,0.3)]"
              >
                {initials}
              </Link>
            </div>
          </div>

          {!isConfigured && (
            <div className="bg-[#241B10] border-t border-[#42290A] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#FBBF24]">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                <span>
                  <strong>Demo Mode Active:</strong> Ready for offline exploration. Connect live Supabase credentials in <code>.env</code> anytime.
                </span>
              </div>
              <span className="font-bold text-[#F59E0B] hidden sm:inline">Offline Cache Ready</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#121212]">
          <Outlet />
        </main>
      </div>

      {/* Target Role Onboarding Modal (Opens after sign in / first login) */}
      <TargetRoleOnboardingModal />
    </div>
  )
}
