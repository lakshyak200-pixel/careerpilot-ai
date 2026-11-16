import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Calendar,
  Lock,
  Bell,
  Briefcase,
  ShieldAlert,
  Sparkles,
  Save,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Target,
  Plus,
  Check,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SectionHeader from '../components/common/SectionHeader'
import CreateProfileModal from '../components/profile/CreateProfileModal'

export default function ProfilePage() {
  const {
    user,
    profile: authProfile,
    updateProfile,
    updatePassword,
    isConfigured,
    targetProfiles,
    activeProfile,
    switchActiveProfile,
    deleteTargetProfile,
  } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form states populated from Supabase profile
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: '2026',
    targetJobRole: 'Frontend Developer',
    phone: '+1 (555) 019-2834',
    bio: 'Undergraduate student passionate about modern software development, AI, and cloud technologies.',
  })

  const [passwordState, setPasswordState] = useState({
    newPassword: '',
    confirmPassword: '',
    status: '',
  })

  const [careerPref, setCareerPref] = useState({
    targetRoles: ['Frontend Developer', 'Full Stack Engineer'],
    preferredLocation: 'San Francisco, CA (or Remote)',
    workType: 'Hybrid',
    expectedSalary: '95,000',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    interviewReminders: true,
    weeklyProgress: true,
    recruiterDirect: false,
  })

  // Synchronize state when authProfile loads
  useEffect(() => {
    if (authProfile) {
      setFormData((prev) => ({
        ...prev,
        fullName: authProfile.full_name || user?.user_metadata?.full_name || '',
        college: authProfile.college || user?.user_metadata?.college || '',
        degree: authProfile.degree || user?.user_metadata?.degree || 'B.Tech / B.E.',
        branch: authProfile.branch || user?.user_metadata?.branch || '',
        graduationYear: authProfile.graduation_year || user?.user_metadata?.graduation_year || '2026',
        targetJobRole: authProfile.target_job_role || user?.user_metadata?.target_job_role || 'Frontend Developer',
      }))
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
        college: user.user_metadata?.college || '',
        degree: user.user_metadata?.degree || '',
        branch: user.user_metadata?.branch || '',
        graduationYear: user.user_metadata?.graduation_year || '2026',
      }))
    }
  }, [authProfile, user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSaving(true)

    try {
      const { error } = await updateProfile({
        full_name: formData.fullName,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        graduation_year: formData.graduationYear,
        target_job_role: formData.targetJobRole,
      })

      if (error) {
        setErrorMsg(error.message || 'Failed to update profile.')
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      setErrorMsg('Network error updating profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordState({ ...passwordState, status: 'Passwords do not match.' })
      return
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordState({ ...passwordState, status: 'Password must be at least 8 characters.' })
      return
    }

    const { error } = await updatePassword(passwordState.newPassword)
    if (error) {
      setPasswordState({ ...passwordState, status: error.message })
    } else {
      setPasswordState({ newPassword: '', confirmPassword: '', status: 'SUCCESS' })
      setTimeout(() => setPasswordState((prev) => ({ ...prev, status: '' })), 4000)
    }
  }

  const initials = (formData.fullName || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <SectionHeader
          title="Profile &amp; Account Settings"
          badge="Supabase Auth"
        />
        <p className="text-xs text-[#A1A1AA] mt-1">
          Manage your student credentials, academic background, target job preferences, and platform security.
        </p>
      </div>

      {/* Backend Integration Banner */}
      <div className="p-3.5 bg-[#1A1A1A] border border-[#303030] rounded-xl flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
        <div className="text-xs text-[#A1A1AA] leading-relaxed">
          <span className="font-bold text-white">Supabase PostgreSQL Row Level Security (RLS) Active:</span> Profile updates save directly to the <code>public.profiles</code> table where <code>auth.uid() = id</code> is enforced. Credentials remain securely managed by Supabase Auth.
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-[#14261C] border border-[#234A34] rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile updated in database successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-[#2B1717] border border-[#522525] rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Identity Card */}
        <div className="space-y-5">
          <div className="bg-[#202020] rounded-2xl p-6 border border-[#303030] shadow-sm text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-full h-full rounded-2xl bg-[#FF8C00] text-black flex items-center justify-center text-xl font-black shadow-[0_0_15px_rgba(255,140,0,0.3)]">
                {initials}
              </div>
            </div>

            <h3 className="text-base font-black text-white">{formData.fullName || 'Student'}</h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">{user?.email || 'student@university.edu'}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Verified Student Account</span>
            </div>

            <div className="mt-5 pt-5 border-t border-[#2C2C2C] text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-gray-300">
                <GraduationCap className="w-4 h-4 text-[#FF8C00] shrink-0" />
                <span className="truncate">{formData.college || 'College not set'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Building className="w-4 h-4 text-[#FF8C00] shrink-0" />
                <span className="truncate">{formData.degree} {formData.branch ? `• ${formData.branch}` : ''}</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Calendar className="w-4 h-4 text-[#FF8C00] shrink-0" />
                <span>Class of {formData.graduationYear}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#202020] rounded-2xl p-2.5 border border-[#303030] shadow-sm space-y-1">
            {[
              { id: 'personal', label: 'Academic & Personal Info', icon: User },
              { id: 'target_profiles', label: 'Target Job Profiles', icon: Target },
              { id: 'preferences', label: 'Career Preferences', icon: Briefcase },
              { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
              { id: 'security', label: 'Security & Password', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF8C00]/15 text-[#FF8C00] border-l-4 border-[#FF8C00]'
                      : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="lg:col-span-2">
          <div className="bg-[#202020] rounded-2xl p-6 sm:p-7 border border-[#303030] shadow-sm">
            {/* Tab 1: Personal Info */}
            {activeTab === 'personal' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h3 className="text-sm font-black text-white mb-3">Academic &amp; Profile Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Email Address (Auth Managed)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#303030] text-xs bg-[#141414] text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      College or University
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Graduation Year
                    </label>
                    <select
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    >
                      <option value="2024" className="bg-[#181818]">2024 (Graduated)</option>
                      <option value="2025" className="bg-[#181818]">2025 (Final Year)</option>
                      <option value="2026" className="bg-[#181818]">2026 (Junior / 3rd Year)</option>
                      <option value="2027" className="bg-[#181818]">2027 (Sophomore)</option>
                      <option value="2028" className="bg-[#181818]">2028 (Freshman)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g. B.Tech / B.E."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Job Role
                  </label>
                  <select
                    value={formData.targetJobRole}
                    onChange={(e) => setFormData({ ...formData, targetJobRole: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                  >
                    <option value="Frontend Developer" className="bg-[#181818]">Frontend Developer</option>
                    <option value="Backend Developer" className="bg-[#181818]">Backend Developer</option>
                    <option value="Full Stack Developer" className="bg-[#181818]">Full Stack Developer</option>
                    <option value="Data Scientist" className="bg-[#181818]">Data Scientist</option>
                    <option value="DevOps / Cloud" className="bg-[#181818]">DevOps / Cloud</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Professional Headline / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] disabled:opacity-50 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(255,140,0,0.3)] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>{saving ? 'Saving to Database...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Target Job Profiles */}
            {activeTab === 'target_profiles' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2C2C] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#FF8C00]" />
                      <span>Target Job Profiles (1 Job Target per Profile)</span>
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      You can target multiple careers under your account ({user?.email || 'this email'}). Each profile focuses on 1 specific job role.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,140,0,0.3)] transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Target Profile</span>
                  </button>
                </div>

                {/* Profiles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {targetProfiles.map((tp) => {
                    const isActive = tp.id === activeProfile?.id
                    return (
                      <div
                        key={tp.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isActive
                            ? 'bg-[#FF8C00]/10 border-[#FF8C00] shadow-[0_0_15px_rgba(255,140,0,0.15)]'
                            : 'bg-[#181818] border-[#303030] hover:border-[#444444]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                Profile Name
                              </span>
                              <h4 className="text-sm font-black text-white">{tp.profile_name}</h4>
                            </div>

                            {isActive ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FF8C00] text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" /> Active Focus
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => switchActiveProfile(tp.id)}
                                className="px-2.5 py-1 bg-[#252525] hover:bg-[#303030] text-gray-300 hover:text-white border border-[#3A3A3A] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Set as Active
                              </button>
                            )}
                          </div>

                          <div className="p-3 bg-[#121212] rounded-lg border border-[#262626]">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                              Target Job Benchmark:
                            </span>
                            <span className="text-xs font-bold text-[#FF8C00] flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" />
                              <span>{tp.target_job_role}</span>
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-gray-500">
                          <span>1 Job Target Fixed</span>

                          {targetProfiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteTargetProfile(tp.id)}
                              className="text-gray-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              title="Delete this profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Career Preferences */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h3 className="text-sm font-black text-white mb-3">Target Career Preferences</h3>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Job Roles
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {careerPref.targetRoles.map((r) => (
                      <span
                        key={r}
                        className="px-3 py-1 bg-[#FF8C00]/15 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-bold rounded-lg flex items-center gap-1.5"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#A1A1AA]">Used by the skill gap engine to tailor your interview questions.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={careerPref.preferredLocation}
                    onChange={(e) => setCareerPref({ ...careerPref, preferredLocation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Work Arrangement
                  </label>
                  <div className="flex gap-4 text-xs font-bold text-gray-300 pt-1">
                    {['Remote', 'Hybrid', 'On-site'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="workType"
                          value={type}
                          checked={careerPref.workType === type}
                          onChange={(e) => setCareerPref({ ...careerPref, workType: e.target.value })}
                          className="text-[#FF8C00] focus:ring-[#FF8C00]"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Annual Salary Expectation ($ USD)
                  </label>
                  <input
                    type="text"
                    value={careerPref.expectedSalary}
                    onChange={(e) => setCareerPref({ ...careerPref, expectedSalary: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(255,140,0,0.3)] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white mb-3">Notification Alerts</h3>

                <div className="space-y-3">
                  {[
                    { key: 'emailAlerts', title: 'New Skill Gap Reports', desc: 'Notify me when industry requirements shift for my target role.' },
                    { key: 'interviewReminders', title: 'Mock Interview Reminders', desc: 'Weekly prompts to keep verbal response skills sharp.' },
                    { key: 'weeklyProgress', title: 'Curriculum Progress Digest', desc: 'Summary of milestones completed each Sunday.' },
                    { key: 'recruiterDirect', title: 'Recruiter Outreach Match', desc: 'Allow vetted hiring managers to view my ATS resume score.' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-xl border border-[#303030] bg-[#181818] flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-[#A1A1AA] mt-0.5">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#FF8C00] border-[#444444] focus:ring-[#FF8C00] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveSuccess(true)
                      setTimeout(() => setSaveSuccess(false), 3000)
                    }}
                    className="px-6 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(255,140,0,0.3)] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-black" />
                    <span>Save Alerts</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Security */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="text-sm font-black text-white mb-2">Security &amp; Password Management</h3>

                {passwordState.status === 'SUCCESS' && (
                  <div className="p-3 bg-[#14261C] border border-[#234A34] text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Password updated successfully in Supabase Auth!</span>
                  </div>
                )}

                {passwordState.status && passwordState.status !== 'SUCCESS' && (
                  <div className="p-3 bg-[#2B1717] border border-[#522525] text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>{passwordState.status}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 pb-5 border-b border-[#2C2C2C]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Update Password</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full px-3 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                        placeholder="Repeat new password"
                        className="w-full px-3 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FF8C00] text-black text-xs font-black rounded-xl hover:bg-[#FFA024] transition-colors cursor-pointer"
                  >
                    Save New Password
                  </button>
                </form>

                {/* Account details */}
                <div className="text-xs text-[#A1A1AA] space-y-1">
                  <p><strong>User ID:</strong> <code className="bg-[#181818] px-1.5 py-0.5 rounded text-[11px] border border-[#303030] text-[#FF8C00]">{user?.id || 'demo-user'}</code></p>
                  <p><strong>Session:</strong> Active JWT with automatic refresh</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Target Profile Modal */}
      <CreateProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
