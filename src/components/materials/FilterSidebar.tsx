'use client'

import { X } from 'lucide-react'
import type { ColorGroup, MaterialFilters, PriceRange, QuantitySize } from '@/types/material'
import { PRICE_RANGE_LABELS, QUANTITY_SIZE_LABELS } from '@/types/material'

const MATERIAL_TYPES = ['絹', 'ポリエステル']
const COLORS: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '茶系', '緑系', '多色', 'その他']
const PRICE_RANGES: PriceRange[] = ['consult']
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
        {MATERIAL_TYPES.map((materialType) => (
          <CheckItem key={materialType} label={materialType} active={!!filters.materialType?.includes(materialType)} onToggle={() => onChange({ ...filters, materialType: toggle(filters.materialType, materialType) })} />
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
