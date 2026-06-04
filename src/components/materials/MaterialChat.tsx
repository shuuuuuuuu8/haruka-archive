'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Send, X } from 'lucide-react'
import type { Material } from '@/types/material'

type Recommendation = { id: string; reason: string }
type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  recommendations?: Recommendation[]
}

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'こんにちは。素材さがしのお手伝いをします。「赤い帯でバッグを作りたい」「白い反物を探している」など、作りたいものや好みの色・雰囲気を教えてください。',
}

const SUGGESTIONS = [
  '赤い帯でバッグを作りたい',
  '白っぽい反物を探している',
  'アクセサリー向けの古布はある？',
]

export default function MaterialChat({
  materials,
  open,
  onClose,
}: {
  materials: Material[]
  open: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  // IME（日本語変換）中かどうか。変換確定のEnterで誤送信しないために使う。
  const composingRef = useRef(false)

  const byId = useMemo(() => {
    const map = new Map<string, Material>()
    for (const m of materials) map.set(m.id, m)
    return map
  }, [materials])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // 背景スクロールを止める
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/material-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      })
      if (!res.ok) throw new Error('failed')
      const data = (await res.json()) as {
        reply: string
        recommendations: Recommendation[]
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'ご希望に近い素材をお探ししました。',
          recommendations: data.recommendations,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '申し訳ありません。うまくお返事できませんでした。少し時間をおいて、もう一度お試しください。',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-4">
      {/* 背景 */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="閉じる"
      />

      {/* パネル */}
      <div
        className="relative flex w-full flex-col bg-white shadow-xl sm:max-w-lg sm:rounded-lg"
        style={{ height: '100dvh', maxHeight: '100dvh' }}
      >
        <div className="sm:max-h-[80vh] flex h-full flex-col sm:h-auto">
          {/* ヘッダー */}
          <div
            className="flex shrink-0 items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex size-8 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}
              >
                <Sparkles size={16} />
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  AIに相談して探す
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  登録素材の中からご提案します
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="p-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* 会話 */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            style={{ backgroundColor: '#fbfaf7' }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={
                    msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }
                >
                  <div
                    className="max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-6"
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '14px 14px 4px 14px' }
                        : { backgroundColor: '#fff', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px' }
                    }
                  >
                    {msg.content}
                  </div>
                </div>

                {/* おすすめ素材カード */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.recommendations.map((rec) => {
                      const material = byId.get(rec.id)
                      if (!material) return null
                      return (
                        <a
                          key={rec.id}
                          href={`/materials/${material.id}`}
                          className="flex gap-3 border bg-white p-2 transition-colors hover:bg-[var(--accent-pale)]"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div
                            className="size-16 shrink-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${material.images[0]})` }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                              {material.category} / {material.materialType}
                            </p>
                            <p className="line-clamp-1 font-serif text-sm" style={{ color: 'var(--text)' }}>
                              {material.name}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-5" style={{ color: 'var(--accent)' }}>
                              {rec.reason}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 px-3.5 py-2.5"
                  style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px' }}
                >
                  <span className="size-1.5 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0ms' }} />
                  <span className="size-1.5 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '150ms' }} />
                  <span className="size-1.5 animate-bounce rounded-full" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* 最初だけ候補チップ */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="border px-3 py-1.5 text-xs transition-colors hover:bg-white"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: '#fff' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 入力 */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // 変換確定中は送信しない
              if (composingRef.current) return
              send(input)
            }}
            className="flex shrink-0 items-center gap-2 border-t p-3"
            style={{ borderColor: 'var(--border)', backgroundColor: '#fff' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => { composingRef.current = true }}
              onCompositionEnd={() => { composingRef.current = false }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                // 日本語変換中のEnterは「確定」。送信せずIMEに任せる。
                if (e.nativeEvent.isComposing || composingRef.current) return
                e.preventDefault()
                send(input)
              }}
              placeholder="作りたいものや好みを入力…"
              className="min-w-0 flex-1 border bg-white px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex size-10 shrink-0 items-center justify-center text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
              aria-label="送信"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
