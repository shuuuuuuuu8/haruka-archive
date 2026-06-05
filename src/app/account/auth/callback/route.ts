import { NextResponse, type NextRequest } from 'next/server'
import { createBuyerServerClient } from '@/lib/buyer/server'

// パスワード再設定メール等のコールバック。code をセッションに交換する。
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/account/chats'

  if (code) {
    const supabase = await createBuyerServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/account/login?error=auth`)
}
