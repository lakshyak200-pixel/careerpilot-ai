export default function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  showPercentage = true,
  height = 'h-2',
  color = 'bg-[#FF8C00]',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-gray-300">{label}</span>}
          {showPercentage && <span className="font-bold text-white font-mono">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full ${height} bg-[#141414] border border-[#2A2A2A] rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

