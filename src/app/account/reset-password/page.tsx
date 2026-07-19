import { ResetForm } from './ResetForm'

export const metadata = { title: '新しいパスワードの設定' }

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-16" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="w-full max-w-sm border bg-white p-6 sm:p-8" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>結</p>
          <h1 className="mt-1 font-serif text-2xl">新しいパスワードの設定</h1>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>新しいパスワードを入力して再設定を完了してください</p>
        </div>
        <ResetForm />
      </div>
    </main>
  )
}
