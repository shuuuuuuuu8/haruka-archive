'use client'

import { X } from 'lucide-react'
import type { ColorGroup, Era, MaterialCategory, MaterialFilters, PriceRange, QuantitySize } from '@/types/material'
import { PRICE_RANGE_LABELS, QUANTITY_SIZE_LABELS } from '@/types/material'

const CATEGORIES: MaterialCategory[] = ['絹', '綿', '麻', '反物', '帯地', '和紙', '古布', '工芸素材', 'その他']
const COLORS: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '茶系', '緑系', '多色', 'その他']
const ERAS: Era[] = ['明治', '大正', '昭和', '平成', '現代', '不明']
const ORIGINS = ['京都', '徳島', '茨城', '福井', '石川']
const PRICE_RANGES: PriceRange[] = ['consult', 'low', 'mid', 'high', 'premium']
const QUANTITY_SIZES: QuantitySize[] = ['sample', 'single', 'small', 'medium', 'large']

function toggle<T>(arr: T[] | undefined, val: T): T[] {
  const current = arr ?? []
  return current.includes(val) ? current.filter((item) => item !== val) : [...current, val]
}

function CheckItem<T extends string>({ label, active, onToggle }: { label: T | string; active: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 py-1.5 text-left">
      <span
        className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center border"
        style={{ borderColor: active ? 'var(--accent)' : 'var(--border)', backgroundColor: active ? 'var(--accent)' : 'transparent' }}
      >
        {active && <span className="block h-1.5 w-1.5 bg-white" />}
      </span>
      <span className="text-xs" style={{ color: active ? 'var(--text)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-4" style={{ borderColor: 'var(--border)' }}>
      <p className="mb-2 text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div>{children}</div>
    </section>
  )
}

interface Props {
  filters: MaterialFilters
  onChange: (filters: MaterialFilters) => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarContent({ filters, onChange }: Pick<Props, 'filters' | 'onChange'>) {
  const hasFilters = Object.values(filters).some((value) => value !== undefined && (!Array.isArray(value) || value.length > 0))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
          FILTER
        </p>
        {hasFilters && (
          <button type="button" onClick={() => onChange({})} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--accent)' }}>
            <X size={12} />
            クリア
          </button>
        )}
      </div>
      <Section title="素材の種類">
        {CATEGORIES.map((category) => (
          <CheckItem key={category} label={category} active={!!filters.category?.includes(category)} onToggle={() => onChange({ ...filters, category: toggle(filters.category, category) })} />
        ))}
      </Section>
      <Section title="産地">
        {ORIGINS.map((origin) => (
          <CheckItem key={origin} label={origin} active={!!filters.origin?.includes(origin)} onToggle={() => onChange({ ...filters, origin: toggle(filters.origin, origin) })} />
        ))}
      </Section>
      <Section title="年代">
        {ERAS.map((era) => (
          <CheckItem key={era} label={era} active={!!filters.era?.includes(era)} onToggle={() => onChange({ ...filters, era: toggle(filters.era, era) })} />
        ))}
      </Section>
      <Section title="色">
        {COLORS.map((color) => (
          <CheckItem key={color} label={color} active={!!filters.color?.includes(color)} onToggle={() => onChange({ ...filters, color: toggle(filters.color, color) })} />
        ))}
      </Section>
      <Section title="数量">
        {QUANTITY_SIZES.map((size) => (
          <CheckItem key={size} label={QUANTITY_SIZE_LABELS[size]} active={!!filters.quantitySize?.includes(size)} onToggle={() => onChange({ ...filters, quantitySize: toggle(filters.quantitySize, size) })} />
        ))}
      </Section>
      <Section title="価格帯">
        {PRICE_RANGES.map((range) => (
          <CheckItem key={range} label={PRICE_RANGE_LABELS[range]} active={!!filters.priceRange?.includes(range)} onToggle={() => onChange({ ...filters, priceRange: toggle(filters.priceRange, range) })} />
        ))}
      </Section>
      <div className="pt-4">
        <CheckItem label="サンプル相談可のみ" active={!!filters.sampleAvailable} onToggle={() => onChange({ ...filters, sampleAvailable: filters.sampleAvailable ? undefined : true })} />
      </div>
    </div>
  )
}

export default function FilterSidebar({ filters, onChange, isMobileOpen, onMobileClose }: Props) {
  return (
    <>
      <aside className="hidden w-52 flex-shrink-0 self-start lg:sticky lg:top-24 lg:block">
        <SidebarContent filters={filters} onChange={onChange} />
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/30" onClick={onMobileClose} aria-label="閉じる" />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto border-t p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm">絞り込み</p>
              <button type="button" onClick={onMobileClose} aria-label="閉じる">
                <X size={20} />
              </button>
            </div>
            <SidebarContent filters={filters} onChange={onChange} />
          </div>
        </div>
      )}
    </>
  )
}
