import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Flame,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, isConfigured } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: 'B.Tech / B.E.',
    branch: '',
    graduationYear: '2026',
    termsAccepted: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Password strength calculator
  const getPasswordStrength = () => {
    const len = formData.password.length
    if (len === 0) return { label: 'Empty', score: 0, color: 'bg-[#2A2A2A]' }
    if (len < 6) return { label: 'Too short', score: 1, color: 'bg-rose-500' }
    if (len < 10) return { label: 'Moderate', score: 2, color: 'bg-[#FF8C00]' }
    return { label: 'Strong', score: 3, color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms of Service to create your account.')
      return
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your inputs.')
      return
    }

    setLoading(true)

    try {
      const { data, error, needsEmailConfirmation } = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        college: formData.college.trim(),
        degree: formData.degree,
        branch: formData.branch.trim(),
        graduationYear: formData.graduationYear,
      })

      if (error) {
        setErrorMsg(error.message || 'Registration failed. Please try again.')
      } else if (needsEmailConfirmation) {
        setEmailSent(true)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#121212] text-white">
      {/* Left Column: Branding Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#181818] border-r border-[#2A2A2A] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-10 right-10 w-80 h-80 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FFA024]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8C00] to-[#E05A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,140,0,0.35)]">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
            </span>
          </Link>

          <div className="mt-16 max-w-md">
            <span className="px-3 py-1 rounded-full bg-[#FF8C00]/20 text-[#FF8C00] text-xs font-black tracking-wider uppercase border border-[#FF8C00]/30">
              Student Career Intelligence
            </span>
            <h1 className="text-3xl font-black mt-4 leading-tight text-white">
              Build your technical portfolio for top tech employers.
            </h1>
            <p className="mt-3 text-[#A1A1AA] text-sm leading-relaxed">
              Join thousands of engineering students discovering career benchmarks, closing skill gaps, and acing mock interviews.
            </p>

            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">PyMuPDF &amp; python-docx resume parsing</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">Sentence Transformers contextual skill gap detection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">Interactive 4/8/12-week roadmap milestones</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">AI mock interviews with multi-dimensional scoring rubric</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#A1A1AA] border-t border-[#2A2A2A] pt-6">
          &copy; 2026 CareerPilot AI. Student Privacy Guaranteed.
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-[#202020] border border-[#303030] rounded-2xl p-7 sm:p-8 shadow-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-[#FF8C00] rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-black fill-black" />
              </div>
              <span className="text-lg font-black text-white">
                CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
              </span>
            </Link>
          </div>

          {!isConfigured && (
            <div className="mb-4 p-3 bg-[#241B10] border border-[#42290A] rounded-xl text-xs text-[#FBBF24] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <span>
                <strong>Demo Mode Active:</strong> You can create a test student account and explore all features immediately.
              </span>
            </div>
          )}

          {emailSent ? (
            /* Email Verification Screen */
            <div className="bg-[#181818] rounded-2xl p-8 border border-[#303030] text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-[#FF8C00]/20 text-[#FF8C00] rounded-full flex items-center justify-center mx-auto border border-[#FF8C00]/30">
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-white">Verify your email</h2>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                We sent an activation link to <strong className="text-white">{formData.email}</strong>. Please check your inbox (and spam folder) to activate your account.
              </p>
              <div className="pt-4 flex justify-center">
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-[#FF8C00] text-black font-black rounded-xl text-xs hover:bg-[#FFA024] transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-white">Create Your Student Account</h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Fill in your academic details to receive personalized career guidance.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-[#2B1717] border border-[#522525] rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Full Name <span className="text-[#FF8C00]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Email Address <span className="text-[#FF8C00]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex.johnson@university.edu"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                </div>

                {/* College or University */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    College or University <span className="text-[#FF8C00]">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Stanford University"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    />
                  </div>
                </div>

                {/* Degree & Branch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Degree <span className="text-[#FF8C00]">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      >
                        <option value="B.Tech / B.E." className="bg-[#181818]">B.Tech / B.E.</option>
                        <option value="B.Sc / BCA" className="bg-[#181818]">B.Sc / BCA</option>
                        <option value="M.Tech / M.E." className="bg-[#181818]">M.Tech / M.E.</option>
                        <option value="MCA / M.Sc" className="bg-[#181818]">MCA / M.Sc</option>
                        <option value="MBA / BBA" className="bg-[#181818]">MBA / BBA</option>
                        <option value="Other" className="bg-[#181818]">Other Degree</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Branch <span className="text-[#FF8C00]">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Graduation Year <span className="text-[#FF8C00]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                    >
                      <option value="2024" className="bg-[#181818]">2024 (Graduated)</option>
                      <option value="2025" className="bg-[#181818]">2025 (Final Year)</option>
                      <option value="2026" className="bg-[#181818]">2026 (Junior / 3rd Year)</option>
                      <option value="2027" className="bg-[#181818]">2027 (Sophomore)</option>
                      <option value="2028" className="bg-[#181818]">2028 (Freshman)</option>
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Password <span className="text-[#FF8C00]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-[#FF8C00]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Strength Meter */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>Password Strength</span>
                    <span className="font-bold text-white">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#141414] rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-[#FF8C00] border-[#333333] rounded focus:ring-[#FF8C00] cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2 block text-xs text-[#A1A1AA] leading-relaxed cursor-pointer">
                    I agree to the <span className="text-[#FF8C00] underline">Terms of Service</span> and allow CareerPilot to build my secure profile.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,140,0,0.3)] flex items-center justify-center gap-2 group text-xs cursor-pointer"
                >
                  {loading ? (
                    <span>Creating Your Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[#A1A1AA]">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-[#FF8C00] hover:text-[#FFA024]">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
