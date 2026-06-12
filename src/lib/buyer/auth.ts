import { createBuyerServerClient } from './server'

type BuyerClient = Awaited<ReturnType<typeof createBuyerServerClient>>

export type CurrentBuyer = {
  userId: string
  email: string | null
  displayName: string
  buyerId: string | null
}

/**
 * 買い手プロフィールを保証する（無ければ作る＝自己修復）。
 * これで「提供元として作ったアカウントでも、買い手サイトにログインすれば買い手として使える」。
 * buyer_profiles と supplier_profiles は別テーブルなので、1アカウントが両方を兼ねられる。
 */
export async function ensureBuyerProfile(
  supabase: BuyerClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('buyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing?.id) return existing.id

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'ゲスト'
  const { data: created } = await supabase
    .from('buyer_profiles')
    .upsert({ user_id: user.id, display_name: displayName }, { onConflict: 'user_id' })
    .select('id')
    .single()
  return created?.id ?? null
}

// 現在ログイン中の買い手を返す（未ログインなら null）。プロフィールが無ければ作る。
export async function getCurrentBuyer(): Promise<CurrentBuyer | null> {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const buyerId = await ensureBuyerProfile(supabase, user)

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName:
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'ゲスト',
    buyerId,
  }
}
