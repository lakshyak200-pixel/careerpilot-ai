import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom'
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Terminal,
  FileSearch,
  CheckCircle2,
  X,
  Target,
  Award,
  Zap,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CareerCard from '../components/common/CareerCard'
import SectionHeader from '../components/common/SectionHeader'
import SearchBar from '../components/common/SearchBar'
import { useAuth } from '../context/AuthContext'

const CAREER_CATEGORIES = [
  'All Roles',
  'Software Development',
  'Artificial Intelligence',
  'Data Science',
  'Web Development',
  'Cloud Computing',
]

const ALL_ROLES_DATA = [
  {
    slug: 'software-developer',
    title: 'Software Developer',
    category: 'Software Development',
    skillsCount: 8,
    difficulty: 'Entry Level',
    salaryRange: '$75k - $105k',
    description: 'Designs, writes, tests, and debugs scalable software applications across system architectures.',
    requiredSkills: ['Python or Java', 'Data Structures & Algorithms', 'OOP Design', 'SQL', 'Git', 'RESTful APIs'],
    preferredSkills: ['Docker', 'Linux/Bash', 'Unit Testing', 'CI/CD Pipelines'],
    projects: ['Distributed Task Queue with Redis', 'E-Commerce Backend REST Service'],
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Web Development',
    skillsCount: 10,
    difficulty: 'Entry Level',
    salaryRange: '$80k - $115k',
    description: 'Bridges responsive web client interfaces with robust server-side APIs, business logic, and databases.',
    requiredSkills: ['JavaScript (ES6+)', 'React.js', 'Node.js', 'HTML5 & CSS3', 'PostgreSQL', 'RESTful APIs', 'Git'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Docker', 'MongoDB', 'Next.js'],
    projects: ['Full-Stack Collaborative Workspace (React + FastAPI + PostgreSQL)', 'Real-time Analytics Dashboard'],
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data Science',
    skillsCount: 9,
    difficulty: 'Entry Level',
    salaryRange: '$85k - $120k',
    description: 'Applies statistical modeling, exploratory data analysis, and predictive machine learning models to solve business challenges.',
    requiredSkills: ['Python', 'Pandas & NumPy', 'Scikit-Learn', 'SQL Queries', 'Statistical Analysis', 'Data Visualization'],
    preferredSkills: ['Jupyter Notebooks', 'Feature Engineering', 'Seaborn/Plotly', 'PyTorch Basics'],
    projects: ['Customer Churn Prediction Engine', 'Exploratory Housing Market Analysis'],
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    skillsCount: 9,
    difficulty: 'Entry Level',
    salaryRange: '$90k - $130k',
    description: 'Constructs production ML pipelines, feature stores, neural network architectures, and real-time model inference servers.',
    requiredSkills: ['Python 3', 'Scikit-Learn', 'PyTorch or TensorFlow', 'Pandas & NumPy', 'RESTful Model APIs', 'Git'],
    preferredSkills: ['Docker Containerization', 'HuggingFace Transformers', 'MLflow / WandB', 'FastAPI'],
    projects: ['Real-time NLP Sentiment Inference API', 'Computer Vision Object Detection Pipeline'],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data Science',
    skillsCount: 7,
    difficulty: 'Entry Level',
    salaryRange: '$68k - $95k',
    description: 'Transforms structured and unstructured business datasets into actionable operational dashboards and insights.',
    requiredSkills: ['SQL (Aggregates & Joins)', 'Python', 'Pandas', 'Microsoft Excel (Pivots)', 'Data Visualization'],
    preferredSkills: ['Power BI', 'Tableau Desktop', 'NumPy', 'Statistical Hypothesis Testing'],
    projects: ['Executive Revenue Cohort BI Dashboard', 'Customer Retention SQL Audit'],
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Web Development',
    skillsCount: 8,
    difficulty: 'Entry Level',
    salaryRange: '$75k - $105k',
    description: 'Builds responsive, high-performance, accessible, and user-friendly web client applications using modern JS frameworks.',
    requiredSkills: ['JavaScript (ES6+)', 'React.js', 'HTML5 & CSS3', 'Responsive Design', 'REST API Integration', 'Git'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Redux/Zustand', 'Next.js', 'Lighthouse Web Vitals'],
    projects: ['Component Library Design System', 'Responsive SaaS Platform Dashboard'],
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Software Development',
    skillsCount: 9,
    difficulty: 'Entry Level',
    salaryRange: '$80k - $115k',
    description: 'Architects server-side logic, database queries, authentication pipelines, and high-throughput REST/GraphQL APIs.',
    requiredSkills: ['Python or Node.js', 'SQL', 'RESTful APIs', 'PostgreSQL', 'JWT Authentication', 'Git'],
    preferredSkills: ['Docker', 'FastAPI / Express.js', 'Redis Caching', 'Linux / Bash', 'Microservices'],
    projects: ['High-Throughput Authentication Microservice', 'Database Indexing & Query Optimizer'],
  },
  {
    slug: 'python-developer',
    title: 'Python Developer',
    category: 'Software Development',
    skillsCount: 8,
    difficulty: 'Entry Level',
    salaryRange: '$78k - $110k',
    description: 'Specializes in building Python-based web services, asynchronous microservices, data parsers, and automation scripts.',
    requiredSkills: ['Python 3', 'FastAPI or Django', 'SQL', 'REST APIs', 'OOP Design', 'Git'],
    preferredSkills: ['PostgreSQL', 'SQLAlchemy ORM', 'Pytest', 'Docker', 'Redis'],
    projects: ['Automated Web Scraper & Data Pipeline', 'Async Microservice with Celery Tasks'],
  },
  {
    slug: 'java-developer',
    title: 'Java Developer',
    category: 'Software Development',
    skillsCount: 8,
    difficulty: 'Entry Level',
    salaryRange: '$80k - $112k',
    description: 'Constructs enterprise web applications, distributed microservices, and reliable multithreaded systems with Java.',
    requiredSkills: ['Java (8/11/17)', 'OOP & Design Patterns', 'Spring Boot', 'SQL', 'RESTful APIs', 'Git'],
    preferredSkills: ['Hibernate / JPA', 'Maven / Gradle', 'JUnit & Mockito', 'Docker', 'Microservices'],
    projects: ['Enterprise Banking REST Microservice', 'Spring Boot User Authentication Service'],
  },
  {
    slug: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Cloud Computing',
    skillsCount: 8,
    difficulty: 'Entry Level',
    salaryRange: '$85k - $125k',
    description: 'Deploys, monitors, and optimizes cloud computing infrastructure, containerized workloads, and CI/CD automation pipelines.',
    requiredSkills: ['Linux & Bash Scripting', 'Docker Containers', 'AWS or GCP or Azure', 'Python Scripting', 'Networking (TCP/IP, DNS)', 'Git'],
    preferredSkills: ['Kubernetes', 'GitHub Actions / CI-CD', 'Terraform (IaC)', 'IAM Security'],
    projects: ['Multi-Container Docker Deployment on AWS EC2', 'Automated Terraform Infrastructure Blueprint'],
  },
]

export default function ExploreCareersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const isInsideDashboard = location.pathname.startsWith('/dashboard')

  // If user is authenticated and visits the public /explore-careers route, redirect into the unified dashboard layout
  if (user && !isInsideDashboard) {
    return <Navigate to={`/dashboard/explore-careers${location.search}`} replace />
  }

  const queryParam = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [selectedCategory, setSelectedCategory] = useState('All Roles')
  const [sortBy, setSortBy] = useState('popular') // 'popular' | 'skills' | 'title'
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null)

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q)
    }
  }, [searchParams])

  // Filter & Sort Logic
  const filteredRoles = useMemo(() => {
    return ALL_ROLES_DATA.filter((role) => {
      const matchesCategory =
        selectedCategory === 'All Roles' || role.category === selectedCategory
      const matchesSearch =
        !searchQuery.trim() ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    }).sort((a, b) => {
      if (sortBy === 'skills') return b.skillsCount - a.skillsCount
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return 0 // default catalog order
    })
  }, [searchQuery, selectedCategory, sortBy])

  const renderModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#2C2C2C] pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#FF8C00] tracking-wider">
              {selectedRoleDetail.category} • {selectedRoleDetail.difficulty}
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">{selectedRoleDetail.title}</h3>
            <span className="text-xs text-gray-400 font-mono mt-0.5 block">
              Typical Market Benchmark: {selectedRoleDetail.salaryRange}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRoleDetail(null)}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">{selectedRoleDetail.description}</p>

        {/* Required Skills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Required Core Skills:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedRoleDetail.requiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#262626] border border-[#3A3A3A] text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#FF8C00]" /> Preferred / Bonus Skills:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedRoleDetail.preferredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Projects */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-400" /> Recommended Capstone Projects:
          </span>
          <ul className="text-xs text-gray-300 list-disc list-inside space-y-1 bg-[#161616] p-3 rounded-xl border border-[#2A2A2A]">
            {selectedRoleDetail.projects.map((proj, idx) => (
              <li key={idx} className="leading-relaxed font-medium">
                {proj}
              </li>
            ))}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedRoleDetail(null)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
          >
            Close
          </button>
          <Link
            to={`/dashboard/resume-analysis?role=${selectedRoleDetail.slug}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FF8C00] hover:bg-[#FFA024] text-black text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,140,0,0.35)] transition-colors cursor-pointer"
          >
            <FileSearch className="w-4 h-4" /> Analyze Resume for This Role
          </Link>
          <Link
            to={`/dashboard/mock-interview?role=${encodeURIComponent(selectedRoleDetail.title)}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#262626] hover:bg-[#303030] border border-[#3A3A3A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-[#FF8C00]" /> Practice Mock Interview
          </Link>
        </div>
      </div>
    </div>
  )

  const mainContent = (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-r from-[#1A1A1A] via-[#1E1E1E] to-[#241B10] border border-[#2E2E2E] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF8C00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Career Role Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Entry-Level Tech Careers
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Discover industry-benchmarked entry-level job roles. Inspect required skill sets, explore recommended
            hands-on capstone projects, and run real-time AI resume audits.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="w-full md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search job roles or skills (e.g. Python, Docker)..."
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <span className="text-gray-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#FF8C00]" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#121212] border border-[#303030] text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#FF8C00] cursor-pointer"
            >
              <option value="popular">Recommended</option>
              <option value="skills">Skills Count</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CAREER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF8C00] text-black shadow-[0_0_12px_rgba(255,140,0,0.35)]'
                  : 'bg-[#222222] text-[#D4D4D8] hover:bg-[#2A2A2A] hover:text-white border border-[#2F2F2F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#FF8C00] rounded-full inline-block" />
            <span>
              Showing {filteredRoles.length} {selectedCategory === 'All Roles' ? 'Roles' : `${selectedCategory} Roles`}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredRoles.map((role) => (
            <CareerCard
              key={role.slug}
              slug={role.slug}
              title={role.title}
              category={role.category}
              skillsCount={role.skillsCount}
              difficulty={role.difficulty}
              onSelect={(slug) => {
                const match = ALL_ROLES_DATA.find((r) => r.slug === slug)
                setSelectedRoleDetail(match || null)
              }}
            />
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-16 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-8 space-y-2">
            <p className="text-sm font-bold text-white">No career roles matched "{searchQuery}"</p>
            <p className="text-xs text-gray-400">Try searching for generic terms like Developer, Data, or Cloud.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All Roles')
              }}
              className="mt-3 px-4 py-2 bg-[#FF8C00] text-black text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (isInsideDashboard) {
    return (
      <>
        {mainContent}
        {selectedRoleDetail && renderModal()}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
        {mainContent}
      </main>
      {selectedRoleDetail && renderModal()}
      <Footer />
    </div>
  )
}

