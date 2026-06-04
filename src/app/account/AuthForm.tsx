'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { buyerLoginAction, buyerSignupAction, type AuthState } from './actions'

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full border bg-white px-3 py-2.5 text-sm outline-none'
const inputStyle = { borderColor: 'var(--border)', color: 'var(--text)' } as const

export function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next: string }) {
  const action = mode === 'login' ? buyerLoginAction : buyerSignupAction
  const [state, formAction] = useActionState<AuthState, FormData>(action, {})
  const [showPw, setShowPw] = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="border px-3 py-2 text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-pale)' }}>
          {state.error}
        </p>
      )}

      {mode === 'signup' && (
        <Field label="お名前 / 屋号" hint="ご注文・ご相談時に表示されます">
          <input
            name="display_name"
            className={inputCls}
            style={inputStyle}
            placeholder="例: ○○デザイン、山田太郎"
            defaultValue={state.fields?.display_name}
            required
          />
        </Field>
      )}

      <Field label="メールアドレス">
        <input
          name="email"
          type="email"
          autoComplete="email"
          className={inputCls}
          style={inputStyle}
          placeholder="you@example.com"
          defaultValue={state.fields?.email}
          required
        />
      </Field>

      <Field label="パスワード" hint={mode === 'signup' ? '半角の英字と数字で8文字以上' : undefined}>
        <div className="relative">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className={inputCls + ' pr-10'}
            style={inputStyle}
            placeholder={mode === 'signup' ? '8文字以上' : ''}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
            aria-label={showPw ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      {mode === 'login' ? (
        <SubmitButton label="ログイン" pendingLabel="ログイン中..." />
      ) : (
        <SubmitButton label="登録する" pendingLabel="登録中..." />
      )}

      <p className="pt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {mode === 'login' ? (
          <>
            アカウントをお持ちでない方は{' '}
            <Link href={`/account/signup?next=${encodeURIComponent(next)}`} className="underline" style={{ color: 'var(--accent)' }}>
              新規登録
            </Link>
          </>
        ) : (
          <>
            すでに登録済みの方は{' '}
            <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="underline" style={{ color: 'var(--accent)' }}>
              ログイン
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
