'use client'

import { useActionState, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { createDeal, type CreateDealState } from '../actions'

export type MaterialOpt = {
  id: string
  name: string
  price: number | null
  supplier_id: string
  supplier_profiles: { display_name: string } | null
}
export type BuyerOpt = {
  id: string
  display_name: string
  company_name: string | null
}

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP')

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {pending ? '記録中…' : 'この内容で成約を記録'}
    </button>
  )
}

const inputCls = 'w-full border bg-white px-3 py-2.5 text-sm outline-none'
const labelCls = 'block text-xs mb-1.5'

export default function NewDealForm({
  materials,
  buyers,
}: {
  materials: MaterialOpt[]
  buyers: BuyerOpt[]
}) {
  const [state, formAction] = useActionState<CreateDealState, FormData>(createDeal, {})
  const [materialId, setMaterialId] = useState('')
  const [amount, setAmount] = useState('')
  const fe = state.fieldErrors ?? {}

  const priceMap = useMemo(() => {
    const m = new Map<string, number | null>()
    materials.forEach((x) => m.set(x.id, x.price))
    return m
  }, [materials])

  // 手数料(10%)のライブ計算
  const amountNum = Number(amount)
  const valid = Number.isInteger(amountNum) && amountNum > 0
  const commission = valid ? Math.round(amountNum * 0.1) : 0
  const payout = valid ? amountNum - commission : 0

  return (
    <main className="min-h-screen pt-20" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <Link href="/admin" className="text-xs underline" style={{ color: 'var(--accent)' }}>
          ← 管理ダッシュボードへ
        </Link>
        <h1 className="mt-3 font-serif text-2xl" style={{ color: 'var(--text)' }}>
          成約を記録
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          成立した取引を記録します。手数料（10%）と提供元への送金額は自動計算されます。
        </p>

        {materials.length === 0 && (
          <p className="mt-4 border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            公開中の素材がありません。
          </p>
        )}

        {state.error && (
          <p role="alert" className="mt-4 border px-3 py-2 text-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-pale)' }}>
            {state.error}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-5">
          {/* 素材 */}
          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>素材</label>
            <select
              name="material_id"
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value)
                const p = priceMap.get(e.target.value)
                if (p != null && !amount) setAmount(String(p))
              }}
              className={inputCls}
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <option value="">— 素材を選択 —</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.supplier_profiles?.display_name ? `（${m.supplier_profiles.display_name}）` : ''}
                  {m.price != null ? ` ・定価${yen(m.price)}` : ''}
                </option>
              ))}
            </select>
            {fe.material_id && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.material_id}</p>}
          </div>

          {/* 買い手 */}
          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>買い手</label>
            <select name="buyer_id" className={inputCls} style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="">— 買い手を選択 —</option>
              {buyers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.display_name}
                  {b.company_name ? `（${b.company_name}）` : ''}
                </option>
              ))}
            </select>
            {fe.buyer_id && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.buyer_id}</p>}
          </div>

          {/* 成約経路・数量 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--text-muted)' }}>成約経路</label>
              <select name="origin" defaultValue="chat" className={inputCls} style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="chat">相談から成約</option>
                <option value="instant">即成約</option>
              </select>
              {fe.origin && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.origin}</p>}
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--text-muted)' }}>数量</label>
              <input name="quantity" type="number" min={1} defaultValue={1} className={inputCls} style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
              {fe.quantity && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.quantity}</p>}
            </div>
          </div>

          {/* 成約金額 */}
          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>成約金額（円・税込）</label>
            <input
              name="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例: 45000"
              className={inputCls}
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            {fe.amount && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.amount}</p>}
          </div>

          {/* 手数料プレビュー */}
          {valid && (
            <div className="border px-4 py-3 text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>手数料（10%・遙の売上）</span>
                <span style={{ color: 'var(--accent)' }}>{yen(commission)}</span>
              </div>
              <div className="mt-1 flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>提供元への送金</span>
                <span style={{ color: 'var(--text)' }}>{yen(payout)}</span>
              </div>
            </div>
          )}

          {/* 覚書 */}
          <div>
            <label className={labelCls} style={{ color: 'var(--text-muted)' }}>覚書（任意）</label>
            <textarea name="note" rows={2} placeholder="成約の経緯など" className={inputCls} style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            {fe.note && <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{fe.note}</p>}
          </div>

          <Submit />
        </form>
      </div>
    </main>
  )
}
