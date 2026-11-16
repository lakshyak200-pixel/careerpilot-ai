import { useState } from 'react'
import {
  Target,
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  Database,
  Brain,
  Cloud,
  CheckCircle2,
  Briefcase,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const POPULAR_TARGET_ROLES = [
  { title: 'Full Stack Developer', category: 'Web & Backend', icon: Layers, desc: 'React, Node.js, REST APIs, SQL' },
  { title: 'Frontend Developer', category: 'Web Development', icon: Code, desc: 'React, TypeScript, CSS, UI/UX' },
  { title: 'Backend Developer', category: 'Software Engineering', icon: Database, desc: 'Python, FastAPI, Postgres, Docker' },
  { title: 'Data Scientist', category: 'Data & Analytics', icon: Brain, desc: 'Python, Pandas, ML, Statistics' },
  { title: 'Machine Learning Engineer', category: 'Artificial Intelligence', icon: Brain, desc: 'PyTorch, ML Pipelines, NLP' },
  { title: 'Cloud Engineer', category: 'DevOps & Cloud', icon: Cloud, desc: 'AWS/GCP, Docker, Linux, CI/CD' },
  { title: 'Data Analyst', category: 'Data & Business', icon: Database, desc: 'SQL, Tableau, Excel, Data Viz' },
  { title: 'Software Developer', category: 'Core Engineering', icon: Code, desc: 'DSA, OOP, Python/Java, System Design' },
]

export default function TargetRoleOnboardingModal() {
  const { needsOnboarding, createTargetProfile, setNeedsOnboarding, user, profile } = useAuth()
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer')
  const [customRole, setCustomRole] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [profileName, setProfileName] = useState('Primary Career Target')
  const [loading, setLoading] = useState(false)

  if (!needsOnboarding) return null

  const targetRoleToSave = isCustom ? customRole.trim() : selectedRole

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetRoleToSave) return

    setLoading(true)
    try {
      await createTargetProfile({
        profile_name: profileName.trim() || `${targetRoleToSave} Track`,
        target_job_role: targetRoleToSave,
        set_active: true,
      })
      if (setNeedsOnboarding) setNeedsOnboarding(false)
    } catch (err) {
      console.error('Failed to set initial target profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Student'

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1C1C1C] border border-[#333333] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C00]/15 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1: Set Your Career Direction</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {displayName && displayName !== 'Student' && displayName !== 'Demo User'
              ? `Welcome, ${displayName}! Which job role are you targeting?`
              : 'Welcome! Which job role are you targeting?'}
          </h2>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            CareerPilot AI tailors your resume audits, skill gap benchmarks, learning roadmaps, and mock interviews to your target role.
            <strong className="text-gray-200 block mt-1">
              You can create multiple profiles for different jobs anytime under this same email and switch between them.
            </strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Quick Role Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Choose Your Target Job Benchmark:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {POPULAR_TARGET_ROLES.map((role) => {
                const Icon = role.icon
                const active = !isCustom && selectedRole === role.title
                return (
                  <button
                    key={role.title}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.title)
                      setIsCustom(false)
                      if (!profileName || profileName.includes('Track') || profileName.includes('Target')) {
                        setProfileName(`${role.title} Track`)
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FF8C00]/15 border-[#FF8C00] shadow-[0_0_12px_rgba(255,140,0,0.2)]'
                        : 'bg-[#222222] border-[#2E2E2E] hover:border-[#444444] text-gray-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        active ? 'bg-[#FF8C00] text-black font-bold' : 'bg-[#181818] text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-gray-200'}`}>
                          {role.title}
                        </span>
                        {active && <CheckCircle2 className="w-4 h-4 text-[#FF8C00] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{role.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Or Custom Role Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsCustom(!isCustom)
                if (!isCustom) {
                  setProfileName('Custom Track')
                }
              }}
              className="text-xs text-[#FF8C00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              {isCustom ? '← Pick from recommended benchmarks' : '+ Target a custom job role not listed above'}
            </button>

            {isCustom && (
              <div className="mt-2">
                <input
                  type="text"
                  required={isCustom}
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value)
                    setProfileName(`${e.target.value} Track`)
                  }}
                  placeholder="e.g. Cybersecurity Analyst, iOS Engineer, Product Analyst..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#FF8C00] bg-[#141414] text-xs text-white placeholder-gray-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Profile Name Label */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              Profile Label <span className="text-gray-500 font-normal">(for switching later)</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Full Stack Developer Track"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#333333] bg-[#161616] text-xs text-white focus:outline-none focus:border-[#FF8C00]"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3 border-t border-[#2C2C2C] flex items-center justify-between">
            <span className="text-[11px] text-[#A1A1AA]">
              One job target per profile • Add more anytime
            </span>

            <button
              type="submit"
              disabled={loading || !targetRoleToSave}
              className="px-6 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] disabled:opacity-50 text-black text-xs font-black rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(255,140,0,0.3)] transition-all cursor-pointer"
            >
              {loading ? (
                <span>Setting Up Profile...</span>
              ) : (
                <>
                  <span>Save Target &amp; Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

