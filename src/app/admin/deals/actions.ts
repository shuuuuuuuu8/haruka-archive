'use server'

import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/guard'

export type CreateDealState = {
  error?: string
  fieldErrors?: Record<string, string>
}

// 成約(deal)を記録する。手数料・送金額は deals の生成列が自動計算するので渡さない。
export async function createDeal(
  _prev: CreateDealState,
  formData: FormData,
): Promise<CreateDealState> {
  // 壁2: 書き込み前にもサーバー側で管理者を再確認（クライアントを一切信用しない）
  const { supabase } = await requireAdmin('/admin/deals/new')

  const material_id = String(formData.get('material_id') ?? '').trim()
  const buyer_id = String(formData.get('buyer_id') ?? '').trim()
  const origin = String(formData.get('origin') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()
  const amount = Number(formData.get('amount'))
  const quantity = Number(formData.get('quantity') ?? '1')

  const fieldErrors: Record<string, string> = {}
  if (!material_id) fieldErrors.material_id = '素材を選択してください'
  if (!buyer_id) fieldErrors.buyer_id = '買い手を選択してください'
  if (origin !== 'chat' && origin !== 'instant') fieldErrors.origin = '成約経路を選択してください'
  if (!Number.isInteger(amount) || amount <= 0) fieldErrors.amount = '成約金額は正の整数（円）で入力してください'
  if (!Number.isInteger(quantity) || quantity < 1) fieldErrors.quantity = '数量は1以上で入力してください'
  if (note.length > 2000) fieldErrors.note = '覚書は2000文字以内で入力してください'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // supplier_id はクライアント値を信用せず、必ず素材から引く
  const { data: material } = await supabase
    .from('materials')
    .select('supplier_id')
    .eq('id', material_id)
    .maybeSingle()
  if (!material) return { error: '指定の素材が見つかりません' }

  const { error } = await supabase.from('deals').insert({
    material_id,
    supplier_id: material.supplier_id,
    buyer_id,
    origin,
    quantity,
    amount,
    note: note || null,
    // commission_amount / payout_amount は生成列。status は既定 'agreed'。
  })
  if (error) return { error: `記録に失敗しました（${error.message}）` }

  redirect('/admin?created=1')
}
