export function LoadingSkeleton({ count = 4, className = 'h-40' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${className} bg-[#1E1E1E] border border-[#2E2E2E] rounded-xl animate-pulse p-4 space-y-3`}
        >
          <div className="h-4 bg-[#2A2A2A] rounded w-3/4" />
          <div className="h-3 bg-[#2A2A2A] rounded w-1/2" />
          <div className="h-16 bg-[#252525] rounded w-full" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'Try adjusting your search filters or start a new activity.',
  action = null,
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/25 flex items-center justify-center text-[#FF8C00]">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-[#A1A1AA] leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

