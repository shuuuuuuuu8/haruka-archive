'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createBuyerServerClient } from '@/lib/buyer/server'

// 素材について会話を開始（既存があればそれを返す）。未ログインならログインへ。
// materialUuid は素材バンクの本物のUUID（Material.sourceId）。
export async function startConversation(materialUuid: string, backTo: string) {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/account/login?next=${encodeURIComponent(backTo)}`)
  }

  // 買い手プロフィール（無ければ自己修復で作成）
  let { data: buyer } = await supabase
    .from('buyer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!buyer) {
    const displayName =
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split('@')[0] ??
      'ゲスト'
    const { data: created } = await supabase
      .from('buyer_profiles')
      .upsert({ user_id: user.id, display_name: displayName }, { onConflict: 'user_id' })
      .select('id')
      .single()
    buyer = created
  }

  if (!buyer) {
    // それでも作成できない場合のみログインへ
    redirect(`/account/login?next=${encodeURIComponent(backTo)}`)
  }

  // 素材から提供元を引く
  const { data: material } = await supabase
    .from('materials')
    .select('supplier_id')
    .eq('id', materialUuid)
    .maybeSingle()
  if (!material) {
    redirect(backTo)
  }

  // 既存スレッド（material × buyer は一意）
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('material_id', materialUuid)
    .eq('buyer_id', buyer.id)
    .maybeSingle()

  let conversationId = existing?.id
  if (!conversationId) {
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        material_id: materialUuid,
        buyer_id: buyer.id,
        supplier_id: material.supplier_id,
      })
      .select('id')
      .single()
    if (error || !created) {
      redirect(backTo)
    }
    conversationId = created.id
  }

  redirect(`/account/chats/${conversationId}`)
}

// メッセージ送信（買い手）。
export async function sendBuyerMessage(conversationId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return { error: 'メッセージを入力してください' }

  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: 'buyer',
    body: trimmed.slice(0, 4000),
  })
  if (error) return { error: '送信に失敗しました。もう一度お試しください' }

  revalidatePath(`/account/chats/${conversationId}`)
  return {}
}
