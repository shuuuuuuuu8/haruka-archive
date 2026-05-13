'use client'

import { CheckCircle, Flame, AlertTriangle, Star, Building2 } from 'lucide-react'

type BadgeVariant = 'auth' | 'sdgs' | 'rare' | 'hot' | 'status' | 'negotiating' | 'seasonal'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  className?: string
}

const configs: Record<BadgeVariant, { icon?: React.ReactNode; style: string; defaultLabel: string }> = {
  auth: {
    icon: <CheckCircle size={11} />,
    style: 'bg-amber-50 text-amber-700 border border-amber-300',
    defaultLabel: 'AUTHENTICATED ORIGIN',
  },
  sdgs: {
    style: 'bg-green-50 text-green-700 border border-green-300',
    defaultLabel: 'SDGs',
  },
  rare: {
    icon: <Star size={11} fill="currentColor" />,
    style: 'bg-red-50 text-red-700 border border-red-300',
    defaultLabel: '残りわずか',
  },
  hot: {
    icon: <Flame size={11} />,
    style: 'bg-orange-50 text-orange-700 border border-orange-300',
    defaultLabel: '今シーズン最多問い合わせ',
  },
  status: {
    style: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    defaultLabel: '在庫あり',
  },
  negotiating: {
    icon: <AlertTriangle size={11} />,
    style: 'bg-red-50 text-red-800 border border-red-400',
    defaultLabel: '他社が検討中',
  },
  seasonal: {
    icon: <Building2 size={11} />,
    style: 'bg-stone-100 text-stone-600 border border-stone-300',
    defaultLabel: '機関向け',
  },
}

export default function Badge({ variant, label, className = '' }: BadgeProps) {
  const { icon, style, defaultLabel } = configs[variant]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium tracking-widest uppercase ${style} ${className}`}
    >
      {icon}
      {label ?? defaultLabel}
    </span>
  )
}
