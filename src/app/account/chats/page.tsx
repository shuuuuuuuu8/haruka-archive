import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { createBuyerServerClient } from '@/lib/buyer/server'

export const metadata = { title: '相談一覧' }

const STATUS_LABEL: Record<string, string> = {
  open: '相談中',
  negotiating: '交渉中',
  deal: '成約',
  closed: '終了',
}

export default async function ChatsListPage() {
  const supabase = await createBuyerServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/account/login?next=/account/chats')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, status, updated_at, materials(name)')
    .order('updated_at', { ascending: false })

  return (
    <main className="min-h-screen pt-20" style={{ backgroundColor: '#fbfaf7' }}>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="font-serif text-2xl">相談一覧</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          提供元とのやり取りがここに表示されます。
        </p>

        <div className="mt-6 space-y-2">
          {(!conversations || conversations.length === 0) && (
            <div className="border bg-white px-4 py-12 text-center" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだ相談はありません。</p>
              <Link href="/materials" className="mt-4 inline-block border px-4 py-2 text-xs" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                素材を探す
              </Link>
            </div>
          )}
          {conversations?.map((c) => {
            const name = (c.materials as { name?: string } | null)?.name ?? '素材'
            return (
              <Link
                key={c.id}
                href={`/account/chats/${c.id}`}
                className="flex items-center justify-between gap-3 border bg-white px-4 py-3 transition-colors hover:bg-[var(--accent-pale)]"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
                  <span className="line-clamp-1 font-serif text-sm" style={{ color: 'var(--text)' }}>{name}</span>
                </div>
                <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
