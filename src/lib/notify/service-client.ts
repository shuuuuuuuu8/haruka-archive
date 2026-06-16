import { createClient } from '@supabase/supabase-js'

// サービスロールの MUSUBI Supabase クライアント（サーバー限定・RLSをバイパス）。
// 相手の連絡先(auth.users.email)取得など、管理操作にのみ使う。
// SUPABASE_SERVICE_ROLE_KEY は絶対にクライアントへ出さない（NEXT_PUBLIC_を付けない）。
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL!,
    process.env.MUSUBI_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
