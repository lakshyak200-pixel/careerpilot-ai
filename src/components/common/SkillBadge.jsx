import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export default function SkillBadge({
  name,
  status = 'matched', // 'matched' | 'missing' | 'preferred' | 'in_progress'
  matchType = null,
  onClick = null,
}) {
  const getStyle = () => {
    switch (status) {
      case 'matched':
        return 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-500'
      case 'missing':
        return 'bg-red-950/40 border-red-500/40 text-red-300 hover:border-red-500'
      case 'preferred':
        return 'bg-[#FF8C00]/10 border-[#FF8C00]/30 text-[#FF8C00] hover:border-[#FF8C00]'
      case 'in_progress':
        return 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-500'
      default:
        return 'bg-[#262626] border-[#383838] text-gray-300'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'matched':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      case 'missing':
        return <XCircle className="w-3.5 h-3.5 text-red-400" />
      default:
        return null
    }
  }

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${getStyle()} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {getIcon()}
      <span>{name}</span>
      {matchType && (
        <span className="text-[10px] opacity-70 font-mono lowercase">[{matchType}]</span>
      )}
    </Tag>
  )
}

