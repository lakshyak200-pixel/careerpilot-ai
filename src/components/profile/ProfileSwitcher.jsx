import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  ChevronDown,
  Check,
  Plus,
  Briefcase,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import CreateProfileModal from './CreateProfileModal'

export default function ProfileSwitcher() {
  const { targetProfiles, activeProfile, switchActiveProfile, profile } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentRole = activeProfile?.target_job_role || profile?.target_job_role || 'Target Role'
  const currentProfileName = activeProfile?.profile_name || 'Active Profile'

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Switcher Pill Button */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          title="Switch Target Job Profile"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] hover:bg-[#2C2C2C] border border-[#3A3A3A] hover:border-[#FF8C00]/60 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-[#FF8C00]/20 text-[#FF8C00] flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider leading-none font-semibold">
              Target Track
            </span>
            <span className="text-xs font-black text-white max-w-[120px] sm:max-w-[160px] truncate leading-tight">
              {currentRole}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              dropdownOpen ? 'rotate-180 text-[#FF8C00]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#1C1C1C] border border-[#333333] rounded-2xl shadow-2xl z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-[#2C2C2C]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Target Profiles
                </span>
                <span className="text-[10px] bg-[#FF8C00]/20 text-[#FF8C00] px-2 py-0.5 rounded-full font-bold">
                  {targetProfiles.length} {targetProfiles.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Switch your active career focus across this email account.
              </p>
            </div>

            {/* Profile List */}
            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {targetProfiles.map((p) => {
                const isActive = p.id === activeProfile?.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      switchActiveProfile(p.id)
                      setDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#FF8C00]/15 border border-[#FF8C00]/40 text-white'
                        : 'hover:bg-[#252525] text-gray-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate text-white">{p.profile_name}</span>
                        {isActive && (
                          <span className="text-[9px] bg-[#FF8C00] text-black font-extrabold px-1.5 py-0.2 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1 mt-0.5 truncate">
                        <Target className="w-3 h-3 text-[#FF8C00] shrink-0" />
                        <span className="truncate">{p.target_job_role}</span>
                      </div>
                    </div>

                    {isActive && <Check className="w-4 h-4 text-[#FF8C00] shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#2C2C2C] space-y-1">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false)
                  setShowCreateModal(true)
                }}
                className="w-full flex items-center justify-center gap-2 p-2 bg-[#252525] hover:bg-[#303030] border border-[#3A3A3A] hover:border-[#FF8C00]/50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF8C00]" />
                <span>Add Another Target Profile</span>
              </button>

              <Link
                to="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 p-1.5 text-[11px] font-bold text-gray-400 hover:text-[#FF8C00] transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>Manage All Profiles &amp; Settings</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

