'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle } from 'lucide-react'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  materialName?: string
  referenceId?: string
}

interface FormData {
  company: string
  name: string
  email: string
  usage: string
  quantity: string
  message: string
}

const INITIAL_FORM: FormData = {
  company: '',
  name: '',
  email: '',
  usage: '',
  quantity: '',
  message: '',
}

export default function InquiryModal({ isOpen, onClose, materialName, referenceId }: InquiryModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setForm(INITIAL_FORM)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
          >
            {submitted ? (
              <div
                className="h-full flex flex-col items-center justify-center p-12 text-center relative"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(155,123,60,0.06) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(201,169,110,0.06) 0%, transparent 50%)
                  `,
                }}
              >
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                >
                  <CheckCircle size={40} className="mx-auto mb-6" style={{ color: 'var(--accent)' }} />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
                    お問い合わせを受け付けました
                  </p>
                  <h2 className="text-3xl font-serif font-light leading-relaxed mb-6" style={{ color: 'var(--text)' }}>
                    遙から<br />ご連絡します
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    担当者が内容を確認の上、<br />
                    2営業日以内にご連絡いたします。<br /><br />
                    素材との出会いが、<br />
                    新たな物語の始まりとなりますように。
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-0 right-0 text-center"
                >
                  <p className="text-[9px] tracking-widest" style={{ color: 'var(--accent-light)' }}>
                    — 合同会社遙 —
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
                      Sample Request / Inquiry
                    </p>
                    <h2 className="text-2xl font-serif font-light" style={{ color: 'var(--text)' }}>
                      サンプル請求・問い合わせ
                    </h2>
                    {materialName && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {referenceId && <span className="mr-1">{referenceId} ·</span>}
                        {materialName}
                      </p>
                    )}
                  </div>
                  <button onClick={handleClose} style={{ color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <p className="text-[10px] tracking-wider mb-8 pb-6 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                  閲覧・検索は完全無料。問い合わせは遙経由のみ。
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {(
                    [
                      { key: 'company', label: '企業・団体名', type: 'text', required: true },
                      { key: 'name', label: 'ご担当者名', type: 'text', required: true },
                      { key: 'email', label: 'メールアドレス', type: 'email', required: true },
                    ] as const
                  ).map(({ key, label, type, required }) => (
                    <div key={key}>
                      <label className="block text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        {label}{required && <span className="ml-1 text-red-500">*</span>}
                      </label>
                      <input
                        type={type ?? 'text'}
                        required={required}
                        value={form[key as keyof FormData]}
                        onChange={update(key as keyof FormData)}
                        className="w-full text-sm p-3 border bg-transparent outline-none transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      用途・目的
                    </label>
                    <select
                      value={form.usage}
                      onChange={update('usage')}
                      className="w-full text-sm p-3 border bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: form.usage ? 'var(--text)' : 'var(--text-muted)' }}
                    >
                      <option value="">選択してください</option>
                      <option value="fashion">ファッション・テキスタイル</option>
                      <option value="interior">インテリア・建材</option>
                      <option value="product">プロダクトデザイン</option>
                      <option value="research">研究・教育</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      希望数量（目安）
                    </label>
                    <input
                      type="text"
                      placeholder="例：サンプル1m / 約50m"
                      value={form.quantity}
                      onChange={update('quantity')}
                      className="w-full text-sm p-3 border bg-transparent outline-none transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      メッセージ
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={update('message')}
                      className="w-full text-sm p-3 border bg-transparent outline-none resize-none transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        送信する
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
