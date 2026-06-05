'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Eye, EyeOff } from 'lucide-react'
import { buyerResetPasswordAction, type ResetState } from './actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {pending ? '設定中...' : '新しいパスワードを設定する'}
    </button>
  )
}

const inputCls = 'w-full border bg-white px-3 py-2.5 text-sm outline-none'
const inputStyle = { borderColor: 'var(--border)', color: 'var(--text)' } as const

export function ResetForm() {
  const [state, formAction] = useActionState<ResetState, FormData>(buyerResetPasswordAction, {})
  const [showPw, setShowPw] = useState(false)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p role="alert" className="border px-3 py-2 text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-pale)' }}>
          {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>新しいパスワード</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="8文字以上（半角英数字）"
            className={inputCls + ' pr-10'}
            style={inputStyle}
          />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} aria-label={showPw ? 'パスワードを隠す' : 'パスワードを表示'}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>半角の英字と数字で8文字以上</p>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>新しいパスワード（確認）</label>
        <input
          name="password_confirm"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="もう一度入力してください"
          className={inputCls}
          style={inputStyle}
        />
      </div>
      <Submit />
    </form>
  )
}
