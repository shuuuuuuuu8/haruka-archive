import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { StatusBadge, VerifiedBadge } from '@/components/ui/StatusBadge'
import { ContactButton } from '@/components/materials/ContactButton'
import { getAllMaterials } from '@/lib/get-materials'
import { QUANTITY_SIZE_LABELS } from '@/types/material'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const materials = await getAllMaterials()
  return materials.map((material) => ({ id: material.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const materials = await getAllMaterials()
  const material = materials.find((item) => item.id === id)

  if (!material) {
    return {
      title: '素材が見つかりません',
      robots: { index: false, follow: false },
    }
  }

  const title = `${material.name} | ${material.materialType}・${material.category}`
  const description = `${material.name}は${material.materialType}の${material.category}素材です。色は${material.color}、柄は${material.pattern}。サンプル確認・ロット相談・商品開発について遙へ相談できます。`

  return {
    title,
    description,
    alternates: { canonical: `/materials/${material.id}` },
    openGraph: {
      title,
      description,
      url: `/materials/${material.id}`,
      type: 'article',
      images: [{ url: material.images[0], alt: material.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [material.images[0]],
    },
  }
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const materials = await getAllMaterials()
  const material = materials.find((item) => item.id === id)
  if (!material) notFound()

  return (
    <main className="pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/materials" className="mb-6 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={14} />
          素材一覧へ戻る
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <Image src={material.images[0]} alt={material.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" priority />
            </div>
            {material.images.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {material.images.slice(1).map((image) => (
                  <div key={image} className="relative aspect-[4/3] overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <Image src={image} alt={material.name} fill className="object-cover" sizes="180px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <section>
            <p className="text-[11px] tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
              {material.id} / {material.category}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium leading-tight">{material.name}</h1>
            <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              {material.origin} / {material.era} / {material.supplier}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge status={material.status} />
              <span className="border border-stone-200 px-2 py-0.5 text-[10px] text-stone-600">
                {QUANTITY_SIZE_LABELS[material.quantitySize]}
              </span>
              <span className="border border-stone-200 px-2 py-0.5 text-[10px] text-stone-600">
                直接購入ではなく相談制
              </span>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {[
                ['素材種別', material.materialType],
                ['色', material.color],
                ['柄', material.pattern],
                ['数量', `${material.quantity}${material.quantityUnit}`],
                ['サンプル', material.sampleAvailable ? '相談可' : '要確認'],
                ['相談項目', 'サンプル確認・ロット相談・価格相談'],
              ].map(([label, value]) => (
                <div key={label} className="border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <dt className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </dt>
                  <dd className="mt-1">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 space-y-6">
              {material.story && (
                <section>
                  <h2 className="font-serif text-xl">背景ストーリー</h2>
                  <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>
                    {material.story}
                  </p>
                </section>
              )}
              {material.characteristics && (
                <section>
                  <h2 className="font-serif text-xl">活用可能性</h2>
                  <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>
                    {material.characteristics}
                  </p>
                  {material.recommendedUses.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {material.recommendedUses.map((use) => (
                        <span key={use} className="px-2 py-1 text-xs" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                          {use}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            {(material.verifiedFields.length > 0 || material.pendingFields.length > 0 || material.estimatedFields.length > 0) && (
              <div className="mt-8 flex flex-wrap gap-2">
                {material.verifiedFields.map((field) => (
                  <VerifiedBadge key={field} type="verified" label={field} />
                ))}
                {material.pendingFields.map((field) => (
                  <VerifiedBadge key={field} type="pending" label={field} />
                ))}
                {material.estimatedFields.map((field) => (
                  <VerifiedBadge key={field} type="estimated" label={field} />
                ))}
              </div>
            )}

            <div className="mt-8 border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                NEXT STEP
              </p>
              <h2 className="mt-2 font-serif text-xl">この素材について相談する</h2>
              <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                提供元と直接チャットで、用途・希望数量・サンプル確認・価格などを相談できます。遙が間に入り、確認と調整をサポートします。相談の開始にはログイン（無料）が必要です。
              </p>
              {material.sourceId ? (
                <ContactButton materialUuid={material.sourceId} backTo={`/materials/${material.id}`} />
              ) : (
                <Link href="/inquiry" className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-[0.14em] text-white" style={{ backgroundColor: 'var(--accent)' }}>
                  <MessageSquare size={16} />
                  相談する
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
