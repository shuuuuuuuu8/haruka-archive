'use server'

import { redirect } from 'next/navigation'
import { createBuyerServerClient } from '@/lib/buyer/server'

export type ResetState = { error?: string }

export async function buyerResetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const password = formData.get('password')?.toString() ?? ''
  const confirm = formData.get('password_confirm')?.toString() ?? ''
  if (password.length < 8) return { error: 'パスワードは8文字以上で入力してください' }
  if (password !== confirm) return { error: 'パスワードが一致しません' }

  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: '再設定の有効期限が切れています。お手数ですが、もう一度メールの送信からやり直してください' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'パスワードの更新に失敗しました。もう一度お試しください' }

  redirect('/materials')
}
