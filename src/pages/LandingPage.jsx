import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileSearch,
  Target,
  MessageSquare,
  Map,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Wand2,
  Terminal,
  Flame,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import SectionHeader from '../components/common/SectionHeader'
import CareerCard from '../components/common/CareerCard'
import FeatureCard from '../components/common/FeatureCard'
import { useAuth } from '../context/AuthContext'

// Carousel Slides
const FEATURED_SLIDES = [
  {
    id: 1,
    tag: 'FEATURED AI TOOL',
    title: 'AI Resume Analyzer',
    subtitle: 'Extract text via PyMuPDF, verify against 150+ canonical skill aliases, and get transparent weighted ATS match scores.',
    link: '/dashboard/resume-analysis',
    buttonText: 'Analyze My CV',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    tag: 'LIVE SIMULATION',
    title: 'AI Mock Technical Interviews',
    subtitle: 'Practice real-time technical questions that specifically probe your actual CV projects and detected skill gaps with multi-dimensional scoring.',
    link: '/dashboard/mock-interview',
    buttonText: 'Start Mock Interview',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 3,
    tag: 'CAREER BENCHMARKS',
    title: 'Discover Your Career Path',
    subtitle: 'Explore 10 entry-level engineering benchmarks. Uncover required skills, salary tiers, and curated capstone project recommendations.',
    link: '/explore-careers',
    buttonText: 'Explore 10 Roles',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 4,
    tag: 'STEP-BY-STEP MASTERY',
    title: 'Personalized Learning Roadmap',
    subtitle: 'Follow weekly milestone curriculums (4, 8, or 12 weeks) with verified official documentation links and re-upload your revised CV to verify growth.',
    link: '/dashboard/roadmap',
    buttonText: 'View My Roadmap',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
  },
]

// 6 Quick Feature Cards
const QUICK_FEATURES = [
  {
    icon: FileSearch,
    title: 'Resume Analysis',
    description: 'Instant PyMuPDF & docx extraction with exact, canonical, and evidence matching.',
    category: 'Analysis',
    link: '/dashboard/resume-analysis',
    buttonText: 'Analyze Resume',
  },
  {
    icon: Target,
    title: 'Skill Gap Checker',
    description: 'Compare current verified skills against industry benchmarks for your dream job role.',
    category: 'Benchmark',
    link: '/dashboard/skill-gap',
    buttonText: 'Audit Skills',
  },
  {
    icon: MessageSquare,
    title: 'AI Mock Interview',
    description: 'Real-time text & voice simulations with rubric scoring and dynamic follow-up questions.',
    category: 'Practice',
    link: '/dashboard/mock-interview',
    buttonText: 'Start Interview',
  },
  {
    icon: Map,
    title: 'Career Roadmap',
    description: 'Adaptive 4, 8, or 12-week milestones with verified official documentation and exercises.',
    category: 'Curriculum',
    link: '/dashboard/roadmap',
    buttonText: 'Build Roadmap',
  },
  {
    icon: FileCheck,
    title: 'ATS Resume Checker',
    description: 'Verify keyword density, single-column formatting, and detect scanned/unreadable PDFs.',
    category: 'Audit',
    link: '/dashboard/upload-resume',
    buttonText: 'Check Resume',
  },
  {
    icon: Wand2,
    title: 'CV Re-Upload & Diff',
    description: 'Upload revised CVs to calculate score improvements and automatically close roadmap gaps.',
    category: 'Progress',
    link: '/dashboard/roadmap',
    buttonText: 'Compare Score',
  },
]

// Trending Career Roles
const TRENDING_ROLES = [
  { slug: 'data-scientist', title: 'Data Scientist', category: 'Data & AI', skillsCount: 9, difficulty: 'Entry Level' },
  { slug: 'machine-learning-engineer', title: 'Machine Learning Engineer', category: 'AI & MLOps', skillsCount: 9, difficulty: 'Entry Level' },
  { slug: 'full-stack-developer', title: 'Full Stack Developer', category: 'Web & Cloud', skillsCount: 10, difficulty: 'Entry Level' },
  { slug: 'software-developer', title: 'Software Engineer', category: 'Engineering', skillsCount: 8, difficulty: 'Entry Level' },
  { slug: 'data-analyst', title: 'Data Analyst', category: 'Analytics', skillsCount: 7, difficulty: 'Entry Level' },
  { slug: 'java-developer', title: 'Java Developer', category: 'Enterprise', skillsCount: 8, difficulty: 'Entry Level' },
  { slug: 'python-developer', title: 'Python Developer', category: 'Backend', skillsCount: 8, difficulty: 'Entry Level' },
  { slug: 'cloud-engineer', title: 'Cloud Engineer', category: 'DevOps & Cloud', skillsCount: 8, difficulty: 'Entry Level' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto rotate carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length)

  const activeSlide = FEATURED_SLIDES[currentSlide]

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 w-full space-y-12">
        {/* =========================================================================
            SECTION 1: FEATURED HERO BANNER WITH CAROUSEL (Manhwa18 Banner Style)
           ========================================================================= */}
        <section className="relative rounded-2xl overflow-hidden border border-[#2E2E2E] bg-[#1A1A1A] shadow-2xl">
          {/* Main Hero Header */}
          <div className="p-6 sm:p-10 lg:p-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8C00]/15 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>AI-Powered Career Discovery</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Your Future. <br />
                <span className="text-[#FF8C00] drop-shadow-[0_0_25px_rgba(255,140,0,0.35)]">
                  Powered by AI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#A1A1AA] max-w-xl leading-relaxed">
                Analyze your resume, discover missing skills, and prepare for your dream career with explainable NLP
                benchmarks, adaptive roadmaps, and real-time AI mock interviews.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={user ? '/dashboard/resume-analysis' : '/login'}
                  className="px-6 py-3 bg-[#FF8C00] hover:bg-[#FFA024] text-black text-xs font-black rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,140,0,0.4)] transition-all hover:scale-102"
                >
                  <FileSearch className="w-4 h-4 font-black" />
                  <span>Analyze My Resume</span>
                </Link>

                <Link
                  to={user ? '/dashboard/mock-interview' : '/login'}
                  className="px-6 py-3 bg-[#242424] hover:bg-[#2C2C2C] border border-[#383838] hover:border-[#FF8C00]/40 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Terminal className="w-4 h-4 text-[#FF8C00]" />
                  <span>Start Mock Interview</span>
                </Link>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 10 Curated Roles
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Private Supabase Storage
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sentence Transformers
                </span>
              </div>
            </div>

            {/* Right Column: Featured Interactive Carousel Slide */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden border border-[#303030] shadow-xl group">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FF8C00] text-black inline-block">
                    {activeSlide.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">{activeSlide.title}</h3>
                  <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{activeSlide.subtitle}</p>

                  <div className="pt-1">
                    <Link
                      to={user ? activeSlide.link : '/login'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8C00] hover:underline"
                    >
                      <span>{activeSlide.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-[#FF8C00] text-white hover:text-black flex items-center justify-center transition-colors border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-[#FF8C00] text-white hover:text-black flex items-center justify-center transition-colors border border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {FEATURED_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentSlide === idx ? 'w-6 bg-[#FF8C00]' : 'w-2 bg-[#333333] hover:bg-[#555555]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: QUICK FEATURE CARDS (Compact, Organized, Manhwa18 Style)
           ========================================================================= */}
        <section className="space-y-4">
          <SectionHeader
            badge="AI Tool Suite"
            title="Accelerate Your Career Readiness"
            subtitle="Explore our modular suite of resume audit, interview simulation, and curriculum planning tools."
            icon={Zap}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_FEATURES.map((item, idx) => (
              <FeatureCard
                key={idx}
                icon={item.icon}
                title={item.title}
                description={item.description}
                category={item.category}
                link={user ? item.link : '/login'}
                buttonText={item.buttonText}
              />
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: TRENDING CAREER ROLES (Thumbnail Grid, 4-5 cards per row)
           ========================================================================= */}
        <section className="space-y-4">
          <SectionHeader
            badge="Top Industry Careers"
            title="Trending Entry-Level Roles"
            subtitle="Explore high-demand career pathways benchmarked against real industry job descriptions."
            action={
              <Link
                to={user ? '/dashboard/explore-careers' : '/explore-careers'}
                className="text-xs font-bold text-[#FF8C00] hover:underline flex items-center gap-1"
              >
                <span>View All Careers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            icon={Compass}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {TRENDING_ROLES.map((role) => (
              <CareerCard
                key={role.slug}
                slug={role.slug}
                title={role.title}
                category={role.category}
                skillsCount={role.skillsCount}
                difficulty={role.difficulty}
              />
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: LATEST ACTIVITY (For Authenticated Students)
           ========================================================================= */}
        {user ? (
          <section className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF8C00]" />
                <span>Your Recent Career Activity</span>
              </h3>
              <Link to="/dashboard" className="text-xs font-bold text-[#FF8C00] hover:underline flex items-center gap-1">
                Go to Full Dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                to="/dashboard/resume-analysis"
                className="bg-[#202020] border border-[#303030] hover:border-[#FF8C00]/50 rounded-xl p-3.5 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FF8C00]/15 text-[#FF8C00] flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Resume Analysis Ready</span>
                  <span className="text-[11px] text-gray-400 block truncate">Inspect matched skills & evidence</span>
                </div>
              </Link>

              <Link
                to="/dashboard/mock-interview"
                className="bg-[#202020] border border-[#303030] hover:border-[#FF8C00]/50 rounded-xl p-3.5 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FF8C00]/15 text-[#FF8C00] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Mock Interview Studio</span>
                  <span className="text-[11px] text-gray-400 block truncate">Practice 5, 10 or 15 questions</span>
                </div>
              </Link>

              <Link
                to="/dashboard/roadmap"
                className="bg-[#202020] border border-[#303030] hover:border-[#FF8C00]/50 rounded-xl p-3.5 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FF8C00]/15 text-[#FF8C00] flex items-center justify-center shrink-0">
                  <Map className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">Active Learning Milestones</span>
                  <span className="text-[11px] text-gray-400 block truncate">Check weekly progress & docs</span>
                </div>
              </Link>
            </div>
          </section>
        ) : (
          /* Unauthenticated CTA Banner */
          <section className="bg-gradient-to-r from-[#1A1A1A] via-[#202020] to-[#2B1B0F] border border-[#333333] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#FF8C00] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Start for Free
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Ready to find out your true career match score?
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl">
                Create a student profile to save your parsed CVs, track weekly roadmap milestones, and practice
                real-time mock technical interviews.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/register"
                className="px-6 py-3 bg-[#FF8C00] hover:bg-[#FFA024] text-black text-xs font-extrabold rounded-xl shadow-[0_0_15px_rgba(255,140,0,0.35)] transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-4 py-3 bg-[#262626] hover:bg-[#303030] border border-[#383838] text-white text-xs font-bold rounded-xl transition-all"
              >
                Sign In
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
