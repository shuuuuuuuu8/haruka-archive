import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-serif text-lg font-medium tracking-[0.12em]">結 素材バンク</p>
          <p className="mt-3 text-xs leading-7" style={{ color: 'var(--text-muted)' }}>
            日本各地の老舗や職人工房に眠る未活用素材・デッドストック素材をデータ化し、企業や個人デザイナーが目的に合った素材を探せる入口です。
          </p>
        </div>
        <div>
          <p className="mb-3 text-[11px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            MENU
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/materials">素材を探す</Link>
            <Link href="/partners">提供元を見る</Link>
            <Link href="/inquiry">相談する</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-[11px] tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            NOTE
          </p>
          <p className="text-xs leading-7" style={{ color: 'var(--text-muted)' }}>
            このサイトはECではありません。サンプル確認、ロット相談、価格相談、商品開発、共創企画は遙が間に入り調整します。
          </p>
        </div>
      </div>
    </footer>
  )
}
