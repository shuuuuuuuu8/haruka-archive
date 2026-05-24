'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FlaskConical, MessageSquare } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Material } from '@/types/material'

export default function MaterialCard({ material }: { material: Material }) {
  const shortDescription = material.story.length > 54 ? `${material.story.slice(0, 54)}...` : material.story

  return (
    <Link href={`/materials/${material.id}`} className="group block h-full">
      <article
        className="flex h-full flex-col overflow-hidden border bg-white shadow-sm transition-colors duration-200 group-hover:border-[var(--accent)]"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <Image
            src={material.images[0]}
            alt={material.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="border border-white/70 bg-white/92 px-2 py-0.5 text-[10px]" style={{ color: 'var(--text)' }}>
                {material.id}
              </span>
              <span className="border border-white/70 bg-white/92 px-2 py-0.5 text-[10px]" style={{ color: 'var(--text)' }}>
                {material.category}
              </span>
              <span className="border border-white/70 bg-white/92 px-2 py-0.5 text-[10px]" style={{ color: 'var(--accent)' }}>
                相談制
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 text-center">
          <div>
            <p className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              {material.materialType}
            </p>
            <h3 className="mt-1 font-serif text-lg font-medium leading-snug">{material.name}</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <span className="border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {material.color}
            </span>
            <span className="border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {material.pattern}
            </span>
            {material.status !== 'public' && <StatusBadge status={material.status} />}
            {material.sampleAvailable && (
              <span className="inline-flex items-center gap-1 border px-2 py-1 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <FlaskConical size={11} />
                サンプル相談可
              </span>
            )}
          </div>
          <p className="text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
            {shortDescription}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3 text-left" style={{ borderColor: 'var(--border)' }}>
            <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <MessageSquare size={12} />
              サンプル・ロット相談
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em]" style={{ color: 'var(--accent)' }}>
              詳細 <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
