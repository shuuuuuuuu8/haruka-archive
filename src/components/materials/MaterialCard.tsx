'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Material } from '@/types/material'

export default function MaterialCard({ material }: { material: Material }) {
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
        </div>
        <div className="flex flex-1 flex-col p-4 text-center">
          <div>
            <p className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              {material.materialType}
            </p>
            <h3 className="mt-1 font-serif text-lg font-medium leading-snug">{material.name}</h3>
          </div>
        </div>
      </article>
    </Link>
  )
}
