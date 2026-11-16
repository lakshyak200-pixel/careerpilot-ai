import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Flame,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const { data, error } = await signIn({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.')
      } else {
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async () => {
    setEmail('demo@careerpilot.ai')
    setPassword('demo1234')
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await signIn({
        email: 'demo@careerpilot.ai',
        password: 'demo1234',
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo sign in failed.')
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

          <div className="mt-20 max-w-md">
            <span className="px-3 py-1 rounded-full bg-[#FF8C00]/20 text-[#FF8C00] text-xs font-black tracking-wider uppercase border border-[#FF8C00]/30">
              Student Career Intelligence
            </span>
            <h1 className="text-4xl font-black mt-4 leading-tight text-white">
              Sign in to your career command center.
            </h1>
            <p className="mt-4 text-[#A1A1AA] text-sm leading-relaxed">
              Resume scoring, skill gap detection, and personalized interview practice synced directly with your university profile.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">Supabase Auth with persistent JWT sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">PostgreSQL Row-Level Security on all student records</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />
                <span className="text-xs text-gray-200">Instant AI mock interviews &amp; personalized learning roadmaps</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#A1A1AA] border-t border-[#2A2A2A] pt-6">
          &copy; 2026 CareerPilot AI. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-[#202020] border border-[#303030] rounded-2xl p-7 sm:p-8 shadow-2xl">
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

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white">Welcome Back</h2>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Sign in to access your resume analysis and practice roadmap.
            </p>
          </div>

          {!isConfigured && (
            <div className="mb-4 p-3 bg-[#241B10] border border-[#42290A] rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#FBBF24] leading-relaxed">
                <strong>Demo Mode Active:</strong> You can sign in immediately with any credentials.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-[#2B1717] border border-[#522525] rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#303030] border border-[#FF8C00]/40 hover:border-[#FF8C00] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,140,0,0.15)] transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#FF8C00] group-hover:scale-110 transition-transform" />
              <span>⚡ 1-Click Demo Sign In (Explore All Features)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#FF8C00] hover:text-[#FFA024]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#FF8C00] border-[#333333] rounded focus:ring-[#FF8C00] cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#A1A1AA] cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,140,0,0.3)] flex items-center justify-center gap-2 group text-xs cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#A1A1AA]">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#FF8C00] hover:text-[#FFA024]">
              Create an account
            </Link>
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-5 p-3.5 bg-[#181818] border border-[#2E2E2E] rounded-xl text-[11px] text-gray-300 space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" /> Demo Test Account:
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">
                Instant Access
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-0.5">
              <span className="text-gray-400">Email:</span>
              <code className="text-[#FF8C00] font-mono font-bold bg-[#121212] px-1.5 py-0.5 rounded border border-[#333333]">
                demo@careerpilot.ai
              </code>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Password:</span>
              <code className="text-[#FF8C00] font-mono font-bold bg-[#121212] px-1.5 py-0.5 rounded border border-[#333333]">
                demo1234
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
