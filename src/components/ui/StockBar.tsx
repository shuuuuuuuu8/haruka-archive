'use client'

interface StockBarProps {
  current: number
  max: number
  showLabel?: boolean
  className?: string
}

export default function StockBar({ current, max, showLabel = true, className = '' }: StockBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const isLow = pct <= 30

  const barColor = isLow
    ? 'bg-red-500'
    : pct <= 60
    ? 'bg-amber-500'
    : 'bg-emerald-600'

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] tracking-wider">
          <span style={{ color: 'var(--text-muted)' }}>在庫</span>
          <span
            className={`font-medium ${isLow ? 'text-red-600' : ''}`}
            style={!isLow ? { color: 'var(--text-muted)' } : undefined}
          >
            {current}m / {max}m
          </span>
        </div>
      )}
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isLow && (
        <p className="text-[10px] text-red-600 tracking-wider font-medium">
          ▲ 在庫残少 — 交渉開始を推奨
        </p>
      )}
    </div>
  )
}
