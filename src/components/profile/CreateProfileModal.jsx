import { useState } from 'react'
import {
  X,
  Target,
  Plus,
  Briefcase,
  Layers,
  Code,
  Database,
  Brain,
  Cloud,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PRESET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Data Analyst',
  'Software Developer',
  'Python Developer',
  'Java Developer',
]

export default function CreateProfileModal({ isOpen, onClose }) {
  const { createTargetProfile, targetProfiles } = useAuth()
  const [selectedRole, setSelectedRole] = useState('Data Scientist')
  const [isCustom, setIsCustom] = useState(false)
  const [customRole, setCustomRole] = useState('')
  const [profileName, setProfileName] = useState('Data Scientist Track')
  const [setAsActive, setSetAsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const targetRoleToSave = isCustom ? customRole.trim() : selectedRole

  const handleCreate = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!targetRoleToSave) {
      setErrorMsg('Please specify a target job role.')
      return
    }

    // Check if user already has a profile with the same exact target job role
    const alreadyExists = targetProfiles.some(
      (p) => p.target_job_role?.toLowerCase() === targetRoleToSave.toLowerCase()
    )
    if (alreadyExists) {
      setErrorMsg(`You already have a profile targeting "${targetRoleToSave}". Each profile targets one distinct job role.`)
      return
    }

    setLoading(true)
    try {
      const { error } = await createTargetProfile({
        profile_name: profileName.trim() || `${targetRoleToSave} Track`,
        target_job_role: targetRoleToSave,
        set_active: setAsActive,
      })
      if (error) {
        setErrorMsg(error.message || 'Could not create profile.')
      } else {
        onClose()
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create target profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] border border-[#333333] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/20 text-[#FF8C00] flex items-center justify-center">
              <Plus className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Create New Target Job Profile</h3>
              <p className="text-[11px] text-[#A1A1AA]">
                Add another career track under this same email account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#2B1717] border border-[#522525] rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Target Role selection */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Target Job Role <span className="text-[#FF8C00]">* (1 per profile)</span>
            </label>

            {!isCustom ? (
              <div className="space-y-2">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value)
                    setProfileName(`${e.target.value} Track`)
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#333333] bg-[#141414] text-xs text-white focus:outline-none focus:border-[#FF8C00] cursor-pointer"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#181818] text-white">
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(true)
                    setProfileName('Custom Track')
                  }}
                  className="text-[11px] text-[#FF8C00] hover:underline cursor-pointer block font-semibold"
                >
                  + Enter custom job role instead
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  required
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value)
                    setProfileName(`${e.target.value} Track`)
                  }}
                  placeholder="e.g. iOS Developer, Cybersecurity Engineer..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#FF8C00] bg-[#141414] text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-[11px] text-gray-400 hover:text-white hover:underline cursor-pointer"
                >
                  ← Pick from standard presets
                </button>
              </div>
            )}
          </div>

          {/* Profile Name */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Profile Name / Label
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. My Data Science Goal"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#333333] bg-[#141414] text-xs text-white focus:outline-none focus:border-[#FF8C00]"
              />
            </div>
          </div>

          {/* Set as Active Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="set_active"
              type="checkbox"
              checked={setAsActive}
              onChange={(e) => setSetAsActive(e.target.checked)}
              className="w-4 h-4 rounded border-[#333333] text-[#FF8C00] focus:ring-[#FF8C00] cursor-pointer"
            />
            <label htmlFor="set_active" className="text-xs text-gray-300 cursor-pointer">
              Switch to this profile immediately after creation
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#2C2C2C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !targetRoleToSave}
              className="px-5 py-2 bg-[#FF8C00] hover:bg-[#FFA024] disabled:opacity-50 text-black text-xs font-black rounded-xl shadow-[0_0_12px_rgba(255,140,0,0.3)] transition-colors cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

