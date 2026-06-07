import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: '結 素材バンク（合同会社遙）のプライバシーポリシー（個人情報の取り扱い）です。',
  alternates: { canonical: '/legal/privacy' },
}

const updated = '2026年6月7日'

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>PRIVACY POLICY</p>
        <h1 className="mt-2 font-serif text-3xl">プライバシーポリシー</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>最終更新日: {updated}</p>

        <div className="mt-8 space-y-8 text-sm leading-7" style={{ color: 'var(--text)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            合同会社遙（以下「当社」）は、当社が運営する「結 素材バンク」および関連サービス（以下「本サービス」）における利用者の個人情報を、以下の方針に基づき適切に取り扱います。
          </p>

          <section>
            <h2 className="font-serif text-lg">1. 取得する情報</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5" style={{ color: 'var(--text-muted)' }}>
              <li>会員登録時にご提供いただく情報（お名前・屋号、メールアドレス、パスワード）</li>
              <li>素材の提供元としてご登録いただく情報（店名・屋号、所在地域、連絡先等）</li>
              <li>チャット・お問い合わせ・相談でご入力いただく内容</li>
              <li>サービス利用に伴い自動的に取得する情報（アクセスログ、Cookie、利用状況等）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg">2. 利用目的</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5" style={{ color: 'var(--text-muted)' }}>
              <li>本サービスの提供・運営、本人確認、認証のため</li>
              <li>素材の提供元と作り手のマッチング・仲介・調整のため</li>
              <li>お問い合わせ・相談への対応のため</li>
              <li>サービスの改善、新機能の開発、利用状況の分析のため</li>
              <li>規約違反・不正利用の防止のため</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg">3. 第三者提供・業務委託</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              当社は、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。ただし、マッチングの目的上必要な範囲で、素材の提供元と作り手の間で相談内容・連絡先等を共有する場合があります。
            </p>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              また、本サービスの運営のため、以下の外部サービスを利用しており、これらに情報の保管・処理を委託しています。
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5" style={{ color: 'var(--text-muted)' }}>
              <li>Supabase（データベース・認証基盤）</li>
              <li>Vercel（ホスティング）</li>
              <li>OpenAI（AIによる素材検索の補助）</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg">4. 保管期間</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              個人情報は、利用目的の達成に必要な期間、または法令で定められた期間保管し、不要となった場合は適切に削除します。退会された場合は、法令上必要なものを除き削除します。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">5. ご本人の権利</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              利用者は、ご自身の個人情報の開示・訂正・利用停止・削除を求めることができます。ご希望の場合は、下記の窓口までご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">6. Cookie等の利用</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              本サービスは、ログイン状態の維持や利用状況の把握のためにCookie等を利用します。ブラウザの設定により無効化できますが、一部機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg">7. お問い合わせ窓口</h2>
            <div className="mt-3 space-y-1" style={{ color: 'var(--text-muted)' }}>
              <p>合同会社遙</p>
              <p>東京都中央区銀座一丁目12番4号 N&amp;E BLD. 6F</p>
              <p>個人情報の取り扱いに関するお問い合わせは、<a href="/inquiry" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>お問い合わせフォーム</a>よりご連絡ください。</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg">8. 本ポリシーの変更</h2>
            <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
              当社は、必要に応じて本ポリシーを変更することがあります。重要な変更については本サービス上でお知らせします。
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
