'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Package, Users, MessageSquare, ExternalLink, ChevronDown } from 'lucide-react'
import { MATERIALS, PARTNERS } from '@/lib/data'
import type { MaterialStatus } from '@/types/material'

const STATUS_COLORS: Record<MaterialStatus, { bg: string; text: string; label: string }> = {
  public: { bg: '#E8F5E0', text: '#4A7A3A', label: '公開中' },
  negotiating: { bg: '#FFF3E0', text: '#B36A00', label: '商談中' },
  checking: { bg: '#E3F2FD', text: '#1565C0', label: '確認中' },
  low_stock: { bg: '#FDE8E8', text: '#C0392B', label: '残りわずか' },
  private: { bg: '#F0EDE8', text: '#7A7160', label: '非公開' },
}

const STATUS_ORDER: MaterialStatus[] = ['public', 'negotiating', 'checking', 'low_stock', 'private']

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-5 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <p className="text-[10px] tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-serif font-light" style={{ color: 'var(--accent)' }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<MaterialStatus | 'all'>('all')

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = MATERIALS.filter((m) => m.status === s).length
    return acc
  }, {} as Record<MaterialStatus, number>)

  const displayed = statusFilter === 'all' ? MATERIALS : MATERIALS.filter((m) => m.status === statusFilter)

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* ページヘッダー */}
      <div className="border-b pt-20 pb-6 px-4 sm:px-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent)' }}>Admin</p>
            <h1 className="text-2xl font-serif font-light flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <LayoutDashboard size={20} style={{ color: 'var(--accent)' }} />
              管理ダッシュボード
            </h1>
          </div>
          <div className="text-[10px] px-3 py-1.5 border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--accent-pale)' }}>
            モックUI（実データなし）
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* 統計カード */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="総素材数" value={MATERIALS.length} sub="件" />
            <StatCard label="提携老舗" value={PARTNERS.length} sub="社" />
            <StatCard label="公開中" value={counts.public} />
            <StatCard label="商談中" value={counts.negotiating} />
            <StatCard label="確認中" value={counts.checking} />
            <StatCard label="非公開" value={counts.private} />
          </div>
        </section>

        {/* ステータス別サマリー */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>Status Summary</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className="px-3 py-1.5 text-[11px] tracking-wider border transition-colors"
              style={{
                borderColor: statusFilter === 'all' ? 'var(--accent)' : 'var(--border)',
                backgroundColor: statusFilter === 'all' ? 'var(--accent-pale)' : 'transparent',
                color: statusFilter === 'all' ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              すべて ({MATERIALS.length})
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 text-[11px] tracking-wider border transition-colors"
                style={{
                  borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: statusFilter === s ? 'var(--accent-pale)' : 'transparent',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {STATUS_COLORS[s].label} ({counts[s]})
              </button>
            ))}
          </div>
        </section>

        {/* 素材一覧テーブル */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            Material List ({displayed.length}件)
          </p>
          <div className="border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  {['ID', '素材名', 'カテゴリ', '産地', '数量', 'ステータス', '最終更新', '操作'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest font-normal" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((m, i) => {
                  const sc = STATUS_COLORS[m.status]
                  const date = new Date(m.updatedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
                  return (
                    <tr
                      key={m.id}
                      className="border-b transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-pale)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = i % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)' }}
                    >
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-muted)' }}>{m.id}</td>
                      <td className="px-4 py-3 font-serif" style={{ color: 'var(--text)' }}>{m.name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.category}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.origin}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.quantity}{m.quantityUnit}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{date}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/materials/${m.id}`}
                          className="inline-flex items-center gap-1 text-[10px] tracking-wider transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          表示 <ExternalLink size={10} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* パートナー一覧 */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            Partner Suppliers ({PARTNERS.length}社)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNERS.map((p) => (
              <div key={p.id} className="p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-[9px] tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>{p.id}</p>
                    <p className="font-serif text-sm font-light" style={{ color: 'var(--text)' }}>{p.name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: 'var(--accent-pale)', color: 'var(--accent)' }}>
                    {p.materialCount}点
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.location}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.speciality}</p>
              </div>
            ))}
          </div>
        </section>

        {/* クイックアクション */}
        <section>
          <p className="text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: '/materials', icon: <Package size={16} />, label: '素材一覧を見る', desc: '公開中の素材を確認' },
              { href: '/partners', icon: <Users size={16} />, label: 'パートナー一覧', desc: '提携老舗を確認' },
              { href: '/inquiry', icon: <MessageSquare size={16} />, label: 'お問い合わせ', desc: '相談フォームを確認' },
            ].map(({ href, icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-4 border transition-colors"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <span style={{ color: 'var(--accent)' }}>{icon}</span>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
