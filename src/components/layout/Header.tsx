'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Menu, Search, UserRound, X } from 'lucide-react'
import { createBuyerClient } from '@/lib/buyer/client'

const NAV = [
  { href: '/materials', label: '素材を探す' },
  { href: '/partners', label: '提供元' },
  { href: '/inquiry', label: '相談する' },
  { href: '/about', label: '素材バンク' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [buyerName, setBuyerName] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  // 買い手のログイン状態を取得（MUSUBI Supabase）
  useEffect(() => {
    const supabase = createBuyerClient()
    const read = (user: { user_metadata?: Record<string, unknown>; email?: string } | null) => {
      if (!user) { setBuyerName(null); return }
      const meta = user.user_metadata ?? {}
      setBuyerName((meta.display_name as string) ?? user.email?.split('@')[0] ?? 'アカウント')
    }
    supabase.auth.getUser().then(({ data }) => read(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => read(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createBuyerClient()
    await supabase.auth.signOut()
    setBuyerName(null)
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const isHome = pathname === '/'
  const dark = isHome && !scrolled

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b transition-colors"
      style={{
        backgroundColor: dark ? 'transparent' : (scrolled ? 'rgba(255,253,248,0.96)' : 'rgba(255,253,248,0.92)'),
        borderColor: dark ? 'transparent' : 'var(--border)',
        backdropFilter: dark ? 'none' : 'blur(14px)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-col">
          <span
            className="font-serif text-lg font-medium tracking-[0.18em]"
            style={{ color: dark ? 'rgba(255,255,255,0.85)' : 'var(--text)', transition: 'color 0.4s ease' }}
          >
            結 素材バンク
          </span>
          <span
            className="hidden text-[10px] tracking-[0.24em] uppercase sm:block"
            style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'var(--text-muted)', transition: 'color 0.4s ease' }}
          >
            Musubi Material Bank
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs tracking-[0.16em] transition-colors"
              style={{
                color: isActive(href)
                  ? (dark ? 'rgba(255,255,255,0.9)' : 'var(--accent)')
                  : (dark ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)'),
                transition: 'color 0.4s ease',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/materials"
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-[0.14em] text-white transition-colors"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'var(--accent)', transition: 'background-color 0.4s ease' }}
          >
            <Search size={14} />
            検索
          </Link>

          {buyerName ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.8)' : 'var(--text)' }}>
                <UserRound size={14} />
                {buyerName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}
                aria-label="ログアウト"
              >
                <LogOut size={13} />
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href={`/account/login?next=${encodeURIComponent(pathname)}`}
              className="text-xs tracking-[0.14em] transition-opacity hover:opacity-70"
              style={{ color: dark ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}
            >
              ログイン
            </Link>
          )}
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="メニュー"
          style={{ color: dark ? 'rgba(255,255,255,0.7)' : 'var(--text)', transition: 'color 0.4s ease' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="border-t md:hidden"
          style={{
            borderColor: dark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
            backgroundColor: dark ? 'rgba(6,5,4,0.96)' : 'var(--bg-card)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="border-b py-3 text-sm"
                style={{
                  borderColor: dark ? 'rgba(255,255,255,0.08)' : 'var(--border)',
                  color: dark ? 'rgba(255,255,255,0.75)' : 'var(--text)',
                }}
              >
                {label}
              </Link>
            ))}
            {buyerName ? (
              <div className="flex items-center justify-between py-3">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: dark ? 'rgba(255,255,255,0.85)' : 'var(--text)' }}>
                  <UserRound size={15} />
                  {buyerName}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
                  <LogOut size={13} />
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href={`/account/login?next=${encodeURIComponent(pathname)}`}
                className="py-3 text-sm"
                style={{ color: dark ? 'rgba(255,255,255,0.85)' : 'var(--accent)' }}
              >
                ログイン / 新規登録
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
