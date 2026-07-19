import { ForgotForm } from './ForgotForm'

export const metadata = { title: 'パスワードの再設定' }

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-16" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="w-full max-w-sm border bg-white p-6 sm:p-8" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.24em]" style={{ color: 'var(--accent)' }}>結</p>
          <h1 className="mt-1 font-serif text-2xl">パスワードの再設定</h1>
        </div>
        <ForgotForm />
      </div>
    </main>
  )
}
