'use server'

import { createBuyerServerClient } from '@/lib/buyer/server'
import { ensureBuyerProfile } from '@/lib/buyer/auth'

export type RequestState = { ok?: boolean; error?: string }

// 買い手の需要（欲しい素材）を登録する。匿名OK。ログイン中なら buyer_id を紐づける。
export async function submitMaterialRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const query = String(formData.get('query') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()
  const contact = String(formData.get('contact') ?? '').trim()
  if (!query) return { error: '探している素材を入力してください' }

  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let buyerId: string | null = null
  if (user) buyerId = await ensureBuyerProfile(supabase, user)

  const { error } = await supabase.from('material_requests').insert({
    buyer_id: buyerId,
    query: query.slice(0, 500),
    note: note ? note.slice(0, 2000) : null,
    contact: contact || null,
  })
  if (error) return { error: '送信に失敗しました。しばらくしてから再度お試しください' }

  return { ok: true }
}
