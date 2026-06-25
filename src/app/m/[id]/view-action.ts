'use server'

import { createServiceClient } from '@/lib/notify/service-client'
import { createBuyerServerClient } from '@/lib/buyer/server'

// 来歴ページの閲覧を events に記録する（検証用：誰が物語を見たか）。
// 「全員を識別」: 端末ごとの匿名訪問者ID(クライアントのlocalStorage発行) + ログイン中なら buyer_id。
// 個人名は匿名通行人には取れない（取ろうとすると閲覧自体が消える）ため、
// 同一人物判定できる匿名IDで実訪問者数を、会員は実名で追えるようにする。
// events への書き込みは service role 経由。失敗しても画面には影響させない。
export async function logProvenanceView(materialUuid: string, displayId: string, visitorId: string) {
  if (!materialUuid) return
  if (!process.env.MUSUBI_SERVICE_ROLE_KEY) return

  try {
    // ログイン中なら買い手を特定（実名で追える）
    let buyerId: string | null = null
    let buyerName: string | null = null
    try {
      const buyer = await createBuyerServerClient()
      const {
        data: { user },
      } = await buyer.auth.getUser()
      if (user) {
        const { data: profile } = await buyer
          .from('buyer_profiles')
          .select('id, display_name')
          .eq('user_id', user.id)
          .maybeSingle()
        buyerId = profile?.id ?? null
        buyerName = profile?.display_name ?? null
      }
    } catch {
      // 未ログインや取得失敗は匿名扱い
    }

    const supabase = createServiceClient()
    await supabase.from('events').insert({
      type: 'provenance_viewed',
      actor_role: buyerId ? 'buyer' : null,
      subject_type: 'material',
      subject_id: materialUuid,
      payload: {
        display_id: displayId,
        visitor_id: visitorId,
        buyer_id: buyerId,
        buyer_name: buyerName,
      },
    })
  } catch {
    // 計測失敗は無視
  }
}
