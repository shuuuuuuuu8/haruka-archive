'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Explorer' },
  { href: '/collections', label: 'Collections' },
  { href: '/institutional', label: 'Institutional' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-30 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(245, 241, 234, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none">
          <span
            className="text-xl font-serif font-light tracking-widest"
            style={{ color: 'var(--text)' }}
          >
            Haruka Archive
          </span>
          <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'var(--text-muted)' }}>
            合同会社遙
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-xs tracking-widest uppercase transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: 'var(--text-muted)' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <ul className="flex flex-col px-6 py-4 gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs tracking-widest uppercase block"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
