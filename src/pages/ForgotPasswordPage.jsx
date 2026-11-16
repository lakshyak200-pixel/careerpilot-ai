import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setErrorMsg(error.message || 'Failed to send password reset email.')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6 text-white">
      <div className="w-full max-w-md bg-[#202020] rounded-2xl p-7 sm:p-8 border border-[#303030] shadow-2xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-[#FF8C00] rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="text-lg font-black text-white">
              CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-white">Reset Your Password</h2>
          <p className="text-xs text-[#A1A1AA] mt-1.5">
            Enter the email associated with your account, and we&apos;ll send you a secure link to reset your credentials.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-4 p-3 bg-[#241B10] border border-[#42290A] rounded-xl text-xs text-[#FBBF24] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>Running in demo mode. Test reset simulated directly.</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Check your inbox</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>. Please click the link inside the email to choose a new password.
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF8C00] hover:text-[#FFA024]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-[#2B1717] border border-[#522525] rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#333333] text-xs focus:outline-none focus:border-[#FF8C00] bg-[#181818] text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#FF8C00] hover:bg-[#FFA024] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,140,0,0.3)] transition-all cursor-pointer"
            >
              {loading ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-[#A1A1AA] hover:text-[#FF8C00] inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
