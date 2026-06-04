import { createBuyerServerClient } from './server'

export type CurrentBuyer = {
  userId: string
  email: string | null
  displayName: string
  buyerId: string | null
}

// 現在ログイン中の買い手を返す（未ログインなら null）。
export async function getCurrentBuyer(): Promise<CurrentBuyer | null> {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // buyer_profiles を引く（提供元アカウントの場合は profile が無いので buyerId=null）
  const { data: profile } = await supabase
    .from('buyer_profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName:
      profile?.display_name ??
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'ゲスト',
    buyerId: profile?.id ?? null,
  }
}
