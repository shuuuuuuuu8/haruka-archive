import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export const metadata = { title: '確認メールを送信しました' }

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-16" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="w-full max-w-sm border bg-white p-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-4 flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
            <MailCheck size={24} />
          </span>
        </div>
        <h1 className="font-serif text-xl">確認メールを送信しました</h1>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          {email ? <><span className="font-medium" style={{ color: 'var(--text)' }}>{email}</span> 宛に</> : 'ご登録のメール宛に'}
          確認メールをお送りしました。メール内のリンクを開くと登録が完了します。
        </p>
        <Link href="/materials" className="mt-6 inline-block border px-4 py-2 text-xs" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
          素材を見る
        </Link>
      </div>
    </main>
  )
}
