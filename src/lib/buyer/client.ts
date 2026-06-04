import { createBrowserClient } from '@supabase/ssr'

// 買い手の認証は、素材・会話と同じ MUSUBI Supabase（nzlxwskzszpscnbjkqfn）で行う。
// 認証とデータが同一プロジェクトに無いと RLS（auth.uid()）が機能しないため。
export function createBuyerClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_ANON_KEY!
  )
}
