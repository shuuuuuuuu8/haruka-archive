'use server'

import { createServiceClient } from '@/lib/notify/service-client'

// 来歴ページの閲覧を events に記録する（検証用：誰が物語を見たか）。
// events への書き込みは service role 経由（クライアント直書きは設計上不可）。
// 失敗しても画面には影響させない（握りつぶす）。
export async function logProvenanceView(materialUuid: string, displayId: string) {
  if (!materialUuid) return
  if (!process.env.MUSUBI_SERVICE_ROLE_KEY) return // 未設定環境では何もしない
  try {
    const supabase = createServiceClient()
    await supabase.from('events').insert({
      type: 'provenance_viewed',
      actor_role: null,
      subject_type: 'material',
      subject_id: materialUuid,
      payload: { display_id: displayId },
    })
  } catch {
    // 計測失敗は無視
  }
}
