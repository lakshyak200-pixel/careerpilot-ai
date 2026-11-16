import { Sparkles } from 'lucide-react'

export default function SectionHeader({
  badge,
  title,
  subtitle,
  action,
  icon: Icon = Sparkles,
  align = 'left',
}) {
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-col ${
        isCenter ? 'items-center text-center' : 'sm:flex-row sm:items-end justify-between'
      } gap-4 mb-6`}
    >
      <div className={isCenter ? 'max-w-2xl' : 'max-w-xl'}>
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00] text-xs font-bold uppercase tracking-wider mb-2">
            <Icon className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#FF8C00] rounded-full inline-block" />
          <span>{title}</span>
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

