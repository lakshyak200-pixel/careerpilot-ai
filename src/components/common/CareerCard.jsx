import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, CheckCircle2, Layers } from 'lucide-react'

// Curated thumbnail images for tech roles
const ROLE_THUMBNAILS = {
  'data-scientist': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  'machine-learning-engineer': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'full-stack-developer': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  'software-developer': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  'software-engineer': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  'data-analyst': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  'java-developer': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
  'python-developer': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  'cloud-engineer': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  'frontend-developer': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  'backend-developer': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
}

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'

export default function CareerCard({
  slug = 'full-stack-developer',
  title = 'Full Stack Developer',
  category = 'Engineering',
  skillsCount = 8,
  difficulty = 'Entry Level',
  matchScore = null,
  onSelect = null,
}) {
  const thumbnail = ROLE_THUMBNAILS[slug] || DEFAULT_THUMBNAIL

  const cardContent = (
    <div className="group relative bg-[#202020] border border-[#303030] hover:border-[#FF8C00]/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_4px_24px_rgba(255,140,0,0.14)] hover:-translate-y-1 flex flex-col h-full">
      {/* Thumbnail Aspect Ratio Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#161616]">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#202020] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
            {difficulty}
          </span>
          {matchScore !== null ? (
            <span className="px-2 py-0.5 rounded-md bg-[#FF8C00] text-black text-[11px] font-black tracking-tight shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {matchScore}% Match
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-semibold text-gray-300 border border-white/10">
              {category}
            </span>
          )}
        </div>

        {/* Skills count pill floating at bottom of thumbnail */}
        <div className="absolute bottom-2 left-2.5 text-[11px] font-semibold text-gray-300 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
          <Layers className="w-3 h-3 text-[#FF8C00]" />
          <span>{skillsCount} Skills</span>
        </div>
      </div>

      {/* Card Info Body */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF8C00] transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5 line-clamp-1">{category}</p>
        </div>

        <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#FF8C00] group-hover:underline flex items-center gap-1">
            View Career <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  )

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(slug)} className="text-left w-full h-full">
        {cardContent}
      </button>
    )
  }

  return (
    <Link to={`/dashboard/resume-analysis?role=${slug}`} className="block h-full">
      {cardContent}
    </Link>
  )
}

