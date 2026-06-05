'use server'

import { headers } from 'next/headers'
import { createBuyerServerClient } from '@/lib/buyer/server'

export type ForgotState = { error?: string; success?: boolean; email?: string }

export async function buyerForgotPasswordAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const email = formData.get('email')?.toString()?.trim()
  if (!email || !email.includes('@')) {
    return { error: 'メールアドレスの形式が正しくありません', email }
  }

  const headerList = await headers()
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${headerList.get('host') ?? 'www.musubi-sozaibank.com'}`
  const redirectTo = `${origin}/account/auth/callback?next=/account/reset-password`

  const supabase = await createBuyerServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  // 存在の有無を伏せるため、レート制限以外は成功扱い
  if (error && error.message.includes('rate')) {
    return { error: 'メール送信の上限に達しました。しばらくしてから再度お試しください', email }
  }
  return { success: true, email }
}
