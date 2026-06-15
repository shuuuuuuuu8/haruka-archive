'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Sparkles, X, MailCheck } from 'lucide-react'
import { submitMaterialRequest, type RequestState } from '@/app/materials/request-actions'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {pending ? '送信中…' : 'この内容でリクエストする'}
    </button>
  )
}

export default function RequestForm({
  open,
  defaultQuery = '',
  onClose,
}: {
  open: boolean
  defaultQuery?: string
  onClose: () => void
}) {
  const [state, formAction] = useActionState<RequestState, FormData>(submitMaterialRequest, {})

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-lg rounded-xl bg-white shadow-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <p className="flex items-center gap-2 font-serif text-lg" style={{ color: 'var(--text)' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            探している素材をリクエスト
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-pale)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {state.ok ? (
          <div className="space-y-4 p-6 text-center">
            <div className="flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                <MailCheck size={24} />
              </span>
            </div>
            <p className="text-sm leading-7" style={{ color: 'var(--text)' }}>
              リクエストを受け付けました。条件に合う素材が見つかったら、遙からご連絡します。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-block border px-5 py-2 text-xs"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              閉じる
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 p-6">
            <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
              今はまだ無くても大丈夫です。「どんな素材を探しているか」を教えていただければ、遙が提供元にあたって、入荷したらお知らせします。
            </p>
            {state.error && (
              <p role="alert" className="border px-3 py-2 text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-pale)' }}>
                {state.error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                探している素材 <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                name="query"
                defaultValue={defaultQuery}
                required
                placeholder="例: 赤系の帯（バッグ用）、白い正絹の反物"
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                詳しい用途・希望（任意）
              </label>
              <textarea
                name="note"
                rows={3}
                placeholder="例: 鞄を作りたい / 1〜2点 / 予算◯円 など"
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                連絡先（任意・入荷時のご連絡用）
              </label>
              <input
                name="contact"
                placeholder="メールアドレス等。ログイン中の方は不要です"
                className="w-full border bg-white px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            <Submit />
          </form>
        )}
      </div>
    </div>
  )
}
