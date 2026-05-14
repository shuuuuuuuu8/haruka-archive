import Link from 'next/link'
import { ArrowRight, ExternalLink, MapPin, Package } from 'lucide-react'
import { MATERIALS, PARTNERS } from '@/lib/data'

export default function PartnersPage() {
  return (
    <main style={{ backgroundColor: 'var(--bg)' }}>
      <section className="border-b px-4 pb-8 pt-24 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>
            PARTNER SUPPLIERS
          </p>
          <h1 className="text-3xl font-medium">素材提供元</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
            遙がつなぐ老舗・職人工房の一覧です。各提供元の歴史や技術、保管素材をもとに、次のものづくりの接点をつくります。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-4 border-y py-4 sm:grid-cols-3" style={{ borderColor: 'var(--border)' }}>
          <p>
            <span className="font-serif text-3xl" style={{ color: 'var(--accent)' }}>
              {PARTNERS.length}
            </span>
            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              提供元
            </span>
          </p>
          <p>
            <span className="font-serif text-3xl" style={{ color: 'var(--accent)' }}>
              {MATERIALS.length}
            </span>
            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              登録素材
            </span>
          </p>
          <p className="self-center text-xs" style={{ color: 'var(--text-muted)' }}>
            明治創業から現代工房まで
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PARTNERS.map((partner) => {
            const partnerMaterials = MATERIALS.filter((material) => material.supplier === partner.name)
            return (
              <article key={partner.id} className="flex flex-col border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="border-b p-5" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                    {partner.id}
                  </p>
                  <h2 className="mt-1 font-serif text-xl">{partner.name}</h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>
                    {partner.founded}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    {partner.location}
                  </p>
                  <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Package size={14} />
                    {partner.speciality}
                  </p>
                  <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                    {partner.story}
                  </p>
                  {partnerMaterials.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      {partnerMaterials.map((material) => (
                        <Link key={material.id} href={`/materials/${material.id}`} className="border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                          {material.id}
                        </Link>
                      ))}
                    </div>
                  )}
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-between border px-3 py-2 text-xs"
                      style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                    >
                      丸屋の詳細を見る
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <Link href="/inquiry" className="mt-2 inline-flex items-center justify-between border px-3 py-2 text-xs" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                      この提供元について相談する
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
