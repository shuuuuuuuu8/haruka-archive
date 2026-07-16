import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center">
        <p className="text-xs tracking-[0.4em]" style={{ color: 'var(--accent)' }}>
          404 — NOT FOUND
        </p>
        <h1 className="mt-4 font-serif text-3xl font-medium leading-tight sm:text-4xl" style={{ color: 'var(--text)' }}>
          お探しのページは
          <wbr />
          見つかりませんでした
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
          ページが移動または削除されたか、URLが間違っている可能性があります。
          <wbr />
          お探しの素材は、一覧からたどれるかもしれません。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/materials"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-[0.14em] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            素材を探す
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border px-6 py-3 text-sm tracking-[0.14em] transition-colors hover:bg-[var(--bg-card)]"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <ArrowLeft size={14} />
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
