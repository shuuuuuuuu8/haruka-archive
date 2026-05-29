'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState<'register' | 'explore' | null>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: '#0d0c0a', cursor: 'none' }}
      onMouseMove={handleMouseMove}
    >
      {/* カスタムカーソル */}
      <div
        className="pointer-events-none fixed z-50 h-2 w-2 rounded-full"
        style={{
          left: `${mouse.x * 100}%`,
          top: `${mouse.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: hovered ? 'rgba(143,63,43,0.9)' : 'rgba(255,255,255,0.8)',
          transition: 'background-color 0.3s, transform 0.1s',
          boxShadow: hovered ? '0 0 20px rgba(143,63,43,0.6)' : '0 0 12px rgba(255,255,255,0.4)',
        }}
      />
      <div
        className="pointer-events-none fixed z-40 rounded-full border"
        style={{
          left: `${mouse.x * 100}%`,
          top: `${mouse.y * 100}%`,
          width: hovered ? '64px' : '40px',
          height: hovered ? '64px' : '40px',
          transform: 'translate(-50%, -50%)',
          borderColor: hovered ? 'rgba(143,63,43,0.5)' : 'rgba(255,255,255,0.2)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 背景の流れる縦線 */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-px"
          style={{
            left: `${(i + 1) * (100 / 13)}%`,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.03)',
            transform: `scaleY(${loaded ? 1 : 0})`,
            transformOrigin: 'top',
            transition: `transform ${0.8 + i * 0.06}s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        />
      ))}

      {/* ロゴ */}
      <div
        className="absolute left-8 top-8 z-20"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}
      >
        <p className="font-serif text-lg font-medium text-white" style={{ letterSpacing: '0.15em' }}>
          結
        </p>
        <p className="mt-0.5 text-[9px] tracking-[0.35em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          MUSUBI MATERIAL BANK
        </p>
      </div>

      {/* 年号 */}
      <div
        className="absolute right-8 top-8 z-20 text-right"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
        }}
      >
        <p className="text-[9px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          EST. 2026
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 大見出し */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
          }}
        >
          <p className="mb-3 text-[10px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            伝統工芸の素材を、未来へ結ぶ
          </p>
          <h1
            className="font-serif text-6xl font-medium text-white sm:text-7xl lg:text-8xl"
            style={{ letterSpacing: '0.05em', lineHeight: 1.1 }}
          >
            素材バンク
          </h1>
        </div>

        {/* 2択ボタン */}
        <div
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s',
          }}
        >
          {/* 素材を登録する */}
          <a
            href="https://musubi-sozai-gott.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden"
            style={{ cursor: 'none' }}
            onMouseEnter={() => setHovered('register')}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="relative border px-10 py-7 transition-all duration-500"
              style={{
                borderColor: hovered === 'register' ? 'rgba(143,63,43,0.8)' : 'rgba(255,255,255,0.15)',
                backgroundColor: hovered === 'register' ? 'rgba(143,63,43,0.15)' : 'transparent',
              }}
            >
              {/* スライドイン背景 */}
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                  backgroundColor: 'rgba(143,63,43,0.08)',
                  transform: hovered === 'register' ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />
              <div className="relative">
                <p className="mb-1 text-[9px] tracking-[0.4em]" style={{ color: hovered === 'register' ? 'rgba(200,100,70,0.8)' : 'rgba(255,255,255,0.3)' }}>
                  FOR SUPPLIERS
                </p>
                <p className="font-serif text-2xl font-medium text-white sm:text-3xl" style={{ letterSpacing: '0.06em' }}>
                  素材を登録する
                </p>
                <p
                  className="mt-3 text-xs leading-6 transition-all duration-400"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    maxHeight: hovered === 'register' ? '60px' : '0',
                    opacity: hovered === 'register' ? 1 : 0,
                    overflow: 'hidden',
                  }}
                >
                  眠っている着物・帯・反物を<br />作り手へ届けましょう
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-px transition-all duration-500"
                    style={{
                      width: hovered === 'register' ? '32px' : '16px',
                      backgroundColor: hovered === 'register' ? 'rgba(200,100,70,0.8)' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                  <p className="text-[10px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    ENTER
                  </p>
                </div>
              </div>
            </div>
          </a>

          {/* 仕切り */}
          <div className="flex items-center justify-center">
            <div className="h-px w-8 sm:h-16 sm:w-px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* 素材を探す */}
          <Link
            href="/materials"
            className="group relative overflow-hidden"
            style={{ cursor: 'none' }}
            onMouseEnter={() => setHovered('explore')}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="relative border px-10 py-7 transition-all duration-500"
              style={{
                borderColor: hovered === 'explore' ? 'rgba(200,190,170,0.6)' : 'rgba(255,255,255,0.15)',
                backgroundColor: hovered === 'explore' ? 'rgba(255,255,255,0.05)' : 'transparent',
              }}
            >
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  transform: hovered === 'explore' ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />
              <div className="relative">
                <p className="mb-1 text-[9px] tracking-[0.4em]" style={{ color: hovered === 'explore' ? 'rgba(200,190,170,0.8)' : 'rgba(255,255,255,0.3)' }}>
                  FOR CREATORS
                </p>
                <p className="font-serif text-2xl font-medium text-white sm:text-3xl" style={{ letterSpacing: '0.06em' }}>
                  素材を探す
                </p>
                <p
                  className="mt-3 text-xs leading-6 transition-all duration-400"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    maxHeight: hovered === 'explore' ? '60px' : '0',
                    opacity: hovered === 'explore' ? 1 : 0,
                    overflow: 'hidden',
                  }}
                >
                  反物・帯地・古布など<br />各地の素材バンクを検索できます
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className="h-px transition-all duration-500"
                    style={{
                      width: hovered === 'explore' ? '32px' : '16px',
                      backgroundColor: hovered === 'explore' ? 'rgba(200,190,170,0.8)' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                  <p className="text-[10px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    ENTER
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 底部ライン */}
      <div
        className="absolute bottom-0 left-0 h-px"
        style={{
          width: loaded ? '100%' : '0%',
          backgroundColor: 'rgba(255,255,255,0.06)',
          transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1) 1s',
        }}
      />
      <div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease 1.4s',
        }}
      >
        <p className="text-[9px] tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
          © 2026 MUSUBI MATERIAL BANK
        </p>
      </div>
    </div>
  )
}
