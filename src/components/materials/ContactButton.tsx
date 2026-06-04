'use client'

import { useTransition } from 'react'
import { MessageSquare } from 'lucide-react'
import { startConversation } from '@/app/account/chats/actions'

// 素材詳細の「相談する」。クリックで会話を開始（未ログインならログインへ誘導）。
export function ContactButton({
  materialUuid,
  backTo,
}: {
  materialUuid: string
  backTo: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => startConversation(materialUuid, backTo))}
      className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      <MessageSquare size={16} />
      {pending ? '準備中...' : 'この素材について相談する'}
    </button>
  )
}
