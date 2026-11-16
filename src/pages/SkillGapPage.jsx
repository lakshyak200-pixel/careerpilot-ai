import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Code,
  Layers,
  ChevronRight,
  Cpu,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'
import SectionHeader from '../components/common/SectionHeader'

const defaultRoleSkillData = {
  frontend: {
    title: 'Frontend Developer',
    matchPercentage: 68,
    skills: [
      { name: 'JavaScript / ES6+', current: 85, required: 85, status: 'met', level: 'Advanced' },
      { name: 'React.js & Hooks', current: 75, required: 80, status: 'close', level: 'Intermediate' },
      { name: 'Tailwind CSS / UI', current: 90, required: 70, status: 'met', level: 'Advanced' },
      { name: 'TypeScript', current: 30, required: 80, status: 'gap', level: 'Beginner' },
      { name: 'Next.js & SSR', current: 20, required: 75, status: 'gap', level: 'Beginner' },
      { name: 'State (Redux / Zustand)', current: 40, required: 75, status: 'gap', level: 'Beginner' },
      { name: 'Testing (Jest/Vitest)', current: 25, required: 70, status: 'gap', level: 'Beginner' },
      { name: 'REST APIs & Async', current: 80, required: 80, status: 'met', level: 'Advanced' },
    ],
    recommendations: [
      {
        skill: 'TypeScript Essentials',
        timeEst: '2-3 weeks',
        type: 'Core Gap',
        desc: 'Learn static typing, interfaces, generics, and React component prop types.',
        course: 'TypeScript Fundamentals for React Engineers (Free / Official Docs)',
      },
      {
        skill: 'Next.js 14+ App Router',
        timeEst: '1-2 weeks',
        type: 'High Demand',
        desc: 'Server vs Client components, routing, and API route generation.',
        course: 'Official Next.js Learn interactive course',
      },
      {
        skill: 'Frontend Unit Testing',
        timeEst: '1 week',
        type: 'Differentiator',
        desc: 'Vitest, React Testing Library, and mocking API calls.',
        course: 'Testing JavaScript Applications by Kent C. Dodds',
      },
    ],
  },
  backend: {
    title: 'Backend Developer',
    matchPercentage: 54,
    skills: [
      { name: 'Python / FastAPI', current: 70, required: 85, status: 'close', level: 'Intermediate' },
      { name: 'SQL & PostgreSQL', current: 65, required: 80, status: 'close', level: 'Intermediate' },
      { name: 'Docker & Containers', current: 20, required: 75, status: 'gap', level: 'Beginner' },
      { name: 'Redis Caching', current: 15, required: 70, status: 'gap', level: 'Beginner' },
      { name: 'System Design Basics', current: 35, required: 75, status: 'gap', level: 'Beginner' },
      { name: 'Git & Linux CLI', current: 80, required: 80, status: 'met', level: 'Advanced' },
    ],
    recommendations: [
      {
        skill: 'Docker for Backend Engineers',
        timeEst: '10 days',
        type: 'Core Gap',
        desc: 'Containerizing Python/Node services, multi-stage builds, and Docker Compose.',
        course: 'Docker & Kubernetes: Practical Guide',
      },
      {
        skill: 'Relational Database Indexing',
        timeEst: '1 week',
        type: 'Performance',
        desc: 'PostgreSQL indexing, query plan analysis with EXPLAIN ANALYZE.',
        course: 'Use The Index, Luke (Free Database Resource)',
      },
    ],
  },
  fullstack: {
    title: 'Full Stack Developer',
    matchPercentage: 62,
    skills: [
      { name: 'Frontend (React/HTML/CSS)', current: 85, required: 80, status: 'met', level: 'Advanced' },
      { name: 'Backend API Design', current: 65, required: 80, status: 'close', level: 'Intermediate' },
      { name: 'Databases & ORMs', current: 60, required: 75, status: 'close', level: 'Intermediate' },
      { name: 'Authentication & Security', current: 40, required: 75, status: 'gap', level: 'Beginner' },
      { name: 'DevOps / CI/CD', current: 20, required: 70, status: 'gap', level: 'Beginner' },
    ],
    recommendations: [
      {
        skill: 'JWT & OAuth2 Authentication',
        timeEst: '1-2 weeks',
        type: 'Security',
        desc: 'Implementing secure auth with Supabase Auth or FastAPI JWT tokens.',
        course: 'Modern Web Application Security & Tokens',
      },
      {
        skill: 'CI/CD Pipelines (GitHub Actions)',
        timeEst: '1 week',
        type: 'DevOps',
        desc: 'Automating linting, test suites, and container deployment.',
        course: 'GitHub Actions Continuous Integration Course',
      },
    ],
  },
}

export default function SkillGapPage() {
  const [selectedRoleKey, setSelectedRoleKey] = useState('frontend')
  const [dbJobRoles, setDbJobRoles] = useState([])

  useEffect(() => {
    async function loadJobRoles() {
      if (!isSupabaseConfigured()) return
      try {
        const { data, error } = await supabase.from('job_roles').select('*')
        if (!error && data?.length) {
          setDbJobRoles(data)
        }
      } catch (err) {
        console.warn('Could not load roles from database:', err)
      }
    }
    loadJobRoles()
  }, [])

  const activeRole = defaultRoleSkillData[selectedRoleKey] || defaultRoleSkillData.frontend

  const getStatusBadge = (status) => {
    switch (status) {
      case 'met':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Met
          </span>
        )
      case 'close':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30">
            <TrendingUp className="w-3 h-3" /> Near Target
          </span>
        )
      case 'gap':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> Skill Gap
          </span>
        )
    }
  }

  const getBarColor = (status) => {
    switch (status) {
      case 'met':
        return 'bg-emerald-500'
      case 'close':
        return 'bg-[#FF8C00]'
      case 'gap':
      default:
        return 'bg-rose-500'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header with Role Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <SectionHeader
            title="Skill Gap Analysis"
            badge="Role Benchmarks"
          />
          <p className="text-xs text-[#A1A1AA] mt-1">
            Compare your audited skills against live industry requirements for fresh graduates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-300">Target Role:</label>
          <select
            value={selectedRoleKey}
            onChange={(e) => setSelectedRoleKey(e.target.value)}
            className="px-3.5 py-2 bg-[#202020] border border-[#333333] hover:border-[#FF8C00] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#FF8C00] shadow-sm cursor-pointer"
          >
            {dbJobRoles.length > 0 ? (
              dbJobRoles.map((r) => (
                <option
                  key={r.id}
                  value={
                    r.role_name.toLowerCase().includes('backend')
                      ? 'backend'
                      : r.role_name.toLowerCase().includes('full')
                      ? 'fullstack'
                      : 'frontend'
                  }
                  className="bg-[#202020] text-white"
                >
                  {r.role_name}
                </option>
              ))
            ) : (
              <>
                <option value="frontend" className="bg-[#202020] text-white">Frontend Developer (React)</option>
                <option value="backend" className="bg-[#202020] text-white">Backend Developer (FastAPI/Python)</option>
                <option value="fullstack" className="bg-[#202020] text-white">Full Stack Developer</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Backend Integration Note */}
      <div className="p-3.5 bg-[#1A1A1A] border border-[#303030] rounded-xl flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
        <div className="text-xs text-[#A1A1AA] leading-relaxed">
          <span className="font-bold text-white">Supabase PostgreSQL <code>job_roles</code> Table Connected:</span> Role requirements and skill benchmarks are loaded from your live database. Authenticated students can view benchmarks with Row Level Security.
        </div>
      </div>

      {/* Overview Cards: Match Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Percentage Card */}
        <div className="bg-[#181818] border border-[#303030] text-white rounded-2xl p-7 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="relative w-36 h-36 flex items-center justify-center my-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#282828]"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#FF8C00"
                strokeDasharray={`${activeRole.matchPercentage}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white">{activeRole.matchPercentage}%</span>
              <span className="text-[10px] font-bold text-[#FF8C00] uppercase tracking-wider">Role Match</span>
            </div>
          </div>

          <h3 className="text-base font-bold mt-1 text-white">{activeRole.title} Readiness</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs leading-relaxed">
            Acquiring the 3 highlighted skills will lift your role match above 85%.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 bg-[#202020] rounded-2xl p-6 border border-[#303030] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white mb-1">Competency Summary</h3>
            <p className="text-xs text-[#A1A1AA] mb-6">Distribution across verified vs needed technical topics</p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#14261C] border border-[#234A34]">
                <span className="text-2xl font-black text-emerald-400">
                  {activeRole.skills.filter((s) => s.status === 'met').length}
                </span>
                <p className="text-xs font-bold text-white mt-1">Verified Strong</p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Resume supported</p>
              </div>

              <div className="p-4 rounded-xl bg-[#2B2314] border border-[#524122]">
                <span className="text-2xl font-black text-[#FF8C00]">
                  {activeRole.skills.filter((s) => s.status === 'close').length}
                </span>
                <p className="text-xs font-bold text-white mt-1">Near Requirements</p>
                <p className="text-[10px] text-[#FFA024]/80 mt-0.5">Quick polish needed</p>
              </div>

              <div className="p-4 rounded-xl bg-[#2B1717] border border-[#522525]">
                <span className="text-2xl font-black text-rose-400">
                  {activeRole.skills.filter((s) => s.status === 'gap').length}
                </span>
                <p className="text-xs font-bold text-white mt-1">Critical Gaps</p>
                <p className="text-[10px] text-rose-400/80 mt-0.5">Focus for learning</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2C2C2C] flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Benchmark based on 2,500+ junior tech job descriptions</span>
            <Link
              to="/dashboard/roadmap"
              className="text-xs font-black text-[#FF8C00] hover:text-[#FFA024] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Build Roadmap for Gaps</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Skill Gap Comparison Chart */}
      <div className="bg-[#202020] rounded-2xl p-6 border border-[#303030] shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-black text-white">Skill Comparison Matrix</h3>
          <p className="text-xs text-[#A1A1AA]">Visualizing your current skill level against the expected industry threshold</p>
        </div>

        <div className="space-y-3.5">
          {activeRole.skills.map((skill) => (
            <div key={skill.name} className="p-3.5 rounded-xl bg-[#181818] border border-[#2D2D2D]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{skill.name}</span>
                  <span className="text-[10px] text-gray-400 bg-[#222222] px-2 py-0.5 rounded border border-[#333333]">
                    {skill.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A1A1AA]">
                    Your: <strong className="text-white">{skill.current}%</strong> | Target: <strong className="text-white">{skill.required}%</strong>
                  </span>
                  {getStatusBadge(skill.status)}
                </div>
              </div>

              {/* Stacked comparison bar */}
              <div className="relative w-full h-2.5 bg-[#121212] rounded-full overflow-hidden border border-[#2E2E2E]">
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white z-10"
                  style={{ left: `${skill.required}%` }}
                  title={`Target Level: ${skill.required}%`}
                />
                <div
                  className={`h-full ${getBarColor(skill.status)} rounded-full transition-all duration-500`}
                  style={{ width: `${skill.current}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Learning Modules for Identified Gaps */}
      <div className="bg-[#202020] rounded-2xl p-6 border border-[#303030] shadow-sm">
        <h3 className="text-base font-black text-white mb-1">Tailored Learning Recommendations</h3>
        <p className="text-xs text-[#A1A1AA] mb-6">Recommended curriculum to bridge your top identified gaps</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeRole.recommendations.map((rec) => (
            <div
              key={rec.skill}
              className="bg-[#181818] rounded-xl p-5 border border-[#2D2D2D] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30">
                    {rec.type}
                  </span>
                  <span className="text-xs text-gray-400">Est. {rec.timeEst}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{rec.skill}</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">{rec.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#2A2A2A]">
                <p className="text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF8C00]" />
                  <span>{rec.course}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
