import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/notify/service-client'

// 一時的なデバッグ用。来歴ページ閲覧の events 書き込みが通るか確認する。
// 使い終わったら削除する。?secret=musubi-debug-2026 で軽く保護。
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== 'musubi-debug-2026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const hasKey = !!process.env.MUSUBI_SERVICE_ROLE_KEY
  const keyHint = process.env.MUSUBI_SERVICE_ROLE_KEY
    ? `${process.env.MUSUBI_SERVICE_ROLE_KEY.slice(0, 10)}…(len ${process.env.MUSUBI_SERVICE_ROLE_KEY.length})`
    : '(none)'
  const hasUrl = !!process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL

  let insertResult: unknown = 'skipped'
  let countResult: unknown = 'skipped'

  if (hasKey && hasUrl) {
    try {
      const supabase = createServiceClient()
      const ins = await supabase.from('events').insert({
        type: 'provenance_viewed',
        subject_type: 'material',
        payload: { debug: true },
      })
      insertResult = ins.error ? { error: ins.error.message, code: ins.error.code } : 'ok'

      const cnt = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'provenance_viewed')
      countResult = cnt.error ? { error: cnt.error.message } : { count: cnt.count }
    } catch (e) {
      insertResult = { thrown: String(e) }
    }
  }

  return NextResponse.json({ hasKey, keyHint, hasUrl, insertResult, countResult })
}
