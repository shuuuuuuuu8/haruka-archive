'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { buyerForgotPasswordAction, type ForgotState } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {pending ? '送信中...' : '再設定メールを送る'}
    </button>
  )
}

export function ForgotForm() {
  const [state, formAction] = useActionState<ForgotState, FormData>(buyerForgotPasswordAction, {})

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <span className="flex size-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
            <MailCheck size={24} />
          </span>
        </div>
        <p className="text-sm leading-6" style={{ color: 'var(--text)' }}>
          <span className="font-medium">{state.email}</span> 宛に、パスワード再設定用のメールをお送りしました。
        </p>
        <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
          メール内のリンクを開いて、新しいパスワードを設定してください。届かない場合は迷惑メールフォルダもご確認ください。
        </p>
        <Link href="/account/login" className="inline-block text-xs underline" style={{ color: 'var(--accent)' }}>
          ログイン画面に戻る
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p role="alert" className="border px-3 py-2 text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-pale)' }}>
          {state.error}
        </p>
      )}
      <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
        ご登録のメールアドレスを入力してください。再設定用のリンクをメールでお送りします。
      </p>
      <div className="space-y-1.5">
        <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>メールアドレス</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder="you@example.com"
          className="w-full border bg-white px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>
      <Submit />
      <p className="pt-1 text-center text-xs">
        <Link href="/account/login" className="underline" style={{ color: 'var(--accent)' }}>
          ログイン画面に戻る
        </Link>
      </p>
    </form>
  )
}
