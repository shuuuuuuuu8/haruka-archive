import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// サーバー側（Server Component / Server Action）用の MUSUBI Supabase クライアント。
export async function createBuyerServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component から呼ばれた場合は無視（middleware でセッション更新）
          }
        },
      },
    }
  )
}
