import Link from 'next/link'
import { LayoutDashboard, Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/admin/guard'
import DeleteDealButton from './deals/DeleteDealButton'

export const metadata = { title: '管理ダッシュボード' }

const STATUS_LABEL: Record<string, string> = {
  proposed: '提案中',
  agreed: '成約',
  awaiting_payment: '入金待ち',
  paid_held: 'エスクロー保留',
  shipped: '発送済み',
  received: '受取確認',
  released: '送金済み',
  completed: '完了',
  cancelled: 'キャンセル',
  refunded: '返金済み',
  disputed: '紛争中',
}

const yen = (n: number) => '¥' + n.toLocaleString('ja-JP')

type DealRow = {
  id: string
  amount: number
  commission_amount: number
  payout_amount: number
  status: string
  origin: string
  quantity: number
  created_at: string
  materials: { name: string } | null
  buyer_profiles: { display_name: string } | null
  supplier_profiles: { display_name: string } | null
}

type RequestRow = {
  id: string
  query: string
  note: string | null
  contact: string | null
  status: string
  created_at: string
  buyer_profiles: { display_name: string } | null
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="text-[10px] tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-serif font-light" style={{ color: 'var(--accent)' }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin()

  const { data } = await supabase
    .from('deals')
    .select(
      'id, amount, commission_amount, payout_amount, status, origin, quantity, created_at, materials(name), buyer_profiles(display_name), supplier_profiles(display_name)',
    )
    .order('created_at', { ascending: false })

  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })

  const { data: requestsData } = await supabase
    .from('material_requests')
    .select('id, query, note, contact, status, created_at, buyer_profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(50)
  const requests = (requestsData ?? []) as unknown as RequestRow[]

  // 来歴ページ閲覧（検証：誰が・どの素材の物語を見たか）
  const { data: viewEvents } = await supabase
    .from('events')
    .select('subject_id, payload, created_at')
    .eq('type', 'provenance_viewed')
    .order('created_at', { ascending: false })
    .limit(2000)

  type ViewEv = {
    subject_id: string | null
    payload: { display_id?: string; visitor_id?: string; buyer_name?: string | null } | null
    created_at: string
  }
  const views = (viewEvents ?? []) as ViewEv[]
  const provenanceViews = views.length // 延べ閲覧
  const uniqueVisitors = new Set(
    views.map((v) => v.payload?.visitor_id).filter(Boolean),
  ).size // 実訪問者数

  // 素材別の閲覧集計（延べ・実訪問者）
  const byMaterial = new Map<string, { display: string; total: number; visitors: Set<string> }>()
  for (const v of views) {
    const key = v.subject_id ?? 'unknown'
    const cur = byMaterial.get(key) ?? { display: v.payload?.display_id ?? key, total: 0, visitors: new Set<string>() }
    cur.total += 1
    if (v.payload?.visitor_id) cur.visitors.add(v.payload.visitor_id)
    byMaterial.set(key, cur)
  }
  const materialRanking = [...byMaterial.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)

  // 会員（ログイン中の買い手）による閲覧（実名で追える）
  const memberViews = views
    .filter((v) => v.payload?.buyer_name)
    .slice(0, 30)

  const deals = (data ?? []) as unknown as DealRow[]
  // GMV・手数料はキャンセル/返金を除いた有効取引で集計
  const active = deals.filter((d) => !['cancelled', 'refunded'].includes(d.status))
  const gmv = active.reduce((s, d) => s + d.amount, 0)
  const commission = active.reduce((s, d) => s + d.commission_amount, 0)
  const convCount = conversationCount ?? 0
  const cvr = convCount > 0 ? Math.round((active.length / convCount) * 1000) / 10 : 0

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* ヘッダー */}
      <div className="border-b pt-20 pb-6 px-4 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <h1 className="text-2xl font-serif font-light flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <LayoutDashboard size={20} style={{ color: 'var(--accent)' }} />
            管理ダッシュボード
          </h1>
          <Link
            href="/admin/deals/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={14} /> 成約を記録
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* KPI */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>経営数字</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="GMV（流通総額）" value={yen(gmv)} sub={`有効成約 ${active.length} 件`} />
            <StatCard label="手数料売上（10%）" value={yen(commission)} sub="遙の売上" />
            <StatCard label="成約数" value={active.length} sub={`全 ${deals.length} 件中`} />
            <StatCard label="成約率" value={`${cvr}%`} sub={`相談 ${convCount} 件 → 成約`} />
            <StatCard label="来歴ページ閲覧" value={provenanceViews} sub={`実訪問者 ${uniqueVisitors} 人`} />
          </div>
        </section>

        {/* 成約一覧 */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            成約一覧（{deals.length}件）
          </p>
          {deals.length === 0 ? (
            <div className="border px-4 py-12 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだ成約はありません。</p>
              <Link href="/admin/deals/new" className="mt-4 inline-block border px-4 py-2 text-xs" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                最初の成約を記録する
              </Link>
            </div>
          ) : (
            <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    {['日付', '素材', '買い手', '提供元', '金額', '手数料', '送金', '経路', 'ステータス', ''].map((h, i) => (
                      <th key={h || `c${i}`} className="text-left px-3 py-3 text-[10px] tracking-widest font-normal whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d, i) => (
                    <tr key={d.id} className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)' }}>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {new Date(d.created_at).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-3 py-3 font-serif" style={{ color: 'var(--text)' }}>{d.materials?.name ?? '—'}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{d.buyer_profiles?.display_name ?? '—'}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{d.supplier_profiles?.display_name ?? '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text)' }}>{yen(d.amount)}</td>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--accent)' }}>{yen(d.commission_amount)}</td>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{yen(d.payout_amount)}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{d.origin === 'instant' ? '即成約' : '相談'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                          {STATUS_LABEL[d.status] ?? d.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <DeleteDealButton id={d.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 需要（欲しい素材リクエスト） */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            需要 — 欲しい素材リクエスト（{requests.length}件）
          </p>
          {requests.length === 0 ? (
            <div className="border px-4 py-10 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだリクエストはありません。</p>
            </div>
          ) : (
            <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    {['日付', '探している素材', '詳細', '連絡先', '買い手', '状態'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] tracking-widest font-normal whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={r.id} className="border-b align-top" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)' }}>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-3 py-3 font-serif" style={{ color: 'var(--text)', minWidth: 160 }}>{r.query}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)', maxWidth: 260 }}>{r.note ?? '—'}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{r.contact ?? (r.buyer_profiles ? '（会員）' : '—')}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{r.buyer_profiles?.display_name ?? '匿名'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                          {r.status === 'matched' ? 'マッチ' : r.status === 'closed' ? '完了' : '募集中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 来歴ページ：素材別の閲覧 */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            来歴ページ — 素材別の閲覧（延べ {provenanceViews} / 実訪問者 {uniqueVisitors} 人）
          </p>
          {materialRanking.length === 0 ? (
            <div className="border px-4 py-10 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだ閲覧はありません。</p>
            </div>
          ) : (
            <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    {['素材', '実訪問者', '延べ閲覧'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] tracking-widest font-normal whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materialRanking.map((m, i) => (
                    <tr key={m.display} className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)' }}>
                      <td className="px-3 py-3 font-serif" style={{ color: 'var(--text)' }}>{m.display}</td>
                      <td className="px-3 py-3" style={{ color: 'var(--accent)' }}>{m.visitors.size} 人</td>
                      <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{m.total} 回</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 会員による来歴閲覧（実名で追える） */}
        {memberViews.length > 0 && (
          <section>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              会員による来歴閲覧（{memberViews.length}件）
            </p>
            <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    {['日時', '会員', '見た素材'].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] tracking-widest font-normal whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {memberViews.map((v, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)' }}>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {new Date(v.created_at).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-3 py-3" style={{ color: 'var(--text)' }}>{v.payload?.buyer_name}</td>
                      <td className="px-3 py-3 font-serif" style={{ color: 'var(--text-muted)' }}>{v.payload?.display_id ?? v.subject_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
