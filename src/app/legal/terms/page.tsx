import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約',
  description: '結 素材バンク（合同会社遙）の利用規約です。',
  alternates: { canonical: '/legal/terms' },
}

const updated = '2026年6月7日'

export default function TermsPage() {
  return (
    <main className="pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>TERMS OF SERVICE</p>
        <h1 className="mt-2 font-serif text-3xl">利用規約</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>最終更新日: {updated}</p>

        <div className="mt-8 space-y-8 text-sm leading-7" style={{ color: 'var(--text)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            本利用規約（以下「本規約」）は、合同会社遙（以下「当社」）が提供する「結 素材バンク」および関連サービス（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスを利用することにより本規約に同意したものとみなされます。
          </p>

          <section>
            <h2 className="font-serif text-lg">第1条（サービスの内容）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              本サービスは、伝統工芸の未活用素材を保有する提供元と、それを必要とする作り手（買い手）を結ぶマッチング・仲介の場を提供します。当社は両者の間に入り、サンプル確認・ロット相談・価格相談・調整などをサポートします。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第2条（会員登録）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              一部の機能（相談チャット等）の利用には会員登録が必要です。利用者は、正確な情報を登録し、パスワードを適切に管理するものとします。登録情報に変更が生じた場合は速やかに更新してください。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第3条（手数料）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              本サービスを通じて成約に至った取引について、当社は成約額に応じた仲介手数料を申し受けます。手数料の詳細は、取引の調整時に個別にご案内します。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第4条（禁止事項）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>利用者は、以下の行為をしてはなりません。</p>
            <ul className="mt-3 list-disc space-y-1 pl-5" style={{ color: 'var(--text-muted)' }}>
              <li>法令または公序良俗に違反する行為</li>
              <li>虚偽の情報を登録・提供する行為</li>
              <li>当社や他の利用者、第三者の権利を侵害する行為</li>
              <li>当社を介さずに当事者間で直接取引を行い、手数料の支払いを回避する行為</li>
              <li>本サービスの運営を妨害する行為、不正アクセス等</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg">第5条（免責事項）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              当社は、提供元と作り手の間の取引について、その成立・内容・品質・履行を保証するものではありません。素材の状態や取引条件は、当事者間で十分にご確認ください。本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、当社は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第6条（知的財産・掲載情報）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              本サービスに掲載される素材情報・画像等の権利は、各提供元または正当な権利者に帰属します。当社は、本サービスの運営・紹介に必要な範囲でこれらを利用できるものとします。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第7条（サービスの変更・停止）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              当社は、利用者への事前通知なく、本サービスの内容の変更・追加・停止を行うことができます。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">第8条（準拠法・管轄）</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              本規約は日本法を準拠法とし、本サービスに関して紛争が生じた場合は、当社の所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">運営者</h2>
            <div className="mt-3 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <p>合同会社遙</p>
              <p>東京都中央区銀座一丁目12番4号 N&amp;E BLD. 6F</p>
              <p><a href="/inquiry" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>お問い合わせフォーム</a></p>
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
