'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createBuyerClient } from '@/lib/buyer/client'
import { sendBuyerMessage } from '@/app/account/chats/actions'

export type ChatMessage = {
  id: string
  sender_id: string | null
  sender_role: 'buyer' | 'supplier' | 'admin'
  body: string
  created_at: string
}

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
  buyerName,
  supplierName,
}: {
  conversationId: string
  currentUserId: string
  initialMessages: ChatMessage[]
  buyerName: string
  supplierName: string
}) {
  // 役割ごとの表示名（アカウント名）。運営は固定表記。
  const roleName: Record<ChatMessage['sender_role'], string> = {
    buyer: buyerName,
    supplier: supplierName,
    admin: '遙（運営）',
  }
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const composingRef = useRef(false)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // リアルタイム購読：この会話の新着メッセージ
  useEffect(() => {
    const supabase = createBuyerClient()
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as ChatMessage
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  async function submit() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    // 楽観的表示
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      sender_id: currentUserId,
      sender_role: 'buyer',
      body: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    const res = await sendBuyerMessage(conversationId, text)
    if (res.error) {
      // 失敗したら楽観メッセージを除去して入力を戻す
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setInput(text)
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 9rem)' }}>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            最初のメッセージを送って相談を始めましょう。
          </p>
        )}
        {messages.map((m) => {
          // 役割で判定（同一アカウントが買い手と提供元を兼ねられるため、
          // IDで判定すると相手の発言まで全部「自分」になる）
          const mine = m.sender_role === 'buyer'
          return (
            <div key={m.id} className={mine ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
              {/* 送信者のアカウント名を常に表示（自分の分も） */}
              <span className="mb-0.5 px-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {roleName[m.sender_role]}
              </span>
              <div
                className="max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-6"
                style={
                  mine
                    ? { backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '14px 14px 4px 14px' }
                    : { backgroundColor: '#fff', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px' }
                }
              >
                {m.body}
              </div>
            </div>
          )
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (composingRef.current) return
          void submit()
        }}
        className="flex items-center gap-2 border-t pt-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={() => { composingRef.current = false }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            if (e.nativeEvent.isComposing || composingRef.current) return
            e.preventDefault()
            void submit()
          }}
          placeholder="メッセージを入力…"
          className="min-w-0 flex-1 border bg-white px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex size-10 shrink-0 items-center justify-center text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-label="送信"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
