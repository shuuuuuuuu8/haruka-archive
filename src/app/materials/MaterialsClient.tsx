'use client'

import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { ArrowLeft, ChevronDown, ClipboardCheck, LayoutGrid, Layers, List, MessageSquare, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import FilterSidebar from '@/components/materials/FilterSidebar'
import MaterialCard from '@/components/materials/MaterialCard'
import MaterialChat from '@/components/materials/MaterialChat'
import RequestForm from '@/components/materials/RequestForm'
import type { ColorGroup, Material, MaterialCategory, MaterialFilters } from '@/types/material'

const QUICK_CATEGORIES: MaterialCategory[] = ['着物', '帯', '反物']
const QUICK_MATERIAL_TYPES = ['絹', 'ポリエステル']
const QUICK_COLORS: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '緑系', '多色']
const SEARCH_FLOW = ['素材を探す', '候補を比較する', 'サンプル・ロットを相談する']

// カテゴリー選択画面の表示順（登録時の種類）と短い説明
const CATEGORY_ORDER: MaterialCategory[] = ['着物', '帯', '反物', '羽織', '袴', '小物', 'その他']
const CATEGORY_DESC: Partial<Record<MaterialCategory, string>> = {
  着物: '着物・きもの',
  帯: '帯・帯地',
  反物: '反物・生地',
  羽織: '羽織もの',
  袴: '袴',
  小物: '小物・装飾品',
  その他: 'その他の素材',
}

function toggle<T>(arr: T[] | undefined, val: T): T[] {
  const current = arr ?? []
  return current.includes(val) ? current.filter((item) => item !== val) : [...current, val]
}

// 絞り込み状態を URL クエリと相互変換し、検索結果を共有・ブックマーク・戻る操作できるようにする。
const ARRAY_FILTER_KEYS = ['category', 'materialType', 'origin', 'era', 'color', 'quantitySize', 'priceRange'] as const

function stateToSearch(filters: MaterialFilters, query: string): string {
  const params = new URLSearchParams()
  for (const key of ARRAY_FILTER_KEYS) {
    const vals = filters[key] as string[] | undefined
    if (vals && vals.length > 0) params.set(key, vals.join(','))
  }
  if (filters.sampleAvailable) params.set('sample', '1')
  if (query.trim()) params.set('q', query.trim())
  const s = params.toString()
  return s ? `?${s}` : ''
}

function searchToState(search: string): { filters: MaterialFilters; query: string; hasAny: boolean } {
  const params = new URLSearchParams(search)
  const filters: Record<string, unknown> = {}
  for (const key of ARRAY_FILTER_KEYS) {
    const raw = params.get(key)
    if (raw) {
      const vals = raw.split(',').filter(Boolean)
      if (vals.length > 0) filters[key] = vals
    }
  }
  if (params.get('sample') === '1') filters.sampleAvailable = true
  return { filters: filters as MaterialFilters, query: params.get('q') ?? '', hasAny: [...params.keys()].length > 0 }
}

// AI相談のフローティングボタン＋チャット本体（カテゴリ画面・一覧の両方に表示）
function ChatLauncher({ materials, open, onOpen, onClose }: { materials: Material[]; open: boolean; onOpen: () => void; onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="AIに相談して探す"
      >
        <Sparkles size={18} />
        <span className="hidden sm:inline">AIに相談</span>
      </button>
      <MaterialChat materials={materials} open={open} onClose={onClose} />
    </>
  )
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
  const [chatOpen, setChatOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  // カテゴリー選択画面 → 一覧 の2段階。最初はカテゴリー選択を表示する。
  const [entered, setEntered] = useState(false)
  // URLからの初期化が終わるまでURLへの書き戻しを止め、初期クエリの取りこぼしを防ぐ。
  const [hydrated, setHydrated] = useState(false)
  const hasFilters = Object.values(filters).some((value) => value !== undefined && (!Array.isArray(value) || value.length > 0))

  // 初期化：URLクエリ（?category=、?color= など）から絞り込み状態を復元する。
  useEffect(() => {
    const validCategories = new Set(initialMaterials.map((material) => material.category))
    const { filters: parsed, query: parsedQuery, hasAny } = searchToState(window.location.search)

    if (parsed.category) {
      parsed.category = parsed.category.filter((c) => validCategories.has(c as MaterialCategory)) as MaterialCategory[]
      if (parsed.category.length === 0) delete parsed.category
    }

    if (hasAny) {
      setFilters(parsed)
      setQuery(parsedQuery)
      setEntered(true)
    }
    setHydrated(true)
  }, [initialMaterials])

  // 書き戻し：絞り込み状態が変わるたびにURLを更新（履歴は積まずreplace）。
  useEffect(() => {
    if (!hydrated) return
    const url = entered ? `/materials${stateToSearch(filters, query)}` : '/materials'
    window.history.replaceState(null, '', url)
  }, [filters, query, entered, hydrated])

  // データに実在するカテゴリーだけを、代表画像・点数付きで集計する
  const categoryGroups = useMemo(() => {
    const map = new Map<MaterialCategory, { count: number; image: string }>()
    for (const material of initialMaterials) {
      const current = map.get(material.category)
      if (current) current.count += 1
      else map.set(material.category, { count: 1, image: material.images[0] })
    }
    return CATEGORY_ORDER.filter((category) => map.has(category)).map((category) => ({
      category,
      count: map.get(category)!.count,
      image: map.get(category)!.image,
    }))
  }, [initialMaterials])

  function enterCategory(category: MaterialCategory) {
    setQuery('')
    setFilters({ category: [category] })
    setEntered(true)
    window.scrollTo({ top: 0 })
  }

  function enterAll() {
    setQuery('')
    setFilters({})
    setEntered(true)
    window.scrollTo({ top: 0 })
  }

  function backToCategories() {
    setQuery('')
    setFilters({})
    setEntered(false)
    window.scrollTo({ top: 0 })
  }

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

  // ── カテゴリー選択画面（最初に表示） ──────────────────
  if (!entered) {
    return (
      <main style={{ backgroundColor: '#fbfaf7' }}>
        <section className="px-4 pb-10 pt-24 sm:px-6" style={{ backgroundColor: '#fffefa' }}>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
              MATERIAL ARCHIVE
            </p>
            <h1 className="font-serif text-3xl font-medium sm:text-4xl">種類から探す</h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              お探しの素材の種類をお選びください。
              <wbr />
              次の画面で、色や用途などからさらに絞り込めます。
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 border px-5 py-2.5 text-sm transition-colors hover:bg-white"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--bg-card)' }}
              >
                <Sparkles size={16} />
                AIに相談して探す
              </button>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {categoryGroups.map(({ category, count, image }) => (
              <button
                key={category}
                type="button"
                onClick={() => enterCategory(category)}
                className="group relative aspect-[4/3] overflow-hidden border text-left transition-transform hover:-translate-y-0.5"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.05) 100%)' }} />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                  <p className="font-serif text-lg font-medium sm:text-xl">{category}</p>
                  <p className="mt-0.5 text-[11px] opacity-80">{CATEGORY_DESC[category]}</p>
                  <p className="mt-1 text-[11px] tracking-[0.1em] opacity-90">{count}点</p>
                </div>
              </button>
            ))}

            {/* すべて見る */}
            <button
              type="button"
              onClick={enterAll}
              className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 border text-center transition-colors hover:bg-white"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <Layers size={26} style={{ color: 'var(--accent)' }} />
              <p className="font-serif text-lg font-medium" style={{ color: 'var(--text)' }}>すべての素材</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{initialMaterials.length}点を一覧で見る</p>
            </button>
          </div>
        </section>

        <ChatLauncher materials={initialMaterials} open={chatOpen} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)} />
      </main>
    )
  }

  // ── 素材一覧 ───────────────────────────────────────
  return (
    <main style={{ backgroundColor: '#fbfaf7' }}>
      {/* 素材登録CTA */}
      <div className="border-b px-4 pb-4 pt-20 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: '#fffefa' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="mr-2 font-medium" style={{ color: 'var(--text)' }}>素材をお持ちの方へ</span>
            着物・帯・反物などをプラットフォームに登録して、必要とする作り手へ届けましょう。
          </p>
          <a
            href="https://musubi-sozai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border px-5 py-2 text-xs transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            素材を登録する →
          </a>
        </div>
      </div>

      <section className="border-b px-4 pb-6 pt-8 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: '#fffefa' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <button
                type="button"
                onClick={backToCategories}
                className="mb-3 inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowLeft size={14} />
                種類を選びなおす
              </button>
              <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
                MATERIAL ARCHIVE
              </p>
              <h1 className="text-2xl font-medium sm:text-3xl">未活用素材を探す</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                未活用素材・デッドストック素材を、種類・色・用途・背景から探せます。購入ボタンは置かず、気になる素材を遙へ相談するための場です。
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
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs underline underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                >
                  <Sparkles size={13} />
                  探している素材をリクエスト
                </button>
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
              <div className="border py-16 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <p className="font-serif text-xl">該当する素材が見つかりませんでした</p>
                <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                  今はまだ無くても大丈夫です。<br className="sm:hidden" />
                  「探している素材」を教えていただければ、遙が提供元にあたり、入荷したらお知らせします。
                </p>
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Sparkles size={16} />
                  探している素材をリクエストする
                </button>
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

      <ChatLauncher materials={initialMaterials} open={chatOpen} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)} />
      <RequestForm open={requestOpen} defaultQuery={query} onClose={() => setRequestOpen(false)} />
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
