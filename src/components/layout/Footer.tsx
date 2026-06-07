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
            INFO
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/legal/terms">利用規約</Link>
            <Link href="/legal/privacy">プライバシーポリシー</Link>
          </div>
          <p className="mt-4 text-xs leading-6" style={{ color: 'var(--text-muted)' }}>
            運営: 合同会社遙<br />
            東京都中央区銀座一丁目12番4号 N&amp;E BLD. 6F
          </p>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-[11px] sm:px-6" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        このサイトはECではありません。成約・お金のやり取りは遙が間に入り調整します。 © 2026 結 素材バンク
      </div>
    </footer>
  )
}
