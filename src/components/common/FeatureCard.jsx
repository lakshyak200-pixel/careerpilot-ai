import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  category = 'Tool',
  link = '/dashboard',
  buttonText = 'Launch Tool',
}) {
  return (
    <div className="group bg-[#202020] border border-[#303030] hover:border-[#FF8C00]/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(255,140,0,0.1)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-[#FF8C00]/10 border border-[#FF8C00]/25 flex items-center justify-center text-[#FF8C00] group-hover:scale-110 group-hover:bg-[#FF8C00] group-hover:text-black transition-all">
            <Icon className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#181818] border border-[#2E2E2E] text-gray-400">
            {category}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#FF8C00] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-[#2A2A2A]">
        <Link
          to={link}
          className="text-xs font-bold text-white group-hover:text-[#FF8C00] flex items-center justify-between transition-colors"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

