import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllMaterials } from '@/lib/get-materials'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const materials = await getAllMaterials()
  return materials.map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const materials = await getAllMaterials()
  const m = materials.find((x) => x.id === id)
  if (!m) return { title: '素材が見つかりません', robots: { index: false, follow: false } }
  const title = `${m.name}の来歴 | 結 素材バンク`
  const description = `${m.name}（${m.materialType}・${m.origin}）の素材の履歴。${m.story ? m.story.slice(0, 80) : ''}`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', images: [{ url: m.images[0], alt: m.name }] },
  }
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b py-3" style={{ borderColor: 'var(--border)' }}>
      <dt className="text-[11px] tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>{label}</dt>
      <dd className="text-right text-sm" style={{ color: 'var(--text)' }}>{value}</dd>
    </div>
  )
}

export default async function ProvenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const materials = await getAllMaterials()
  const m = materials.find((x) => x.id === id)
  if (!m) notFound()

  const era = m.era && m.era !== '不明' ? m.era : undefined

  return (
    <main className="pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        {/* ヘッダー：素材パスポート */}
        <div className="py-6 text-center">
          <p className="text-[11px] tracking-[0.4em]" style={{ color: 'var(--accent)' }}>
            結 — 素材の履歴
          </p>
          <p className="mt-1 text-[10px] tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
            MATERIAL PROVENANCE
          </p>
        </div>

        {/* メイン画像 */}
        <div className="relative aspect-[4/3] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <Image src={m.images[0]} alt={m.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" priority />
        </div>

        {/* 名称・ID */}
        <div className="mt-6 text-center">
          <p className="text-[11px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{m.id}</p>
          <h1 className="mt-2 font-serif text-3xl font-medium leading-tight" style={{ color: 'var(--text)' }}>
            {m.name}
          </h1>
        </div>

        {/* 来歴ファクト */}
        <dl className="mt-8">
          <Fact label="種類" value={m.category} />
          <Fact label="素材・組成" value={m.materialType} />
          <Fact label="色" value={m.color} />
          <Fact label="産地" value={m.origin} />
          <Fact label="年代" value={era} />
          <Fact label="提供元" value={m.supplierName} />
        </dl>

        {/* 物語 */}
        {m.story && (
          <section className="mt-10">
            <h2 className="font-serif text-lg" style={{ color: 'var(--text)' }}>この素材の物語</h2>
            <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>{m.story}</p>
          </section>
        )}

        {/* 文化的意義 */}
        {m.characteristics && (
          <section className="mt-8">
            <h2 className="font-serif text-lg" style={{ color: 'var(--text)' }}>文化的な背景</h2>
            <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>{m.characteristics}</p>
          </section>
        )}

        {/* 追加画像 */}
        {m.images.length > 1 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {m.images.slice(1).map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <Image src={image} alt={m.name} fill className="object-cover" sizes="180px" />
              </div>
            ))}
          </div>
        )}

        {/* フッター（控えめ・販売導線ではない） */}
        <div className="mt-12 border-t pt-6 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs leading-7" style={{ color: 'var(--text-muted)' }}>
            この素材は<span style={{ color: 'var(--text)' }}>結 素材バンク</span>に記録された、
            <br className="sm:hidden" />
            日本の老舗・職人の未活用素材です。
          </p>
          <Link
            href="/materials"
            className="mt-4 inline-block border px-5 py-2 text-xs transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            ほかの素材を見る
          </Link>
        </div>
      </div>
    </main>
  )
}
