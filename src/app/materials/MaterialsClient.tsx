'use client'

import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { ChevronDown, ClipboardCheck, LayoutGrid, List, MessageSquare, Search, SlidersHorizontal, X } from 'lucide-react'
import FilterSidebar from '@/components/materials/FilterSidebar'
import MaterialCard from '@/components/materials/MaterialCard'
import type { ColorGroup, Material, MaterialCategory, MaterialFilters } from '@/types/material'

const QUICK_CATEGORIES: MaterialCategory[] = ['厚手シルク', '薄手シルク']
const QUICK_MATERIAL_TYPES = ['絹', 'ポリエステル']
const QUICK_COLORS: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '緑系', '多色']
const SEARCH_FLOW = ['素材を探す', '候補を比較する', 'サンプル・ロットを相談する']

function toggle<T>(arr: T[] | undefined, val: T): T[] {
  const current = arr ?? []
  return current.includes(val) ? current.filter((item) => item !== val) : [...current, val]
}

function QuickChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border px-3 py-1.5 text-xs transition-colors"
      style={{
        borderColor: active ? 'var(--accent)' : 'var(--border)',
        backgroundColor: active ? 'var(--accent-pale)' : 'var(--bg-card)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  )
}

export default function MaterialsClient({ initialMaterials }: { initialMaterials: Material[] }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortMode, setSortMode] = useState<'newest' | 'id' | 'category'>('newest')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const hasFilters = Object.values(filters).some((value) => value !== undefined && (!Array.isArray(value) || value.length > 0))

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get('category')
    const categories = new Set(initialMaterials.map((material) => material.category))

    if (category && categories.has(category as MaterialCategory)) {
      setFilters((current) => ({ ...current, category: [category as MaterialCategory] }))
    }
  }, [initialMaterials])

  const fuse = useMemo(
    () =>
      new Fuse(initialMaterials, {
        keys: ['name', 'story', 'origin', 'category', 'materialType', 'tags', 'supplier', 'recommendedUses'],
        threshold: 0.35,
      }),
    [initialMaterials],
  )

  const results = useMemo(() => {
    let data = query.trim() ? fuse.search(query).map((result) => result.item) : [...initialMaterials]

    if (filters.category?.length) data = data.filter((material) => filters.category!.includes(material.category))
    if (filters.materialType?.length) {
      data = data.filter((material) =>
        filters.materialType!.some((type) => (type === '絹' ? material.materialType.includes('絹') : material.materialType === type)),
      )
    }
    if (filters.origin?.length) data = data.filter((material) => filters.origin!.includes(material.origin))
    if (filters.era?.length) data = data.filter((material) => filters.era!.includes(material.era))
    if (filters.color?.length) data = data.filter((material) => filters.color!.includes(material.color))
    if (filters.quantitySize?.length) data = data.filter((material) => filters.quantitySize!.includes(material.quantitySize))
    if (filters.priceRange?.length) data = data.filter((material) => filters.priceRange!.includes(material.priceRange))
    if (filters.sampleAvailable) data = data.filter((material) => material.sampleAvailable)

    return [...data].sort((a, b) => {
      if (sortMode === 'id') return a.id.localeCompare(b.id)
      if (sortMode === 'category') return a.category.localeCompare(b.category) || a.id.localeCompare(b.id)
      return b.id.localeCompare(a.id)
    })
  }, [filters, fuse, initialMaterials, query, sortMode])

  return (
    <main style={{ backgroundColor: '#fbfaf7' }}>
      <section className="border-b px-4 pb-6 pt-24 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: '#fffefa' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
                MATERIAL ARCHIVE
              </p>
              <h1 className="text-2xl font-medium sm:text-3xl">未活用素材を探す</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                未活用素材・デッドストック素材を、種類・色・用途・背景から探せます。購入ボタンは置かず、気になる素材を遙へ相談するための素材バンクです。
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" aria-label="検索をクリア" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              )}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例: 赤い帯、白い反物、バッグ、ポリエステル"
                className="w-full border bg-white py-4 pl-12 pr-10 text-base outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map((category) => (
              <QuickChip key={category} label={category} active={!!filters.category?.includes(category)} onClick={() => setFilters((current) => ({ ...current, category: toggle(current.category, category) }))} />
            ))}
            {QUICK_MATERIAL_TYPES.map((materialType) => (
              <QuickChip key={materialType} label={materialType} active={!!filters.materialType?.includes(materialType)} onClick={() => setFilters((current) => ({ ...current, materialType: toggle(current.materialType, materialType) }))} />
            ))}
            {QUICK_COLORS.map((color) => (
              <QuickChip key={color} label={color} active={!!filters.color?.includes(color)} onClick={() => setFilters((current) => ({ ...current, color: toggle(current.color, color) }))} />
            ))}
            {(query || hasFilters) && (
              <button type="button" onClick={() => { setQuery(''); setFilters({}) }} className="border px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                すべてクリア
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 border p-4 md:grid-cols-[1fr_auto]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {SEARCH_FLOW.map((item, index) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center border text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                    {index + 1}
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent)' }}>
              <ClipboardCheck size={14} />
              ECではなく、相談・マッチングの入口
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FilterSidebar filters={filters} onChange={setFilters} isMobileOpen={mobileFilterOpen} onMobileClose={() => setMobileFilterOpen(false)} />
          <section className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-2 border bg-white px-3 py-2 text-xs lg:hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <SlidersHorizontal size={14} />
                  絞り込み
                </button>
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  <span className="font-semibold">All Materials</span>
                  <span style={{ color: 'var(--text-muted)' }}> - {results.length} / {initialMaterials.length} items</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center">
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                    className="appearance-none border bg-white py-2 pl-3 pr-9 text-xs outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    aria-label="並び替え"
                  >
                    <option value="newest">新しい順</option>
                    <option value="id">ID順</option>
                    <option value="category">カテゴリ順</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2" size={14} style={{ color: 'var(--text-muted)' }} />
                </label>
                <div className="flex border bg-white" style={{ borderColor: 'var(--border)' }}>
                  <button type="button" onClick={() => setViewMode('grid')} className="p-2" style={{ backgroundColor: viewMode === 'grid' ? 'var(--accent-pale)' : 'transparent' }} aria-label="グリッド表示">
                    <LayoutGrid size={15} />
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} className="p-2" style={{ backgroundColor: viewMode === 'list' ? 'var(--accent-pale)' : 'transparent' }} aria-label="リスト表示">
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="border py-20 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="font-serif text-xl">該当する素材が見つかりませんでした</p>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  条件を変えるか、用途から遙へご相談ください。
                </p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="divide-y border-y bg-white" style={{ borderColor: 'var(--border)' }}>
                {results.map((material) => (
                  <ListItem key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function ListItem({ material }: { material: Material }) {
  return (
    <a href={`/materials/${material.id}`} className="grid gap-4 px-4 py-5 sm:grid-cols-[120px_1fr_auto]">
      <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${material.images[0]})` }} />
      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
          {material.id} / {material.category}
        </p>
        <p className="mt-1 font-serif text-xl">{material.name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[material.materialType, material.color, material.pattern, `${material.quantity}${material.quantityUnit}`, material.sampleAvailable ? 'サンプル相談可' : '要確認'].map((item) => (
            <span key={item} className="border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {item}
            </span>
          ))}
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
          {material.story}
        </p>
      </div>
      <div className="flex items-end justify-start sm:justify-end">
        <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
          <MessageSquare size={14} />
          相談へ
        </span>
      </div>
    </a>
  )
}
