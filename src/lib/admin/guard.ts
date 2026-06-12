import { redirect } from 'next/navigation'
import { createBuyerServerClient } from '@/lib/buyer/server'

/**
 * 管理者(遙)ゲート。サーバー側でのみ呼ぶ。
 * - 未ログイン            → ログインへ
 * - ログイン済みbut非管理者 → トップへ（管理画面の存在を匂わせない）
 * 管理者判定は DB の is_admin()（admins テーブル参照・SECURITY DEFINER）に委ねる。
 * 認証されたユーザー自身のセッションで書くため service role キーは使わない（漏れる鍵がない）。
 */
export async function requireAdmin(next = '/admin') {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`)

  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error || !isAdmin) redirect('/')

  return { supabase, user }
}
