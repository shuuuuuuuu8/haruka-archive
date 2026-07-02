'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Material } from '@/types/material'

// 空扱いする値（未入力・不明・文字列"null"など）を除外して整形する。
const EMPTY_VALUES = new Set(['', '不明', 'null', 'undefined', 'その他'])
function clean(value?: string | null): string | null {
  const v = value?.trim()
  return v && !EMPTY_VALUES.has(v) ? v : null
}

export default function MaterialCard({ material }: { material: Material }) {
  const subtitle = [
    clean(material.category),
    clean(material.color),
    clean(material.eraText) ?? clean(material.era),
    clean(material.regionText),
  ]
    .filter(Boolean)
    .join(' · ')

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
            {subtitle && (
              <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
