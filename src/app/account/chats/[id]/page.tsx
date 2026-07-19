import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createBuyerServerClient } from '@/lib/buyer/server'
import { ChatThread, type ChatMessage } from '@/components/materials/ChatThread'

export const metadata = { title: '相談チャット' }

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/account/login?next=${encodeURIComponent(`/account/chats/${id}`)}`)

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, status, material_id, materials(name), buyer_profiles(display_name), supplier_profiles(display_name)')
    .eq('id', id)
    .maybeSingle()

  if (!conversation) redirect('/account/chats')

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, sender_role, body, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const materialName =
    (conversation.materials as { name?: string } | null)?.name ?? '素材'
  const buyerName =
    (conversation.buyer_profiles as { display_name?: string } | null)?.display_name ?? 'あなた'
  const supplierName =
    (conversation.supplier_profiles as { display_name?: string } | null)?.display_name ?? '提供元'

  return (
    <main className="pt-16" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <Link href="/account/chats" className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
            <ArrowLeft size={14} />
            相談一覧
          </Link>
          <Link href={`/materials`} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            素材を探す
          </Link>
        </div>
        <div className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>相談中の素材</p>
          <h1 className="font-serif text-lg">{materialName}</h1>
        </div>

        <ChatThread
          conversationId={conversation.id}
          currentUserId={user.id}
          initialMessages={(messages ?? []) as ChatMessage[]}
          buyerName={buyerName}
          supplierName={supplierName}
        />
      </div>
    </main>
  )
}
