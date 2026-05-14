'use client'

import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'
import FilterSidebar from '@/components/materials/FilterSidebar'
import MaterialCard from '@/components/materials/MaterialCard'
import { MATERIALS } from '@/lib/data'
import type { Material, MaterialCategory, MaterialFilters } from '@/types/material'

export default function MaterialsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<MaterialFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get('category')
    const categories = new Set(MATERIALS.map((material) => material.category))

    if (category && categories.has(category as MaterialCategory)) {
      setFilters((current) => ({ ...current, category: [category as MaterialCategory] }))
    }
  }, [])

  const fuse = useMemo(
    () =>
      new Fuse(MATERIALS, {
        keys: ['name', 'story', 'origin', 'category', 'materialType', 'tags', 'supplier', 'recommendedUses'],
        threshold: 0.35,
      }),
    [],
  )

  const results = useMemo(() => {
    let data = query.trim() ? fuse.search(query).map((result) => result.item) : [...MATERIALS]

    if (filters.category?.length) data = data.filter((material) => filters.category!.includes(material.category))
    if (filters.origin?.length) data = data.filter((material) => filters.origin!.includes(material.origin))
    if (filters.era?.length) data = data.filter((material) => filters.era!.includes(material.era))
    if (filters.color?.length) data = data.filter((material) => filters.color!.includes(material.color))
    if (filters.quantitySize?.length) data = data.filter((material) => filters.quantitySize!.includes(material.quantitySize))
    if (filters.priceRange?.length) data = data.filter((material) => filters.priceRange!.includes(material.priceRange))
    if (filters.sampleAvailable) data = data.filter((material) => material.sampleAvailable)

    return data
  }, [filters, fuse, query])

  return (
    <main style={{ backgroundColor: 'var(--bg)' }}>
      <section className="border-b px-4 pb-8 pt-24 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
            MATERIAL ARCHIVE
          </p>
          <h1 className="text-3xl font-medium">素材を探す</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
            素材名、産地、年代、用途、背景ストーリーから検索できます。掲載在庫は変動するため、気になる素材は早めにご相談ください。
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例: 藍染、バッグ、京都、和紙..."
              className="w-full border bg-white py-3 pl-10 pr-4 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 border px-3 py-2 text-xs lg:hidden"
              style={{ borderColor: 'var(--border)' }}
            >
              <SlidersHorizontal size={14} />
              絞り込み
            </button>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {results.length}件
            </span>
          </div>
          <div className="flex border" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => setViewMode('grid')} className="p-2" style={{ backgroundColor: viewMode === 'grid' ? 'var(--accent-pale)' : 'transparent' }} aria-label="グリッド表示">
              <LayoutGrid size={15} />
            </button>
            <button type="button" onClick={() => setViewMode('list')} className="p-2" style={{ backgroundColor: viewMode === 'list' ? 'var(--accent-pale)' : 'transparent' }} aria-label="リスト表示">
              <List size={15} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <FilterSidebar filters={filters} onChange={setFilters} isMobileOpen={mobileFilterOpen} onMobileClose={() => setMobileFilterOpen(false)} />
          <section className="min-w-0 flex-1">
            {results.length === 0 ? (
              <div className="border py-20 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="font-serif text-xl">該当する素材が見つかりませんでした</p>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  条件を変えるか、用途から遙へご相談ください。
                </p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="divide-y border-y" style={{ borderColor: 'var(--border)' }}>
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
    <a href={`/materials/${material.id}`} className="grid gap-4 py-5 sm:grid-cols-[120px_1fr]">
      <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${material.images[0]})` }} />
      <div>
        <p className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
          {material.id} / {material.category}
        </p>
        <p className="mt-1 font-serif text-xl">{material.name}</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {material.origin} / {material.era} / {material.supplier}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
          {material.story}
        </p>
      </div>
    </a>
  )
}
