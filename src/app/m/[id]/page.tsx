import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { getAllMaterials } from '@/lib/get-materials'
import { fetchMusubiMaterialByProvenanceId } from '@/lib/musubi-materials'
import ViewTracker from './ViewTracker'

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const materials = await getAllMaterials()
  return materials.map((m) => ({ id: m.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const m = await resolveProvenanceMaterial(id)
  if (!m) return { title: '素材が見つかりません', robots: { index: false, follow: false } }
  const title = `${m.name}の来歴`
  const description = `${m.name}（${m.materialType}・${m.origin}）の素材の履歴。${m.story ? m.story.slice(0, 80) : ''}`
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', images: [{ url: m.images[0], alt: m.name }] },
  }
}

// 来歴解決：まず service-role で（成約済みも含め）引く。キー未設定や取得失敗時は、
// 公開一覧（is_available=true）へフォールバックして、公開中の素材は必ず表示できるようにする。
async function resolveProvenanceMaterial(id: string) {
  const viaService = await fetchMusubiMaterialByProvenanceId(id)
  if (viaService) return viaService
  const all = await getAllMaterials()
  // 完全一致だと「MSB-＋12桁大文字」以外（旧8桁QR・小文字・純hex）が
  // 全て404になるため、service側と同じ正規化でプレフィックス一致させる。
  const raw = id.trim().replace(/^MSB-/i, '').replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{8,32}$/.test(raw)) return null
  const matches = all.filter((x) =>
    x.sourceId?.replace(/-/g, '').toLowerCase().startsWith(raw),
  )
  // 複数一致＝プレフィックス衝突。当てずっぽうで別素材を見せない安全側。
  return matches.length === 1 ? matches[0] : null
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
  const m = await resolveProvenanceMaterial(id)
  if (!m) notFound()

  // 来歴ページは丸めない生の年代を優先（例「昭和30年代」）。無ければ粗い列挙を補助的に。
  const era = m.eraText?.trim() || (m.era && m.era !== '不明' ? m.era : undefined)

  return (
    <main className="pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      {m.sourceId && <ViewTracker materialUuid={m.sourceId} displayId={m.id} />}
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
          <Fact label="素材・組成" value={m.attributes?.composition || m.materialType} />
          <Fact label="柄・文様" value={m.attributes?.pattern} />
          <Fact label="技法" value={m.attributes?.technique} />
          <Fact label="色" value={m.color} />
          <Fact label="産地" value={m.regionText} />
          <Fact label="年代" value={era} />
          <Fact label="職人・工房" value={m.attributes?.maker} />
          <Fact label="提供元" value={m.supplierName} />
        </dl>

        {/* 出所の明示（優良誤認を避ける・検証済みを詐称しない） */}
        <p className="mt-3 text-[11px] leading-6" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
          ※ 上記は提供元による申告にもとづく情報です（第三者による検証ではありません）。
        </p>

        {/* 物語 */}
        {m.story && (
          <section className="mt-10">
            <h2 className="font-serif text-lg" style={{ color: 'var(--text)' }}>この素材の物語</h2>
            <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>{m.story}</p>
          </section>
        )}

        {/* 環境への配慮（断定しない・概算/推定を明記。優良誤認を避ける） */}
        <section className="mt-8 border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="flex items-center gap-2 font-serif text-lg" style={{ color: 'var(--text)' }}>
            <Leaf size={18} style={{ color: 'var(--accent)' }} />
            環境への配慮
          </h2>
          <p className="mt-3 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>
            この素材は、新たに生産されたものではなく、すでにつくられ眠っていた{m.attributes?.composition || m.materialType}を活かしています。
            布を一から生産する場合と比べ、原料の栽培・紡績・染色などにかかる水やエネルギーを抑えられると考えられます。
          </p>
          <ul className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li>・ 新規生産を回避（再生産されない一点ものの素材）</li>
            <li>・ 廃棄されうる素材を、次のものづくりへ</li>
          </ul>
          <p className="mt-3 text-[11px] leading-6" style={{ color: 'var(--text-faint, var(--text-muted))', opacity: 0.7 }}>
            ※ 環境負荷の削減は一般的な傾向にもとづく説明です。具体的な削減量を示すものではありません。
            定量的な評価（LCA等）が必要な場合は、別途ご相談ください。
          </p>
        </section>

        {/* この素材から生まれた製品 */}
        {Array.isArray(m.attributes?.derived_products) && m.attributes.derived_products.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-lg" style={{ color: 'var(--text)' }}>この素材から生まれた製品</h2>
            <ul className="mt-3 space-y-2">
              {m.attributes.derived_products.map((p, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 border-b py-2" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    {p.name}
                    {p.note ? <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{p.note}</span> : null}
                  </span>
                  {p.count ? <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.count}点</span> : null}
                </li>
              ))}
            </ul>
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
            この素材は<span style={{ color: 'var(--text)' }}>結</span>に記録された、
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
