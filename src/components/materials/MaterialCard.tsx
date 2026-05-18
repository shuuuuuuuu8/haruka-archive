'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FlaskConical } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Material } from '@/types/material'

export default function MaterialCard({ material }: { material: Material }) {
  const shortDescription = material.story.length > 42 ? `${material.story.slice(0, 42)}...` : material.story

  return (
    <Link href={`/materials/${material.id}`} className="group block h-full">
      <article
        className="flex h-full flex-col overflow-hidden border transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={material.images[0]}
            alt={material.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex flex-col gap-1.5">
              {material.status !== 'public' && <StatusBadge status={material.status} />}
              {material.sampleAvailable && (
                <span className="inline-flex items-center gap-1 border border-white/70 bg-white/90 px-2 py-0.5 text-[10px] text-stone-700">
                  <FlaskConical size={10} />
                  サンプル相談可
                </span>
              )}
            </div>
            <span className="border border-white/60 bg-white/90 px-2 py-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {material.category}
            </span>
          </div>
          <div className="absolute inset-0 flex items-end bg-black/0 p-4 text-white transition-colors duration-300 group-hover:bg-black/35">
            <div className="w-full translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-[10px] tracking-[0.2em] text-white/75">{material.id}</p>
              <h3 className="mt-1 font-serif text-xl font-medium leading-snug">{material.name}</h3>
            </div>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div>
            <p className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              {material.id}
            </p>
            <h3 className="mt-1 font-serif text-lg font-medium leading-snug">{material.name}</h3>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {material.materialType} / 訪問着用帯
          </p>
          <p className="text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
            {shortDescription}
          </p>
        </div>
      </article>
    </Link>
  )
}
