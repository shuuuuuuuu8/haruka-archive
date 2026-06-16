import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/notify/service-client'

// 提供元アプリのURL（提供元のチャットはこちら）
const SUPPLIER_SITE = process.env.SUPPLIER_SITE_URL ?? 'https://musubi-sozai.vercel.app'
const FROM = process.env.NOTIFY_FROM_EMAIL ?? 'onboarding@resend.dev'

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[notify] RESEND_API_KEY 未設定。送信スキップ')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) console.error('[notify] Resend送信失敗', res.status, await res.text())
}

// Supabase Database Webhook（messages への INSERT）から呼ばれる。
// 送信者と反対側（買い手⇄提供元）にメールで新着を知らせる。
export async function POST(req: NextRequest) {
  if (req.headers.get('x-webhook-secret') !== process.env.NOTIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  const record = payload?.record as
    | { conversation_id?: string; sender_role?: string; body?: string }
    | undefined
  if (!record?.conversation_id) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, materials(name), buyer_profiles(user_id), supplier_profiles(user_id)')
    .eq('id', record.conversation_id)
    .single()
  if (!conv) return NextResponse.json({ ok: true })

  const materialName = (conv.materials as { name?: string } | null)?.name ?? '素材'
  const buyerUserId = (conv.buyer_profiles as { user_id?: string } | null)?.user_id
  const supplierUserId = (conv.supplier_profiles as { user_id?: string } | null)?.user_id
  const buyerSite = new URL(req.url).origin // この受け口は買い手サイト上にある

  // 送信者の反対側に通知（admin発は両者へ）
  const targets: Array<{ userId: string; link: string }> = []
  if (record.sender_role === 'buyer' && supplierUserId) {
    targets.push({ userId: supplierUserId, link: `${SUPPLIER_SITE}/chats/${conv.id}` })
  } else if (record.sender_role === 'supplier' && buyerUserId) {
    targets.push({ userId: buyerUserId, link: `${buyerSite}/account/chats/${conv.id}` })
  } else if (record.sender_role === 'admin') {
    if (buyerUserId) targets.push({ userId: buyerUserId, link: `${buyerSite}/account/chats/${conv.id}` })
    if (supplierUserId) targets.push({ userId: supplierUserId, link: `${SUPPLIER_SITE}/chats/${conv.id}` })
  }

  const snippet = escapeHtml(String(record.body ?? '').slice(0, 120))
  const name = escapeHtml(materialName)

  for (const t of targets) {
    const { data } = await supabase.auth.admin.getUserById(t.userId)
    const email = data?.user?.email
    if (!email) continue
    await sendEmail(
      email,
      `【結 素材バンク】「${materialName}」に新しいメッセージ`,
      `<div style="font-family:sans-serif;line-height:1.8;color:#1a1a1a">
        <p>「<strong>${name}</strong>」のやり取りに新しいメッセージが届きました。</p>
        <blockquote style="margin:12px 0;padding:8px 14px;border-left:3px solid #c49a5a;color:#555">${snippet}</blockquote>
        <p><a href="${t.link}" style="color:#b3672a">メッセージを確認する →</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="font-size:12px;color:#999">結 素材バンク</p>
      </div>`,
    )
  }

  return NextResponse.json({ ok: true })
}
