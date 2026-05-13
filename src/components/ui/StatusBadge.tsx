import type { MaterialStatus, PriceRange } from '@/types/material'
import { PRICE_RANGE_LABELS, STATUS_LABELS } from '@/types/material'

const STATUS_STYLES: Record<MaterialStatus, string> = {
  public: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  negotiating: 'bg-amber-50 text-amber-700 border-amber-300',
  checking: 'bg-sky-50 text-sky-700 border-sky-200',
  low_stock: 'bg-red-50 text-red-700 border-red-200',
  private: 'bg-stone-100 text-stone-500 border-stone-200',
}

const PRICE_STYLES: Record<PriceRange, string> = {
  undecided: 'bg-stone-100 text-stone-600 border-stone-200',
  consult: 'bg-stone-100 text-stone-600 border-stone-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  mid: 'bg-sky-50 text-sky-700 border-sky-200',
  high: 'bg-violet-50 text-violet-700 border-violet-200',
  premium: 'bg-amber-50 text-amber-700 border-amber-300',
}

export function StatusBadge({ status, className = '' }: { status: MaterialStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] tracking-wider ${STATUS_STYLES[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriceBadge({ priceRange, className = '' }: { priceRange: PriceRange; className?: string }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] tracking-wider ${PRICE_STYLES[priceRange]} ${className}`}>
      価格帯: {PRICE_RANGE_LABELS[priceRange]}
    </span>
  )
}

export function VerifiedBadge({ type, label }: { type: 'verified' | 'pending' | 'estimated'; label?: string }) {
  const config = {
    verified: { text: '確認済み', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { text: '確認中', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    estimated: { text: '推定', style: 'bg-stone-100 text-stone-600 border-stone-200' },
  }[type]

  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[9px] tracking-wider ${config.style}`}>
      {config.text}
      {label ? ` / ${label}` : ''}
    </span>
  )
}
