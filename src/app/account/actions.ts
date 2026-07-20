'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createBuyerServerClient } from '@/lib/buyer/server'
import { ensureBuyerProfile } from '@/lib/buyer/auth'

export type AuthState = {
  error?: string
  fields?: { display_name?: string; email?: string }
}

// オープンリダイレクト防止：サイト内の相対パスのみ許可
function safeNext(next: string | undefined): string {
  // オープンリダイレクト対策: サイト内の相対パスのみ許可。
  // "//evil.com"（プロトコル相対）や "/\evil.com" は外部遷移になるため弾く。
  if (
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/\\')
  ) {
    return next
  }
  return '/materials'
}

// 英語エラーを日本語へ
function jaError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'メールアドレスまたはパスワードが正しくありません'
  if (message.includes('already registered') || message.includes('already been registered')) return 'このメールアドレスは既に登録されています'
  if (message.includes('Password should be at least')) return 'パスワードは6文字以上で入力してください'
  if (message.includes('Email not confirmed')) return 'メールアドレスが確認されていません'
  return 'エラーが発生しました。しばらくしてから再度お試しください'
}

const signupSchema = z.object({
  display_name: z.string().trim().min(1, { message: 'お名前を入力してください' }).max(100),
  email: z.string().email({ message: 'メールアドレスの形式が正しくありません' }),
  password: z.string().min(8, { message: 'パスワードは8文字以上で入力してください' }),
})

export async function buyerSignupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const next = safeNext(formData.get('next')?.toString())
  const raw = {
    display_name: formData.get('display_name')?.toString(),
    email: formData.get('email')?.toString(),
  }
  const parsed = signupSchema.safeParse({
    display_name: raw.display_name,
    email: raw.email,
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください', fields: raw }
  }

  const supabase = await createBuyerServerClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // role=buyer を渡すと DBトリガーが buyer_profiles を自動作成する
      data: { role: 'buyer', display_name: parsed.data.display_name },
    },
  })
  if (error) return { error: jaError(error.message), fields: raw }

  // メール確認オフならセッションあり → そのまま続行。オンなら確認案内へ。
  if (!data.session) {
    redirect(`/account/check-email?email=${encodeURIComponent(parsed.data.email)}`)
  }
  redirect(next)
}

const loginSchema = z.object({
  email: z.string().email({ message: 'メールアドレスの形式が正しくありません' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
})

export async function buyerLoginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const next = safeNext(formData.get('next')?.toString())
  const email = formData.get('email')?.toString()
  const parsed = loginSchema.safeParse({ email, password: formData.get('password') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください', fields: { email } }
  }

  const supabase = await createBuyerServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) return { error: jaError(error.message), fields: { email } }

  // 注意: ここ（ログイン直後のアクション内）はまだ anon ロールで DB クエリが走るため、
  // 買い手プロフィールの用意は Header→ensureBuyerProfileAction（認証済みリクエスト）で行う。
  redirect(next)
}

// 買い手プロフィールが無ければ作る（Header から呼ぶ＝認証済みリクエストで確実に動く）。
// 提供元として作ったアカウントでも、買い手サイトを開けば買い手プロフィールが用意される。
export async function ensureBuyerProfileAction(): Promise<void> {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await ensureBuyerProfile(supabase, user)
}

export async function buyerLogoutAction() {
  const supabase = await createBuyerServerClient()
  await supabase.auth.signOut()
  redirect('/materials')
}
