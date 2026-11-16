import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Target,
  MessageSquare,
  Map,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  Award,
  Zap,
  Download,
  Trash2,
  AlertCircle,
  Eye,
  RefreshCw,
  PlusCircle,
  BookOpen,
  UserCheck,
  Edit3,
  Compass,
  CheckCircle2,
  XCircle,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'
import StatsCard from '../components/common/StatsCard'
import SectionHeader from '../components/common/SectionHeader'
import ProgressBar from '../components/common/ProgressBar'

const FASTAPI_BASE_URL = 'http://localhost:8000/api/resumes'

// Recommended Career Roles
const RECOMMENDED_ROLES = [
  { slug: 'full-stack-developer', title: 'Full Stack Developer', category: 'Web Development', skills: 10, difficulty: 'Entry Level' },
  { slug: 'software-developer', title: 'Software Engineer', category: 'Software Development', skills: 8, difficulty: 'Entry Level' },
  { slug: 'python-developer', title: 'Python Developer', category: 'Backend Engineering', skills: 8, difficulty: 'Entry Level' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, session, activeProfile, setNeedsOnboarding } = useAuth()

  // Real data states from Supabase & FastAPI
  const [resumes, setResumes] = useState([])
  const [analyses, setAnalyses] = useState([])
  const [interviews, setInterviews] = useState([])
  const [roadmaps, setRoadmaps] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [isDeleting, setIsDeleting] = useState(null)

  // Fetch all student metrics from FastAPI, Supabase & Cache
  const fetchDashboardData = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      let combinedResumes = []
      const token = session?.access_token || 'demo-token-' + user.id

      // 1a. Try fetching from FastAPI backend (/api/resumes)
      try {
        const res = await fetch(FASTAPI_BASE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': user.id,
            'x-user-email': user.email || '',
            'x-user-name': user.user_metadata?.full_name || '',
          },
        })
        if (res.ok) {
          const apiResumes = await res.json()
          if (Array.isArray(apiResumes)) {
            combinedResumes = [...apiResumes]
          }
        }
      } catch (backendErr) {
        // FastAPI offline fallback
      }

      // 1b. Fetch from Supabase PostgreSQL (if configured)
      if (isSupabaseConfigured()) {
        try {
          const { data: resumesData, error: resumesErr } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (!resumesErr && Array.isArray(resumesData)) {
            for (const r of resumesData) {
              if (!combinedResumes.some((c) => c.id === r.id)) {
                combinedResumes.push(r)
              }
            }
          }
        } catch (dbErr) {
          console.warn('Supabase resumes fetch note:', dbErr)
        }
      }

      // 1c. Merge from local cache fallback
      try {
        const cached = localStorage.getItem('careerpilot_resumes_' + user.id)
        if (cached) {
          const parsedCache = JSON.parse(cached)
          if (Array.isArray(parsedCache)) {
            for (const r of parsedCache) {
              if (!combinedResumes.some((c) => c.id === r.id)) {
                combinedResumes.push(r)
              }
            }
          }
        }
      } catch {}

      setResumes(combinedResumes)

      // 2. Fetch latest resume analyses
      try {
        const resAnalyses = await fetch('http://localhost:8000/api/resumes/analyses', {
          headers: { Authorization: `Bearer ${token}`, 'x-user-id': user.id },
        })
        if (resAnalyses.ok) {
          const data = await resAnalyses.json()
          if (Array.isArray(data)) setAnalyses(data)
        }
      } catch {}

      if (isSupabaseConfigured() && analyses.length === 0) {
        try {
          const { data: analysesData } = await supabase
            .from('resume_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          if (analysesData) setAnalyses(analysesData)
        } catch {}
      }

      // 3. Fetch interview sessions
      try {
        const resIv = await fetch('http://localhost:8000/api/interviews', {
          headers: { Authorization: `Bearer ${token}`, 'x-user-id': user.id },
        })
        if (resIv.ok) {
          const ivs = await resIv.json()
          if (Array.isArray(ivs)) setInterviews(ivs)
        }
      } catch {}

      if (isSupabaseConfigured() && interviews.length === 0) {
        try {
          const { data: interviewData } = await supabase
            .from('interview_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          if (interviewData) setInterviews(interviewData)
        } catch {}
      }

      // 4. Fetch learning roadmap milestones
      try {
        const cachedRoadmap = localStorage.getItem('careerpilot_roadmap_' + user.id)
        if (cachedRoadmap) {
          const parsed = JSON.parse(cachedRoadmap)
          if (parsed?.weekly_milestones) setRoadmaps(parsed.weekly_milestones)
        }
      } catch {}

      if (isSupabaseConfigured() && roadmaps.length === 0) {
        try {
          const { data: roadmapData } = await supabase
            .from('learning_roadmaps')
            .select('*')
            .eq('user_id', user.id)
            .order('phase_number', { ascending: true })
          if (roadmapData) setRoadmaps(roadmapData)
        } catch {}
      }

      // 5. Fetch user activity log
      if (isSupabaseConfigured()) {
        try {
          const { data: activityData } = await supabase
            .from('user_activity')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(6)
          if (activityData) setActivities(activityData)
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
      setErrorMsg('Failed to load real-time metrics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const handleUpdate = () => fetchDashboardData()
    window.addEventListener('careerpilot_resumes_updated', handleUpdate)
    window.addEventListener('careerpilot_roadmap_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('careerpilot_resumes_updated', handleUpdate)
      window.removeEventListener('careerpilot_roadmap_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [user, session])

  // Latest Analysis metrics
  const latestAnalysis = analyses[0] || null
  const latestResumeScore = latestAnalysis ? latestAnalysis.match_score : null
  const missingSkillsList = latestAnalysis?.missing_skills
    ? Array.isArray(latestAnalysis.missing_skills)
      ? latestAnalysis.missing_skills.slice(0, 6)
      : []
    : latestAnalysis?.missing_required_skills
    ? latestAnalysis.missing_required_skills.slice(0, 6)
    : []

  // Extracted skills count
  const verifiedSkillsCount = useMemo(() => {
    if (latestAnalysis?.matched_skills?.length) {
      return latestAnalysis.matched_skills.length
    }
    const firstResume = resumes[0]
    return firstResume?.parsed_data?.technical_skills?.length || 0
  }, [latestAnalysis, resumes])

  // Completed interviews
  const completedInterviews = interviews.filter((i) => i.status === 'completed' || i.overall_score)
  const avgInterviewScore = completedInterviews.length
    ? Math.round(
        completedInterviews.reduce((acc, curr) => acc + (Number(curr.overall_score) || 0), 0) /
          completedInterviews.length
      )
    : null

  // Roadmap completion
  const roadmapCompletion = useMemo(() => {
    try {
      const cached = localStorage.getItem('careerpilot_roadmap_' + user?.id)
      if (cached) {
        const parsed = JSON.parse(cached)
        return parsed.overall_completion_percentage || 0
      }
    } catch {}
    if (!roadmaps.length) return 0
    const done = roadmaps.filter((m) => m.completion_status === 'completed' || m.status === 'completed').length
    return Math.round((done / roadmaps.length) * 100)
  }, [roadmaps, user])

  // Recharts: Skill match trend data
  const scoreTrendData = useMemo(() => {
    if (analyses.length > 0) {
      return [...analyses]
        .reverse()
        .map((a, idx) => ({
          name: `Scan ${idx + 1}`,
          score: a.match_score,
          date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        }))
    }
    return []
  }, [analyses])

  // Download resume file
  const handleDownloadResume = async (resume) => {
    try {
      const token = session?.access_token || 'demo-token-' + (user?.id || 'guest')
      try {
        const res = await fetch(`${FASTAPI_BASE_URL}/${resume.id}/signed-url`, {
          headers: { Authorization: `Bearer ${token}`, 'x-user-id': user?.id || '' },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.signed_url) {
            window.open(data.signed_url, '_blank')
            return
          }
        }
      } catch {}

      if (isSupabaseConfigured() && resume.file_path) {
        const { data, error } = await supabase.storage
          .from('resumes')
          .createSignedUrl(resume.file_path, 3600)

        if (!error && data?.signedUrl) {
          window.open(data.signedUrl, '_blank')
          return
        }
      }

      alert('Could not generate private signed download URL for this file.')
    } catch (err) {
      alert('Download error: ' + err.message)
    }
  }

  // Delete resume
  const handleDeleteResume = async (resumeId, filePath) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return

    setIsDeleting(resumeId)
    try {
      const token = session?.access_token || 'demo-token-' + (user?.id || 'guest')
      try {
        await fetch(`${FASTAPI_BASE_URL}/${resumeId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, 'x-user-id': user?.id || '' },
        })
      } catch {}

      if (isSupabaseConfigured()) {
        if (filePath) {
          try {
            await supabase.storage.from('resumes').remove([filePath])
          } catch {}
        }
        await supabase.from('resumes').delete().eq('id', resumeId)
      }

      setResumes((prev) => {
        const updated = prev.filter((r) => r.id !== resumeId)
        if (user?.id) {
          try {
            localStorage.setItem('careerpilot_resumes_' + user.id, JSON.stringify(updated))
          } catch {}
        }
        return updated
      })

      setActionSuccess('Resume deleted successfully.')
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      alert('Delete error: ' + err.message)
    } finally {
      setIsDeleting(null)
    }
  }

  const studentName = profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const targetRole = activeProfile?.target_job_role || profile?.target_job_role || ''

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          WELCOME HERO CARD (Manhwa18 Dark Gradient & Orange Highlight)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-[#1A1A1A] via-[#202020] to-[#2B1B0F] border border-[#2E2E2E] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          {targetRole ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF8C00]/15 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Role: {targetRole}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNeedsOnboarding && setNeedsOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 border border-[#FF8C00]/40 text-[#FF8C00] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Set Your Target Job Role</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-[#FF8C00]">{studentName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Your career cockpit is synced. Review your ATS match score, practice live technical interview questions,
            and complete weekly milestones to become job-ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <Link
            to="/dashboard/upload-resume"
            className="px-4 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] text-black text-xs font-black rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(255,140,0,0.35)] transition-all"
          >
            <Upload className="w-4 h-4 font-black" />
            <span>Upload Resume</span>
          </Link>
          <Link
            to="/dashboard/mock-interview"
            className="px-4 py-2.5 bg-[#262626] hover:bg-[#303030] border border-[#383838] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Terminal className="w-4 h-4 text-[#FF8C00]" />
            <span>Start Interview</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* =========================================================================
          FOUR COMPACT STATISTICS CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          icon={FileText}
          title="Resume Match Score"
          value={latestResumeScore !== null ? `${latestResumeScore}%` : '--'}
          subtext={latestResumeScore !== null ? 'Documented ATS alignment' : 'Upload CV to calculate'}
          trend={latestResumeScore !== null ? '+8% this month' : 'Pending'}
          highlight={latestResumeScore !== null}
        />
        <StatsCard
          icon={CheckCircle}
          title="Verified Skills"
          value={verifiedSkillsCount}
          subtext="Extracted from your CV"
          trend={verifiedSkillsCount > 0 ? 'Validated' : '0 Skills'}
        />
        <StatsCard
          icon={MessageSquare}
          title="Interviews Completed"
          value={completedInterviews.length}
          subtext={avgInterviewScore ? `Avg: ${avgInterviewScore}/100` : 'Practice AI questions'}
          trend={completedInterviews.length > 0 ? 'Active' : 'Ready'}
        />
        <StatsCard
          icon={Map}
          title="Learning Progress"
          value={`${roadmapCompletion}%`}
          subtext="Weekly milestones completed"
          trend={roadmapCompletion > 0 ? 'Active' : 'Not Started'}
        />
      </div>

      {/* =========================================================================
          MAIN TWO-COLUMN DASHBOARD GRID
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Analysis Overview, Score Charts & Resumes Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Latest Resume Analysis Card */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/15 text-[#FF8C00] flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Latest AI Resume Audit</h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Role: {latestAnalysis?.target_role || targetRole || 'Target Role Not Selected'}
                  </span>
                </div>
              </div>

              {latestAnalysis && (
                <Link
                  to="/dashboard/resume-analysis"
                  className="text-xs font-bold text-[#FF8C00] hover:underline flex items-center gap-1"
                >
                  <span>Full Audit Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {latestAnalysis ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Circular Gauge Representation */}
                  <div className="bg-[#181818] border border-[#2E2E2E] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-[#FF8C00]">
                      {latestResumeScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Match Score</span>
                    <span className="text-[11px] text-emerald-400 font-bold mt-1">
                      {latestResumeScore >= 75 ? 'High Potential' : latestResumeScore >= 50 ? 'Moderate Match' : 'Needs Optimization'}
                    </span>
                  </div>

                  {/* Progress Summary */}
                  <div className="sm:col-span-2 space-y-3">
                    <ProgressBar
                      label="Required Core Skills Match"
                      value={latestAnalysis?.scoring_breakdown?.required_skills_score || latestAnalysis?.match_score || 0}
                      color="bg-emerald-500"
                    />
                    <ProgressBar
                      label="Preferred / Differentiator Skills Match"
                      value={latestAnalysis?.scoring_breakdown?.preferred_skills_score || 0}
                      color="bg-[#FF8C00]"
                    />
                    <p className="text-[11px] text-[#A1A1AA] pt-1">
                      Formula: (70% × Required Match) + (30% × Preferred Match). Documented skills verified.
                    </p>
                  </div>
                </div>

                {/* Missing Skills Tags Section */}
                {missingSkillsList.length > 0 && (
                  <div className="pt-2 border-t border-[#2A2A2A]">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-400" /> Detected Skill Gaps to Close:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkillsList.map((skill, idx) => {
                        const skillName = typeof skill === 'string' ? skill : skill.name
                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-950/30 border border-red-500/30 text-red-300"
                          >
                            {skillName}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/15 text-[#FF8C00] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-white">No Resume Uploaded Yet</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Upload your CV in PDF or DOCX format to receive an instant ATS score, benchmark against your target role ({targetRole || 'selected track'}), and see missing skill gaps.
                  </p>
                </div>
                <Link
                  to="/dashboard/upload-resume"
                  className="mt-2 px-4 py-2 bg-[#FF8C00] hover:bg-[#FFA024] text-black text-xs font-black rounded-xl inline-flex items-center gap-2 shadow-[0_0_15px_rgba(255,140,0,0.35)] transition-all"
                >
                  <Upload className="w-4 h-4 font-black" />
                  <span>Upload Your CV Now</span>
                </Link>
              </div>
            )}
          </div>

          {/* Score Improvement Recharts Chart (Dark Themed) */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF8C00]" />
                  <span>Resume Match Score History</span>
                </h3>
                <p className="text-[11px] text-[#A1A1AA]">ATS compatibility improvement over time</p>
              </div>
              {scoreTrendData.length > 1 && (
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +23% Total Growth
                </span>
              )}
            </div>

            {scoreTrendData.length > 0 ? (
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FF8C00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#71717A" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161616',
                        borderColor: '#383838',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#FF8C00"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-36 rounded-xl border border-dashed border-[#2E2E2E] flex flex-col items-center justify-center text-center p-4">
                <Clock className="w-5 h-5 text-gray-500 mb-1.5" />
                <p className="text-xs text-gray-400">No score history recorded yet.</p>
                <p className="text-[11px] text-gray-500">Scan results will appear here as you upload and revise your resumes.</p>
              </div>
            )}
          </div>

          {/* Your Resumes & Storage Records Table */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF8C00]" />
                <h3 className="text-sm font-bold text-white">Your Resumes & Storage Records</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181818] border border-[#303030] text-gray-400">
                  {resumes.length}
                </span>
              </div>

              <Link
                to="/dashboard/upload-resume"
                className="text-xs font-bold text-[#FF8C00] hover:underline flex items-center gap-1"
              >
                <span>Upload New CV</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {resumes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2C2C2C] text-[#A1A1AA] uppercase font-bold text-[10px]">
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Uploaded Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {resumes.map((r) => (
                      <tr key={r.id} className="hover:bg-[#252525] transition-colors">
                        <td className="py-3 px-3 font-semibold text-white flex items-center gap-2 max-w-[200px] truncate">
                          <FileText className="w-3.5 h-3.5 text-[#FF8C00] shrink-0" />
                          <span className="truncate">{r.file_name}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-mono">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {r.processing_status || 'completed'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDownloadResume(r)}
                            title="Download Resume"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2F2F2F] rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteResume(r.id, r.file_path)}
                            disabled={isDeleting === r.id}
                            title="Delete Resume"
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#2F2F2F] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#181818] border border-dashed border-[#303030] rounded-xl space-y-2">
                <FileText className="w-6 h-6 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">No resumes uploaded yet.</p>
                <Link
                  to="/dashboard/upload-resume"
                  className="inline-block text-xs font-bold text-[#FF8C00] hover:underline"
                >
                  Upload your first resume →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Careers, Roadmap, Mock Interviews & Audit Trail (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recommended Career Roles */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#FF8C00]" /> Recommended Careers
              </h3>
              <Link to="/dashboard/explore-careers" className="text-[11px] font-bold text-[#FF8C00] hover:underline">
                Explore All
              </Link>
            </div>

            <div className="space-y-2.5">
              {RECOMMENDED_ROLES.map((role) => (
                <Link
                  key={role.slug}
                  to={`/dashboard/resume-analysis?role=${role.slug}`}
                  className="bg-[#181818] border border-[#2E2E2E] hover:border-[#FF8C00]/50 p-3 rounded-xl flex items-center justify-between transition-colors group block"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#FF8C00] transition-colors">
                      {role.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{role.skills} Key Skills • {role.difficulty}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#FF8C00] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Learning Roadmap Progress Card */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Map className="w-4 h-4 text-[#FF8C00]" /> Roadmap Milestones
              </h3>
              <Link to="/dashboard/roadmap" className="text-[11px] font-bold text-[#FF8C00] hover:underline">
                View Roadmap
              </Link>
            </div>

            <div className="space-y-3">
              <ProgressBar
                label="Weekly Milestones Complete"
                value={roadmapCompletion}
                color="bg-gradient-to-r from-[#FF8C00] to-emerald-500"
              />

              {roadmaps.length > 0 ? (
                <div className="space-y-2 pt-1 text-xs">
                  {roadmaps.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-[#181818] border border-[#2A2A2A] rounded-lg flex items-center justify-between">
                      <span className="text-gray-300 font-medium">{m.title || `Phase ${idx + 1}: ${m.phase_name || 'Milestone'}`}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.completion_status === 'completed' || m.status === 'completed'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-[#FF8C00] bg-[#FF8C00]/10'
                      }`}>
                        {m.completion_status === 'completed' || m.status === 'completed' ? 'Done ✓' : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-[#181818] rounded-xl text-xs text-gray-400 space-y-1">
                  <span>No roadmap generated yet.</span>
                  <Link
                    to="/dashboard/roadmap"
                    className="block text-xs font-bold text-[#FF8C00] hover:underline"
                  >
                    Build your learning roadmap →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Mock Interviews */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#FF8C00]" /> Recent Mock Interviews
              </h3>
              <Link to="/dashboard/mock-interview" className="text-[11px] font-bold text-[#FF8C00] hover:underline">
                New Session
              </Link>
            </div>

            <div className="space-y-2">
              {completedInterviews.length > 0 ? (
                completedInterviews.slice(0, 3).map((iv, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#181818] border border-[#2A2A2A] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{iv.job_role || 'Technical Interview'}</div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {iv.difficulty || 'Intermediate'} • {iv.interview_type || 'Mixed'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#FF8C00]">{Math.round(iv.overall_score || 75)}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-[#181818] rounded-xl text-xs text-gray-400">
                  <span>No completed interviews yet.</span>
                  <Link
                    to="/dashboard/mock-interview"
                    className="block text-xs font-bold text-[#FF8C00] mt-1 hover:underline"
                  >
                    Start your first session →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Audit Trail */}
          <div className="bg-[#202020] border border-[#303030] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-[#2A2A2A] pb-3">
              <Clock className="w-4 h-4 text-[#FF8C00]" /> Activity Audit Trail
            </h3>

            <div className="space-y-2 text-xs">
              {activities.length > 0 ? (
                activities.slice(0, 4).map((act, idx) => (
                  <div key={idx} className="p-2 bg-[#181818] rounded-lg text-gray-300 flex items-center justify-between">
                    <span>{act.activity_type || act.action || 'Activity recorded'}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 bg-[#181818] rounded-lg text-gray-400 flex items-center justify-between">
                  <span>Account ready &amp; active</span>
                  <span className="text-[10px] text-gray-500">Just now</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
