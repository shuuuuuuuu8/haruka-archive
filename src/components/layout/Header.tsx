'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'

const NAV = [
  { href: '/materials', label: '素材を探す' },
  { href: '/partners', label: '提供元' },
  { href: '/inquiry', label: '相談する' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b transition-colors"
      style={{
        backgroundColor: scrolled ? 'rgba(255,253,248,0.96)' : 'rgba(255,253,248,0.92)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-col">
          <span className="font-serif text-lg font-medium tracking-[0.18em]" style={{ color: 'var(--text)' }}>
            遙 素材バンク
          </span>
          <span className="hidden text-[10px] tracking-[0.24em] uppercase sm:block" style={{ color: 'var(--text-muted)' }}>
            Haruka Material Bank
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs tracking-[0.16em] transition-colors"
              style={{ color: isActive(href) ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/materials"
          className="hidden items-center gap-2 px-4 py-2 text-xs tracking-[0.14em] text-white md:flex"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Search size={14} />
          検索
        </Link>

        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="メニュー"
          style={{ color: 'var(--text)' }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t md:hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="border-b py-3 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
