import { AuthForm } from '../AuthForm'

export const metadata = { title: '新規登録' }

export default async function BuyerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const safeNext = next && next.startsWith('/') ? next : '/materials'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-16" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="w-full max-w-sm border bg-white p-6 sm:p-8" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>結 素材バンク</p>
          <h1 className="mt-1 font-serif text-2xl">新規登録</h1>
          <p className="mt-2 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
            素材のご相談に使えます。閲覧だけなら登録不要です。
          </p>
        </div>
        <AuthForm mode="signup" next={safeNext} />
      </div>
    </main>
  )
}
