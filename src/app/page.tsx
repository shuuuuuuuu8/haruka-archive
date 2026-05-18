import Link from 'next/link'
import { ArrowRight, CheckCircle, ExternalLink, MessageSquare, Search, Sparkles } from 'lucide-react'
import { MATERIALS, PARTNERS } from '@/lib/data'
import type { MaterialCategory } from '@/types/material'

const TRUST_ITEMS = ['閲覧・検索は無料', '直接販売ではなく相談制', 'BtoBの商品開発向け', '遙が提供元と利用企業を仲介']
const USE_CASES = ['アパレル・バッグの商品開発', 'ホテル・店舗向けインテリア', '海外向けの限定企画', '老舗との共創プロジェクト']
const CATEGORY_ORDER: MaterialCategory[] = ['帯地', '絹', '綿', '麻', '反物', '和紙', '古布', '工芸素材', 'その他']
const CATEGORY_LABELS: Partial<Record<MaterialCategory, string>> = {
  帯地: '帯',
}

export default function Home() {
  const categories = CATEGORY_ORDER.map((category) => {
    const materials = MATERIALS.filter((material) => material.category === category)
    return { category, materials }
  }).filter(({ materials }) => materials.length > 0)

  return (
    <main style={{ backgroundColor: 'var(--bg)' }}>
      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1d1c19]/90 via-[#1d1c19]/65 to-[#1d1c19]/20" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_420px]">
          <div className="max-w-3xl pt-16 text-white">
            <p className="mb-5 text-xs tracking-[0.28em] text-white/75">MUSUBI MATERIAL BANK</p>
            <h1 className="text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
              老舗に眠る素材を、
              <br />
              次のものづくりへ。
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-8 text-white/82">
              絹、綿、麻、反物、帯地、和紙、古布、工芸素材。結 素材バンクは、日本の老舗や職人工房に保管されてきた価値ある素材在庫を、企業・ブランド・デザイナーの新しい商品開発へつなぐBtoB向け素材プラットフォームです。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/materials" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-[0.16em] text-white" style={{ backgroundColor: 'var(--accent)' }}>
                <Search size={16} />
                素材を探す
              </Link>
              <Link href="/inquiry" className="inline-flex items-center justify-center gap-2 border border-white/45 px-6 py-3 text-sm tracking-[0.16em] text-white">
                <MessageSquare size={16} />
                相談する
              </Link>
            </div>
          </div>
          <div className="mt-8 hidden border border-white/20 bg-white/12 p-5 backdrop-blur-md lg:block">
            <p className="mb-4 flex items-center gap-2 text-sm text-white">
              <Sparkles size={16} />
              整理される情報
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/86">
              {['種類', '色柄', '産地', '年代', '数量', '価格帯', '状態', '背景ストーリー', '活用可能性', 'サンプル可否'].map((item) => (
                <span key={item} className="border border-white/18 px-3 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-4 sm:px-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle size={14} style={{ color: 'var(--success)' }} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
              NOT JUST INVENTORY
            </p>
            <h2 className="text-3xl font-medium leading-tight sm:text-4xl">素材の背景まで、使える状態にする。</h2>
          </div>
          <div className="space-y-5 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>
            <p>
              単なる在庫一覧ではなく、素材の種類、色柄、産地、年代、数量、価格帯、状態、背景ストーリー、活用可能性まで整理します。素材を探す人が「何に使えるか」まで想像できる状態にすることが、このサイトの役割です。
            </p>
            <p>
              購入、サンプル確認、ロット相談、商品開発、老舗との共創企画については、遙が間に入り、素材提供元と利用企業・デザイナーをつなぎます。
            </p>
          </div>
        </div>
      </section>

      <section className="border-y py-16" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
                MATERIALS
              </p>
              <h2 className="text-3xl font-medium">素材カテゴリ</h2>
            </div>
            <Link href="/materials" className="inline-flex items-center gap-1 text-xs tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
              すべて見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ category, materials }) => (
              <Link
                key={category}
                href={`/materials?category=${encodeURIComponent(category)}`}
                className="group flex min-h-48 flex-col justify-between border p-5 transition-colors"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
              >
                <div>
                  <p className="mb-3 text-[10px] tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                    {materials.length} MATERIALS
                  </p>
                  <h3 className="font-serif text-3xl font-medium">{CATEGORY_LABELS[category] ?? category}</h3>
                  <p className="mt-4 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
                    {materials.slice(0, 3).map((material) => material.name).join(' / ')}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center justify-end gap-1 text-[11px] tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
                  素材を見る <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
              CO-CREATION
            </p>
            <h2 className="text-3xl font-medium">処分ではなく、文化を売上に変換する。</h2>
            <p className="mt-5 text-sm leading-8" style={{ color: 'var(--text-muted)' }}>
              目指すのは、在庫をただ処分することではありません。素材が持つ歴史・技術・物語を現代の商品開発に変換し、新しい売上と文化継承の機会をつくることです。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {USE_CASES.map((item) => (
              <div key={item} className="border p-4 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
                PARTNERS
              </p>
              <h2 className="text-3xl font-medium">素材提供元</h2>
            </div>
            <Link href="/partners" className="inline-flex items-center gap-1 text-xs tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
              一覧へ <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((partner) => (
              <a
                key={partner.id}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border p-4 transition-colors"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
              >
                <p className="font-serif text-lg">{partner.name}</p>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--accent)' }}>
                  {partner.founded}
                </p>
                <p className="mt-3 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
                  {partner.speciality}
                </p>
                <p className="mt-3 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
                  {partner.story}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
                  詳細を見る <ExternalLink size={13} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
