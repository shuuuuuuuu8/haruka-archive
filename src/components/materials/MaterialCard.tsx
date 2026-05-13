'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { PriceBadge, StatusBadge } from '@/components/ui/StatusBadge'
import { QUANTITY_SIZE_LABELS } from '@/types/material'
import type { Material } from '@/types/material'

export default function MaterialCard({ material }: { material: Material }) {
  const story = material.story.length > 76 ? `${material.story.slice(0, 76)}...` : material.story

  return (
    <Link href={`/materials/${material.id}`} className="group block h-full">
      <article
        className="flex h-full flex-col overflow-hidden border transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="relative h-44 overflow-hidden">
          <Image src={material.images[0]} alt={material.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {material.status !== 'public' && <StatusBadge status={material.status} />}
            {material.sampleAvailable && (
              <span className="inline-flex items-center gap-1 border border-white/70 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700">
                <FlaskConical size={10} />
                サンプル相談可
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
              {material.id}
            </span>
            <span className="border px-2 py-0.5 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {material.category}
            </span>
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium leading-snug">{material.name}</h3>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {material.origin} / {material.era} / {material.supplier}
            </p>
          </div>
          <p className="flex-1 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
            {story}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PriceBadge priceRange={material.priceRange} />
            <span className="border border-stone-200 px-2 py-0.5 text-[10px] text-stone-600">
              {QUANTITY_SIZE_LABELS[material.quantitySize]}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {material.recommendedUses.slice(0, 3).map((use) => (
              <span key={use} className="px-2 py-1 text-[10px]" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                {use}
              </span>
            ))}
          </div>
          <span className="mt-1 inline-flex items-center justify-end gap-1 text-[11px] tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
            詳細を見る <ArrowRight size={12} />
          </span>
        </div>
      </article>
    </Link>
  )
}
