import { TrendingUp, ArrowUpRight } from 'lucide-react'

export default function StatsCard({
  icon: Icon,
  title,
  value,
  subtext,
  trend = null,
  highlight = false,
}) {
  return (
    <div
      className={`bg-[#202020] border rounded-xl p-4 sm:p-5 transition-all duration-200 hover:border-[#FF8C00]/40 ${
        highlight ? 'border-[#FF8C00]/50 shadow-[0_0_15px_rgba(255,140,0,0.08)]' : 'border-[#303030]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-[#FF8C00]">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</span>
        <h4 className="text-xs font-semibold text-gray-300 mt-0.5">{title}</h4>
        {subtext && <p className="text-[11px] text-[#A1A1AA] mt-1 line-clamp-1">{subtext}</p>}
      </div>
    </div>
  )
}

