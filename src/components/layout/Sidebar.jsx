import { NavLink, useNavigate } from 'react-router-dom'
import {
  Rocket,
  LayoutDashboard,
  Upload,
  FileSearch,
  Target,
  MessageSquare,
  Map,
  Compass,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
  { name: 'My Resumes', icon: Upload, path: '/dashboard/upload-resume' },
  { name: 'Resume Analysis', icon: FileSearch, path: '/dashboard/resume-analysis' },
  { name: 'Skill Gap Analysis', icon: Target, path: '/dashboard/skill-gap' },
  { name: 'Mock Interviews', icon: MessageSquare, path: '/dashboard/mock-interview' },
  { name: 'Explore Careers', icon: Compass, path: '/dashboard/explore-careers' },
  { name: 'Learning Roadmap', icon: Map, path: '/dashboard/roadmap' },
  { name: 'Profile & Settings', icon: Settings, path: '/dashboard/profile' },
]

export default function Sidebar({ isOpen, onToggle, isCollapsed = false, onCollapseToggle = null }) {
  const navigate = useNavigate()
  const { user, profile, activeProfile, signOut } = useAuth()

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const displayEmail = user?.email || 'student@university.edu'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Main Dark Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#1A1A1A] text-white z-50 border-r border-[#2E2E2E] transition-all duration-300 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2A2A2A] h-16">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg bg-[#FF8C00] text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,140,0,0.3)] group-hover:scale-105 transition-transform">
              <Rocket className="w-4 h-4 font-black" />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-black tracking-tight text-white group-hover:text-[#FF8C00] transition-colors whitespace-nowrap">
                CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
              </span>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          {onCollapseToggle && (
            <button
              type="button"
              onClick={onCollapseToggle}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252525] transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onToggle}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => {
                  if (window.innerWidth < 1024 && onToggle) onToggle()
                }}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-[#FF8C00]/15 text-[#FF8C00] border-l-4 border-[#FF8C00] shadow-[inset_0_0_12px_rgba(255,140,0,0.06)]'
                      : 'text-[#D4D4D8] hover:bg-[#242424] hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Active Target Track Indicator */}
        {!isCollapsed && activeProfile && (
          <div className="mx-2.5 mb-2 px-3 py-2 bg-[#202020] border border-[#2E2E2E] rounded-xl flex items-center justify-between gap-1.5 shadow-xs">
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                Active Career Target
              </span>
              <span className="text-xs font-black text-[#FF8C00] truncate block">
                {activeProfile.target_job_role}
              </span>
            </div>
            <Target className="w-4 h-4 text-[#FF8C00] shrink-0" />
          </div>
        )}

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-[#2A2A2A] bg-[#161616]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF8C00] text-black font-black text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{displayName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{displayEmail}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#222222] rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="w-full flex justify-center p-2 text-gray-400 hover:text-red-400 hover:bg-[#222222] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
